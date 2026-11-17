# Backend — Architecture & Reference

> File này bổ sung cho `README.md` (ghi chú gốc của tác giả), không thay thế nó.
> `README.md` = ghi chú nhanh + format request/response của các API chính.
> File này = bức tranh toàn cảnh: kiến trúc, data model, phân quyền, danh sách endpoint đầy đủ, nghiệp vụ, và các điểm cần lưu ý.

**Stack:** Node.js (CommonJS) · Express 5 · Sequelize 6 + MySQL 8 · Redis · Awilix (DI) · JWT · Multer · Winston + Morgan · node-schedule.

---

## 1. Tính năng

| Nhóm | Mô tả |
|---|---|
| Auth | Đăng ký / đăng nhập / refresh (rotate token) / logout. Access + refresh JWT, refresh lưu ở bảng `auth_sessions`. |
| RBAC | Role ↔ permission (slug `resource:action`), cache quyền trong Redis, superadmin bypass toàn bộ. |
| Quiz | Subject → Chapter → Question (+ Option) CRUD, xoá mềm + restore, tìm kiếm phân trang. |
| Làm bài | `start` → lưu đáp án từng câu → `submit` (chấm điểm ngay) → xem lại `grade`. Mode `exam`/`practice`, paging theo cụm câu, đảo câu/đảo đáp án, hẹn giờ hết hạn. |
| Auto-submit | Job mỗi 60 giây tự nộp các attempt quá hạn (bật bằng `AUTO_SUBMIT_ENABLED=true`). |
| Import câu hỏi | Upload file Kahoot / Quizizz (`.xlsx`, `.xls`, `.csv`, `.json`), tự nhận dạng format theo header. |
| Flashcard | Deck (private/public) + card CRUD. |
| Typing | Bài luyện gõ + kết quả (wpm/accuracy/errorTags) + leaderboard. Có endpoint proxy gọi service AI bên ngoài để tóm tắt văn bản. |

---

## 2. Chạy project

### 2.1. Docker (khuyến nghị)

```bash
docker compose up --build
```

Thứ tự khởi động: `mysql` (3306) → `redis` (6379) → `backend` (5000) → `frontend` (5173).
Container backend chạy `npm run seed:system && npm run dev`, source được mount từ `./backend` nên sửa file là nodemon reload.

Cần 2 file env (đang bị gitignore, phải tự tạo):

`/.env` — cho service mysql:

```env
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=examdb
MYSQL_USER=quizuser
MYSQL_PASSWORD=quizpass
```

`/backend/.env` — cho container backend. Compose nạp file này qua `env_file:` rồi **ghi đè** `DB_HOST`/`REDIS_HOST`/`DB_USER`/`DB_PASS` bằng block `environment:` (vì trong Docker network, `localhost` là chính container backend chứ không phải MySQL).

Chi tiết đầy đủ về file env nào được đọc khi nào: xem mục **"Các file env"** ở cuối `README.md`.

### 2.2. Local

```bash
cd backend
npm install
# cần MySQL + Redis chạy sẵn, cấu hình trong backend/.env
npm run seed:system   # permission + role hệ thống + user superadmin
npm run dev           # nodemon src/server.js
```

`src/server.js` khi boot: `sequelize.authenticate()` → `sequelize.sync({ alter: false })` (tạo bảng nếu chưa có) → `app.listen` → bật job auto-submit nếu được cấu hình.

### 2.3. Biến môi trường

| Biến | Bắt buộc | Mặc định | Dùng ở đâu |
|---|---|---|---|
| `PORT` | không | `5000` | `server.js` |
| `DB_NAME`, `DB_USER`, `DB_PASS` | có | — | `infrastructure/database/config/db.js` |
| `DB_HOST`, `DB_PORT` | không | `localhost`, `3306` | nt |
| `JWT_ACCESS_SECRET` | có | — | ký + verify access token |
| `JWT_REFRESH_SECRET` | có | — | ký refresh token |
| `ACCESS_TOKEN_EXPIRES` | có | — | thời hạn access token (ví dụ `15m`) |
| `REFRESH_TOKEN_EXPIRES` | có | — | số **ngày** của refresh token (được `parseInt` để tính `expiresAt`) |
| `REDIS_HOST`, `REDIS_PORT` | không | `127.0.0.1`, `6379` | cache quyền |
| `AUTO_SUBMIT_ENABLED` | không | `false` | bật job auto-submit |
| `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD` | có (khi seed) | — | `SeedSystemData` |

---

## 3. Kiến trúc

### 3.1. Các tầng

```
interfaces/      → HTTP: routes, controllers, middlewares
usecases/        → nghiệp vụ (1 class = 1 hành động, method execute())
domain/          → entities (validate + logic nhỏ) & constants (enum, permission slug)
infrastructure/  → database (models), repositories, mappers, cache, jobs, services, utils, unitOfWork
container.js     → đăng ký & resolve toàn bộ dependency (Awilix)
```

Luồng request:

```
Request
  → routes/*.js           khai báo path + middleware (auth, permission, upload)
  → controllers/*.js      đọc req, gọi 1 usecase, trả res (try/catch tại đây)
  → usecases/*/*.js       kiểm tra nghiệp vụ, gọi repository, quyết định transaction
  → repositories/*.js     truy vấn qua Sequelize model, map sang domain entity
  → mappers/*.js          toDomain(model) / toPersistence(entity)
  → models/*.js           định nghĩa bảng + association
```

Chiều ghi dữ liệu: usecase tạo/cập nhật **domain entity** → repository → model. Vì mọi model kế thừa `BaseModel`, `createdBy`/`updatedBy`/`isDeleted` được xử lý tự động.

### 3.2. Dependency Injection (`src/container.js`)

Mọi thứ được đăng ký trong Awilix container, resolve theo tên camelCase:

- Repository / usecase / controller: `.singleton()`
- `unitOfWork` và các usecase có ghi dữ liệu attempt (`startAttempt`, `saveAnswer`, `submitAttempt`, `hardDeleteAttempt`, `hardDeleteTypingText`): `.scoped()` — mỗi scope một transaction riêng.

Route lấy controller bằng `container.resolve('subjectController')`.

> **Quên đăng ký trong `container.js` là lỗi phổ biến nhất khi thêm usecase mới** — sẽ lỗi ngay lúc resolve.

Job auto-submit tự tạo scope con cho từng attempt: `container.createScope()` → `resolve('submitAttempt')`.

### 3.3. Base classes

| Class | Cho sẵn |
|---|---|
| `BaseEntity` | `id`, `createdAt/updatedAt`, `createdBy/updatedBy`, `isDeleted` |
| `BaseModel` | cột `id` UUID v4, `createdBy`, `updatedBy`, `isDeleted` + hook tự gán audit theo `AsyncLocalStorage` |
| `BaseRepository` | `findAll`, `findById`, `create`, `update`, `softDelete`, `restore`, `hardDelete`, `hardDeleteWhere`, `findWithPagination`; tự lọc `isDeleted` (override bằng `includeDeleted` / `onlyDeleted`) |
| `BaseMapper` | `toDomain(model)` → `new EntityClass(data)`, và `toPersistence(entity)` |

`findWithPagination` trả đúng shape frontend đang dùng:

```json
{ "data": [], "totalItems": 0, "totalPages": 0, "currentPage": 1, "itemsPerPage": 10 }
```

### 3.4. Transaction — `unitOfWork`

```js
await this.unitOfWork.start();
try {
  await this.attemptRepository.create(payload, userId, this.unitOfWork.getTx());
  await this.unitOfWork.commit();
} catch (err) {
  await this.unitOfWork.rollback();
  throw err;
}
```

`getTx()` trả `{ transaction }` để truyền vào options của Sequelize. Vì `unitOfWork` là **scoped**, usecase nào dùng transaction cũng phải đăng ký `.scoped()`.

### 3.5. Audit context (`AsyncLocalStorage`)

`contextMiddleware` chạy sau auth, lưu `{ userId }` vào `infrastructure/context/storage.js`. Hook `beforeCreate`/`beforeUpdate` của `BaseModel` đọc store này để tự set `createdBy`/`updatedBy`.

### 3.6. Quy ước response & lỗi

Hai kiểu response tồn tại song song:

- **Auth**: có envelope → `{ success, message?, data? }`
- **Các resource khác**: trả thẳng payload của usecase; lỗi là `{ message }`

Mã trạng thái: `200` đọc/update, `201` tạo mới, `204` xoá mềm; riêng hard delete trả `200 { success: true }`.

- **Không có global error handler.** Mọi controller tự `try/catch`. Lỗi phát sinh ngoài try/catch của controller (ví dụ multer chặn file sai định dạng hoặc quá 5MB ở `POST /api/questions/import`) rơi vào handler mặc định của Express → trả **HTML** chứ không phải JSON.
- **Không có middleware validation.** Validate nằm trong usecase và trong constructor của entity (`entity.validate()`); controller chỉ kiểm tra sơ bộ (ví dụ `req.file`).

---

## 4. Data model

ERD gốc: `src/domain/entities/model.txt` (dbdiagram). Bảng thật do Sequelize tạo, **không dùng migration**.

| Nhóm | Bảng |
|---|---|
| RBAC | `users`, `roles`, `permissions`, `user_roles`, `role_permissions` |
| Auth | `auth_sessions` (refreshToken, userAgent, ip, expiresAt, revokedAt), `audit_logs` (chưa dùng) |
| Học liệu | `subjects` → `chapters` → `questions` → `options` |
| Làm bài | `attempts` → `attempt_questions` (optionOrder, pageIndex), `answers` (selectedOptionIds, value, isCorrect, earnedPoints, flagged), `result_summaries` (correct/wrong/blank, rank) |
| Flashcard | `flashcard_decks` → `flashcards` (frontText, backText, order, nextReview) |
| Typing | `typing_texts` (authorId, content, isPublic, isDefault, difficulty, sourceType), `typing_results` (wpm, accuracy, rawWpm, durationSeconds, errorTags) |

Enum nghiệp vụ (`src/domain/constants/`):

- `questions_type_enum`: `single`, `multiple`, `true_false`, `fill_blank`
- `attempts_mode_enum`: `exam`, `practice`
- `attempts_status_enum`: `draft`, `in_progress`, `submitted`, `expired`, `graded`
- `typing_text_type_enum`: `manual`, `ai_summary`, `pdf`, `docx`

Mọi bảng đều có `id` (UUID), `createdBy`, `updatedBy`, `isDeleted`, `createdAt`, `updatedAt`.

---

## 5. Auth & phân quyền

### 5.1. Chain middleware

`src/interfaces/routes/index.js`:

```
/api/auth/*    → public (mount TRƯỚC authMiddleware)
/api/*         → authMiddleware (verify Bearer JWT) → contextMiddleware → các router còn lại
```

`authMiddleware` set `req.user = { id, roles }` lấy từ payload JWT (`{ id, name, roles }`).

| Guard | Cách hoạt động |
|---|---|
| `requiredRole(...roles)` | So khớp `req.user.roles`. **Hiện chưa route nào dùng** (chỉ import thừa ở `userRoutes.js`). |
| `requiredPermission(slug)` | Role `superadmin` bypass. Ngược lại đọc cache Redis `user_permissions:<userId>` (TTL 600s); cache miss thì query qua `UserRepository.getPermissionSlugs` rồi ghi lại. Nếu danh sách chứa cờ `"all"` (`ALL_PERMISSIONS_FLAG`) cũng cho qua. |

Cache quyền bị xoá khi: gán/gỡ permission cho role (`delPattern('user_permissions:*')`), gán/gỡ role cho user, xoá/restore role.

### 5.2. Luồng token

1. `POST /api/auth/login` → verify mật khẩu (bcrypt), cập nhật `lastLoginAt`, load role của user → ký cặp access/refresh → tạo row `auth_sessions` → trả `{ user, accessToken, refreshToken }`.
2. `POST /api/auth/refresh` → tìm session theo refresh token, kiểm tra chưa revoke và chưa hết hạn → ký cặp token mới → **rotate** refresh token trong session cũ.
3. `POST /api/auth/logout` → revoke session (idempotent).

### 5.3. Seed (`npm run seed:system`)

`usecases/base/SeedSystemData.js`:

1. Upsert toàn bộ permission slug trong `domain/constants/permissions.js` vào bảng `permissions` (name = "Resource Action").
2. Đảm bảo role `superadmin` + 3 role nền `admin`, `teacher`, `student` tồn tại (nếu đang bị xoá mềm thì restore).
3. Gán **toàn bộ** permission cho role `superadmin`.
4. Tạo user superadmin theo `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` và gán role `superadmin`.

User đăng ký qua `/auth/register` được gán role `student`.

### 5.4. Danh sách permission slug

```
user:view  user:create  user:update  user:delete
subject:view  subject:create  subject:update  subject:delete
chapter:view  chapter:create  chapter:update  chapter:delete
question:view  question:create  question:update  question:delete   (dùng luôn cho /options)
attempt:view  attempt:create  attempt:submit  attempt:delete
flashcard_deck:view  flashcard_deck:create  flashcard_deck:update  flashcard_deck:delete
flashcard:view  flashcard:create  flashcard:update  flashcard:delete
typing_text:view  typing_text:create  typing_text:update  typing_text:delete
typing_result:view  typing_result:create  typing_result:delete
role:manage   permission:manage
```

---

## 6. API reference

Tất cả endpoint đều cần header `Authorization: Bearer <accessToken>`, trừ `/api/auth/*`.
Cột **Quyền** = slug truyền vào `requiredPermission`.

### 6.1. Auth (public)

| Method | URL | Body | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | Đăng ký, gán role `student`. Trả `{ success, message, data: { id, name, email, status } }` |
| POST | `/api/auth/login` | `{ email, password }` | Trả `{ success, message, data: { user, accessToken, refreshToken } }` |
| POST | `/api/auth/refresh` | `{ refreshToken }` | Trả cặp token mới |
| POST | `/api/auth/logout` | `{ refreshToken }` | Revoke session |

### 6.2. Users — `/api/users`

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/users` | `user:view` | Danh sách user (kèm role), hỗ trợ `?search=` |
| GET | `/api/users/me` | *(chỉ cần token)* | Thông tin user hiện tại |
| POST | `/api/users` | `user:create` | Tạo user (mật khẩu mặc định `123456` nếu không truyền) |
| PUT | `/api/users/:id` | `user:update` | Cập nhật, chặn trùng email |
| DELETE | `/api/users/:id` | `user:delete` | Xoá mềm (204) |

### 6.3. Roles — `/api/roles`

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/roles` | `role:manage` | Danh sách role (`?search=`, `?includeDeleted=`, `?onlyDeleted=`) |
| POST | `/api/roles` | `role:manage` | Tạo role |
| GET | `/api/roles/:id` | `role:manage` | Chi tiết role |
| PUT | `/api/roles/:id` | `role:manage` | Cập nhật role |
| PATCH | `/api/roles/:id/restore` | `role:manage` | Restore role |
| DELETE | `/api/roles/:id` | `role:manage` | Xoá mềm (204) |
| GET | `/api/roles/:id/permissions` | `role:manage` | Permission của role |
| POST | `/api/roles/:id/permissions` | `permission:manage` | Gán permission — body `{ permissionId }` |
| DELETE | `/api/roles/:id/permissions` | `permission:manage` | Gỡ permission — body `{ permissionId }` |
| POST | `/api/roles/:id/users` | `role:manage` | Gán role cho user — body `{ userId }` |
| DELETE | `/api/roles/:id/users/:userId` | `role:manage` | Gỡ role khỏi user |
| GET | `/api/roles/users/:userId/roles` | `role:manage` | Role của một user |

### 6.4. Permissions — `/api/permissions`

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/permissions` | `permission:manage` | Toàn bộ permission (dữ liệu seed sẵn) |

### 6.5. Subjects — `/api/subjects`

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/subjects` | `subject:view` | Danh sách (`?includeDeleted=`, `?onlyDeleted=`) |
| GET | `/api/subjects/search` | `subject:view` | `search`, `page`, `limit`, `order` (`order`/`name`/`newest`/`oldest`) |
| GET | `/api/subjects/:id` | `subject:view` | Chi tiết |
| POST | `/api/subjects` | `subject:create` | Tạo — name ≥ 2 ký tự, `slug` khớp `^[a-z0-9-]+$`, không trùng slug |
| PUT | `/api/subjects/:id` | `subject:update` | Cập nhật |
| PATCH | `/api/subjects/:id/restore` | `subject:update` | Restore |
| DELETE | `/api/subjects/:id` | `subject:delete` | Xoá mềm (204) |

### 6.6. Chapters — `/api/chapters`

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/chapters` | `chapter:view` | Danh sách (`?includeDeleted=`, `?onlyDeleted=`) |
| GET | `/api/chapters/search` | `chapter:view` | `search`, `subjectId`, `page`, `limit`, `order` |
| GET | `/api/chapters/subject/:subjectId` | `chapter:view` | Chapter theo subject |
| GET | `/api/chapters/:id` | `chapter:view` | Chi tiết |
| GET | `/api/chapters/:id/questions/count` | `chapter:view` | `{ chapterId, totalQuestions }` — dùng cho màn cấu hình bài thi |
| POST | `/api/chapters` | `chapter:create` | Tạo |
| PUT | `/api/chapters/:id` | `chapter:update` | Cập nhật |
| PATCH | `/api/chapters/:id/restore` | `chapter:update` | Restore |
| DELETE | `/api/chapters/:id` | `chapter:delete` | Xoá mềm (204) |

### 6.7. Questions — `/api/questions`

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/questions` | `question:view` | Danh sách (`?includeDeleted=`, `?onlyDeleted=`) |
| GET | `/api/questions/search` | `question:view` | `search`, `subjectId`, `chapterId`, `type`, `difficulty`, `page`, `limit`, `order` |
| GET | `/api/questions/subject/:subjectId` | `question:view` | Theo subject |
| GET | `/api/questions/chapter/:chapterId` | `question:view` | Theo chapter |
| GET | `/api/questions/:id` | `question:view` | Chi tiết |
| POST | `/api/questions` | `question:create` | Tạo câu hỏi (không kèm option) |
| POST | `/api/questions/with-options` | `question:create` | Tạo câu hỏi + options trong **1 transaction** (frontend đang dùng cái này) |
| POST | `/api/questions/batch` | `question:create` | Tạo nhiều câu hỏi — xem format bên dưới |
| POST | `/api/questions/import` | `question:create` | `multipart/form-data`: `file` (CSV/XLSX/XLS/JSON ≤ 5MB) + `subjectId` + `chapterId` + `fileType?` |
| PUT | `/api/questions/:id` | `question:update` | Cập nhật |
| PATCH | `/api/questions/:id/restore` | `question:update` | Restore |
| DELETE | `/api/questions/:id` | `question:delete` | Xoá mềm (204) |

#### Batch questions input format

`POST /api/questions/batch`

```json
{
  "mode": "all-or-nothing",
  "subjectId": "uuid-string",
  "chapterId": "uuid-string",
  "type": "single",
  "items": [
    {
      "text": "Nội dung câu hỏi",
      "explanation": "Giải thích (optional)",
      "difficulty": 1,
      "points": 1,
      "media": [],
      "tags": [],
      "options": [
        { "text": "Lựa chọn A", "isCorrect": true, "order": 1, "media": null },
        { "text": "Lựa chọn B", "isCorrect": false, "order": 2 }
      ]
    }
  ]
}
```

- `mode`: `all-or-nothing` (1 item lỗi → huỷ hết, có transaction) hoặc `continue-on-error` (bỏ qua item lỗi).
- `subjectId`, `chapterId` bắt buộc; `type` ở level batch có thể override ở từng item.
- Response: `{ mode, created, errors?, data }`.

#### Import từ Kahoot / Quizizz

`ImportQuestionMapper` tự nhận dạng format theo header dòng đầu:

- **Kahoot**: có `Question`, `Answer 1..4`, `Correct answer(s)` (số thứ tự đáp án đúng, ví dụ `1,3`). Dữ liệu bắt đầu từ **dòng 9** (bỏ 8 dòng đầu của template).
- **Quizizz**: có `Question Type`; đọc `Question Text`, `Option 1..5`, `Correct Answer` (index 1-based), `Answer explanation`, `Image Link`. Dữ liệu bắt đầu từ dòng 2.
- Chỉ nhận `Multiple Choice` / `Checkbox` (đều map về `multiple`), loại khác bị bỏ qua.
- Bỏ qua dòng thiếu text hoặc thiếu đáp án đúng (ghi vào `errors`).
- Response: `{ totalQuestions, importedQuestions, failedQuestions, details, errors? }`.
- Template mẫu nằm ở `backend/public/` và `frontend/public/`.

### 6.8. Options — `/api/options` (dùng chung permission `question:*`)

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/options` | `question:view` | Danh sách |
| GET | `/api/options/question/:questionId` | `question:view` | Option theo câu hỏi |
| GET | `/api/options/:id` | `question:view` | Chi tiết |
| POST | `/api/options` | `question:create` | Tạo — `{ questionId, text, isCorrect, media, order }` |
| PUT | `/api/options/:id` | `question:update` | Cập nhật |
| PATCH | `/api/options/:id/restore` | `question:update` | Restore |
| DELETE | `/api/options/:id` | `question:delete` | Xoá mềm (204) |

### 6.9. Attempts — `/api/attempts`

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/attempts/start` | `attempt:create` | Bắt đầu lượt làm bài mới (201) |
| GET | `/api/attempts/mine` | `attempt:view` | Lịch sử của tôi — `page`, `limit` (≤100), `status` |
| GET | `/api/attempts` | `attempt:view` + role `admin`/`superadmin` | Toàn bộ attempt (check role nằm trong usecase) |
| GET | `/api/attempts/:id` | `attempt:view` | Chi tiết attempt |
| GET | `/api/attempts/:attemptId/questions` | `attempt:view` | Câu hỏi + option theo đúng `optionOrder` đã lưu |
| POST | `/api/attempts/:attemptId/answers` | `attempt:create` | Lưu đáp án 1 câu (upsert) |
| POST | `/api/attempts/:attemptId/submit` | `attempt:submit` | Nộp bài + chấm điểm |
| GET | `/api/attempts/:attemptId/grade` | `attempt:view` | Xem lại bài đã chấm (chỉ khi `status = graded`) |
| DELETE | `/api/attempts/:id/hard` | `attempt:delete` | Xoá cứng (chủ bài hoặc admin/superadmin) |

**Luồng làm bài**

1. `start` → tạo attempt (`status: in_progress`), chọn câu theo `paging`, đảo câu nếu `shuffleQuestions`, đảo option nếu mode `exam` (thứ tự lưu vào `attempt_questions.optionOrder`), tính `maxScore` và `expiresAt`.
2. Mỗi lần chọn đáp án → `POST /api/attempts/:attemptId/answers`.
3. Nộp bài → `submit` (chấm điểm ngay, `status: graded`, upsert `result_summaries`).
4. Xem kết quả → `GET /api/attempts/:attemptId/grade`.

Body của `start`:

```json
{
  "subjectId": "db0ccc85-00d9-435e-8349-06ea5e9684cf",
  "chapterId": "8ddcc047-0b32-4159-ba95-a22a94c2fff9",
  "mode": "exam",
  "settings": {
    "paging": "1-5",
    "questionsPerPage": 10,
    "questionTimeSeconds": 30,
    "showAnswerAfterSelect": true,
    "shuffleQuestions": true
  },
  "durationMinutes": 60
}
```

- `paging` nhận `"X-Y"` hoặc `{ from, to }`; mặc định `1-50` và tự cắt theo số câu thực có.
- `mode: practice` → luôn tắt `shuffleQuestions`; `mode: exam` → luôn tắt `showAnswerAfterSelect`.
- `durationMinutes` không truyền thì tính bằng `số câu × questionTimeSeconds` (tối thiểu 1 phút).
- `showAnswerAfterSelect: true` (chỉ có tác dụng ở mode `practice`) → response của `answers` kèm `correctAnswers`.

Body của `answers` theo loại câu hỏi (`questionId` luôn bắt buộc, `flagged` tuỳ chọn):

```json
{ "questionId": "uuid", "optionId": "uuid", "flagged": true }        // single / true_false
{ "questionId": "uuid", "selectedOptionIds": ["uuid-1", "uuid-2"] }  // multiple
{ "questionId": "uuid", "value": "đáp án điền vào" }                 // fill_blank
```

Chỉ chủ attempt mới thao tác được; attempt đã nộp hoặc quá `expiresAt` sẽ bị từ chối.

**Chấm điểm** (tự động khi submit, chạy trong 1 transaction):

| Loại | Cách chấm |
|---|---|
| `single`, `true_false` | `selectedOptionIds[0]` trùng option đúng |
| `multiple` | Tập option đã chọn phải **khớp chính xác** tập option đúng |
| `fill_blank` | So sánh `value` với `text` của option đúng, không phân biệt hoa/thường, có `trim()` |

Mỗi câu đúng được `question.points`, sai được 0. `score` = tổng điểm. Response: `{ attempt, totalEarnedPoints, maxScore, correctCount, totalCount }`.

**Auto-submit:** `infrastructure/jobs/autoSubmitAttempts.js` chạy mỗi phút, tìm attempt `in_progress` có `expiresAt <= now` và gọi `submitAttempt` cho từng cái (mỗi attempt một scope riêng để không dính transaction của nhau). Chỉ chạy khi `AUTO_SUBMIT_ENABLED=true`.

### 6.10. Flashcard decks — `/api/flashcard-decks`

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/flashcard-decks/mine` | `flashcard_deck:view` | Deck của tôi |
| GET | `/api/flashcard-decks/public` | `flashcard_deck:view` | Deck public |
| GET | `/api/flashcard-decks/:id` | `flashcard_deck:view` | Chi tiết (public hoặc của mình) |
| POST | `/api/flashcard-decks` | `flashcard_deck:create` | Tạo — `{ title, isPublic }`, title ≥ 3 ký tự |
| PUT | `/api/flashcard-decks/:id` | `flashcard_deck:update` | Cập nhật (chỉ chủ deck) |
| DELETE | `/api/flashcard-decks/:id` | `flashcard_deck:delete` | Xoá mềm (204) |

### 6.11. Flashcards — `/api/flashcards`

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/flashcards/deck/:deckId` | `flashcard:view` | Card trong deck (kiểm tra quyền xem deck) |
| GET | `/api/flashcards/:id` | `flashcard:view` | Chi tiết |
| POST | `/api/flashcards` | `flashcard:create` | Tạo — `{ deckId, frontText, backText, order, nextReview }` (chỉ chủ deck) |
| PUT | `/api/flashcards/:id` | `flashcard:update` | Cập nhật (chỉ chủ deck) |
| DELETE | `/api/flashcards/:id` | `flashcard:delete` | Xoá mềm (204) |

### 6.12. Typing texts — `/api/typing-texts`

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/typing-texts/mine` | `typing_text:view` | Bài do tôi tạo |
| GET | `/api/typing-texts/public` | `typing_text:view` | Bài public |
| GET | `/api/typing-texts` | `typing_text:view` | Tất cả (`?includeDeleted=`, `?onlyDeleted=`) |
| GET | `/api/typing-texts/:id` | `typing_text:view` | Chi tiết (public hoặc của mình) |
| POST | `/api/typing-texts` | `typing_text:create` | Tạo — `{ title, content, language, isPublic, difficulty, isDefault, sourceType }` |
| POST | `/api/typing-texts/summarize` | `typing_text:view` | Proxy sang service AI — body `{ baseUrl, text }`, xem ghi chú |
| PUT | `/api/typing-texts/:id` | `typing_text:update` | Cập nhật (chỉ tác giả) |
| PATCH | `/api/typing-texts/:id/restore` | `typing_text:update` | Restore (tác giả hoặc admin/superadmin) |
| DELETE | `/api/typing-texts/:id` | `typing_text:delete` | Xoá mềm (204, chỉ tác giả) |
| DELETE | `/api/typing-texts/:id/hard` | `typing_text:delete` | Xoá cứng text + kết quả liên quan (transaction) |

`POST /api/typing-texts/summarize` gọi `{baseUrl}/summarize`, **bắt buộc host của `baseUrl` thuộc `ngrok-free.app` / `ngrok.io`**, timeout 15s. Lỗi: 400 (thiếu input), 502 (service lỗi), 504 (timeout). Đây là endpoint duy nhất gọi ra ngoài.

### 6.13. Typing results — `/api/typing-results`

| Method | URL | Quyền | Mô tả |
|---|---|---|---|
| GET | `/api/typing-results/mine` | `typing_result:view` | Lịch sử của tôi |
| GET | `/api/typing-results/text/:textId` | `typing_result:view` | Kết quả theo bài (bài phải public hoặc của mình) |
| GET | `/api/typing-results/text/:textId/leaderboard` | `typing_result:view` | Bảng xếp hạng (`?limit=`, mặc định 10, tối đa 100) |
| GET | `/api/typing-results/:id` | `typing_result:view` | Chi tiết (chỉ chủ sở hữu) |
| POST | `/api/typing-results` | `typing_result:create` | Lưu kết quả — `{ textId, wpm, accuracy, rawWpm, durationSeconds, errorTags }` |
| DELETE | `/api/typing-results/:id/hard` | `typing_result:delete` | Xoá cứng (chủ sở hữu hoặc admin/superadmin) |

---

## 7. Vòng đời xoá dữ liệu

- **Xoá mềm** (`DELETE /:resource/:id`) → set `isDeleted = true`; mọi truy vấn mặc định đã lọc `isDeleted = false`.
- **Restore** (`PATCH /:resource/:id/restore`) → set `isDeleted = false`.
- **Xoá cứng** (`DELETE /:resource/:id/hard`) → xoá thật + dữ liệu con (chỉ có ở attempts, typing-texts, typing-results).
- **Liệt kê cả dữ liệu đã xoá**: `?includeDeleted=true` hoặc `?onlyDeleted=true` (các màn admin đang dùng).

---

## 8. Vận hành & debug

| Việc | Ở đâu |
|---|---|
| Log HTTP | `morgan` qua `interfaces/middlewares/httpLogger.js` → đẩy vào winston (màu theo status) |
| Log ứng dụng | `infrastructure/utils/logger.js` (winston, chỉ ra console, level `info`) |
| Rate limit | `interfaces/middlewares/rateLimiter.js` — 100 request/15 phút/IP nhưng **đang bị comment ở `app.js`** |
| CORS | Hard-code `origin: "http://localhost:5173"` trong `app.js` |
| Tắt server | Bắt `SIGTERM`/`SIGINT` → stop job → `server.close()` → `sequelize.close()` |
| Redis chết | `redisClient` tự reconnect; lỗi cache không làm sập app nhưng `requiredPermission` có thể trả 500 |

**Schema:** không có thư mục migrations, không dùng sequelize-cli. Bảng tạo bằng `sequelize.sync({ alter: false })` lúc boot — nghĩa là **đổi cột trong model sẽ không tự cập nhật DB đang có**; phải tự `ALTER TABLE` hoặc xoá volume (`docker compose down -v`) rồi seed lại.

---

## 9. Recipe: thêm một resource/endpoint mới

1. `domain/entities/<Name>.js` — kế thừa `BaseEntity`, validate trong constructor.
2. `domain/constants/` — thêm enum/permission slug nếu cần.
3. `infrastructure/database/models/<Name>Model.js` — kế thừa `BaseModel`, khai báo cột + index; thêm association vào `models/index.js`.
4. `infrastructure/mappers/<Name>Mapper.js` — `toDomain` / `toPersistence`.
5. `infrastructure/repositories/<Name>Repository.js` — kế thừa `BaseRepository`, thêm query đặc thù.
6. `usecases/<feature>/<Action>.js` — 1 class = 1 hành động, `execute()`, validate + gọi repository; dùng `unitOfWork` nếu ghi nhiều bảng.
7. `interfaces/controllers/<Name>Controller.js` — mỗi method gọi 1 usecase, `try/catch`, trả `res.status(...).json(...)`.
8. `interfaces/routes/<name>Routes.js` — gắn `requiredPermission(...)`, mount vào `interfaces/routes/index.js`.
9. **Đăng ký repository / usecase / controller vào `container.js`.**

> Skill `add-api-endpoint` (`.claude/skills/add-api-endpoint/`) mô tả lại quy trình này từng bước để dùng trực tiếp trong Claude Code.

---

## 10. Việc còn dang dở / điểm cần lưu ý

- **Không có global error handler** → lỗi từ multer ở `/questions/import` trả HTML thay vì JSON.
- `rateLimiter` bị comment; CORS hard-code `localhost:5173` (không đọc từ env).
- `roleRoutes.js` khai báo trùng `GET /users/:userId/roles` (dòng 12 và 43) — bản đầu là dead code.
- `requiredRole()` viết ra nhưng chưa dùng; check role admin/superadmin hiện nằm rải trong usecase (`GetAttempts`, `HardDeleteAttempt`, `RestoreTypingText`, `HardDeleteTypingText`, `HardDeleteTypingResult`).
- `audit_logs` (model + repository + entity) đã có nhưng **chưa ghi ở đâu**; `AuditLogRepository` cũng chưa đăng ký trong container.
- `LocalStorageService` / `S3StorageService` / `FileParser` mới chỉ có khung, chưa dùng (import đang đọc file từ RAM qua multer).
- `POST /api/typing-texts/summarize` tin tưởng `baseUrl` do client gửi (chỉ chặn theo hostname ngrok) — cần cân nhắc khi deploy thật.
- Lỗi bên trong usecase (kể cả lỗi quyền như `"Forbidden: ..."`) đang được controller trả **400** thay vì 403.
- `GET /api/attempts/:attemptId/grade` **đọc `result_summaries` đã lưu lúc submit** (không tính lại điểm). Nếu attempt cũ chưa có summary thì các count trả về 0. Ghi chú "tính lại toàn bộ điểm" trong `README.md` đã lỗi thời.
- `detailedAnswers` của `grade` trả nhiều field hơn ví dụ trong `README.md`: có thêm `questionText` và `maxPoints`; `isPassed` được tính cứng theo `accuracyPercentage >= 50`.
- Chưa có test tự động.
