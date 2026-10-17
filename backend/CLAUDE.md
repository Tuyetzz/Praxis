# Backend — QuizWeb

API server cho app luyện thi trắc nghiệm (quiz + flashcard + typing).
Express 5 · Sequelize 6 + MySQL · Redis · Awilix DI · JWT · CommonJS (KHÔNG dùng ESM/`import`).

Tài liệu liên quan:
- `README.md` — ghi chú của tác giả: cách chạy, format body/response của các API chính.
- `ARCHITECTURE.md` — kiến trúc, data model, danh sách endpoint đầy đủ (kèm permission), nghiệp vụ, known issues.

## Lệnh

```bash
npm run dev            # nodemon src/server.js
npm run start          # node src/server.js
npm run seed:system    # seed permission + role hệ thống + superadmin (idempotent)
docker compose up --build   # từ thư mục gốc repo: mysql + redis + backend + frontend
```

Không có test, không có lint script. Không có thư mục migrations.

## Kiến trúc — 4 tầng, đi theo đúng chiều này

```
interfaces (routes → controllers)  →  usecases  →  domain (entities/constants)
                                          ↓
                                   infrastructure (repositories → mappers → models)
```

Đăng ký dependency trong `src/container.js` (Awilix), resolve theo tên camelCase.
**Thêm repository/usecase/controller mới mà quên đăng ký ở `container.js` là lỗi phổ biến nhất.**

Quy tắc viết code:

- **1 usecase = 1 class = 1 hành động**, method `execute()`. Không gọi usecase này từ usecase khác.
- **Controller không chứa nghiệp vụ**: chỉ đọc `req`, gọi đúng 1 usecase, trả `res`. Mọi controller tự `try/catch` (không có global error handler).
- **Validate trong usecase và trong constructor của entity** (`entity.validate()`), không viết middleware validation.
- **Mọi truy vấn DB phải đi qua repository**, không gọi Sequelize model trực tiếp từ usecase/controller.
- Model kế thừa `BaseModel`, repository kế thừa `BaseRepository`, mapper kế thừa `BaseMapper`, entity kế thừa `BaseEntity` — dùng lại các method có sẵn (`findWithPagination`, `softDelete`, `restore`, `hardDelete`, `_applyDeletedFilter`).
- **Ghi nhiều bảng → dùng `unitOfWork`**: `await this.unitOfWork.start()` → truyền `this.unitOfWork.getTx()` vào repository → `commit()` / `rollback()` trong `catch`. Usecase có transaction phải đăng ký `.scoped()` trong container (giống `submitAttempt`).
- **Xoá mềm là mặc định** (`DELETE /:id`); restore bằng `PATCH /:id/restore`; chỉ attempts / typing-texts / typing-results có hard delete. `BaseRepository` tự lọc `isDeleted = false`.
- `createdBy`/`updatedBy` được `BaseModel` tự set từ `AsyncLocalStorage` (do `contextMiddleware` nạp) — không cần set tay.

## Route & phân quyền

- Router ở `src/interfaces/routes/index.js`: `/auth` mount **trước** `authMiddleware` (public), tất cả router còn lại nằm **sau** `authMiddleware` + `contextMiddleware`.
- Mỗi route gắn `requiredPermission('<slug>')`. Slug khai báo ở `src/domain/constants/permissions.js` (dạng `resource:action`, ví dụ `question:create`). Thêm slug mới thì phải chạy lại `npm run seed:system` để ghi vào DB.
- Superadmin bypass mọi permission. Quyền của user được cache trong Redis ở key `user_permissions:<userId>` (TTL 600s) — **khi sửa role/permission phải xoá cache** (`redisClient.delPattern('user_permissions:*')` hoặc `del` theo user).
- `requiredRole()` có sẵn nhưng chưa dùng; check role admin/superadmin hiện nằm trong usecase.

## Response & lỗi

- `/api/auth/*` trả envelope `{ success, message?, data? }`; các resource khác trả thẳng payload của usecase, lỗi là `{ message }`.
- Status: `200` đọc/update · `201` tạo · `204` xoá mềm · `200 { success: true }` cho hard delete.
- Lỗi nghiệp vụ ném `new Error("...")` trong usecase; controller bắt và trả về (thường là 400).

## Lưu ý khi sửa code

- `sequelize.sync({ alter: false })` lúc boot — **đổi cột trong model KHÔNG tự cập nhật DB đang có**. Phải `ALTER TABLE` tay hoặc `docker compose down -v` rồi seed lại.
- CORS hard-code `http://localhost:5173` trong `src/app.js`; `rateLimiter` đang bị comment.
- Import câu hỏi chỉ nhận file ≤ 5MB qua multer `memoryStorage`; lỗi multer không đi qua try/catch của controller nên trả HTML thay vì JSON.
- `POST /api/typing-texts/summarize` gọi service AI bên ngoài qua `baseUrl` do client gửi (chỉ cho phép host `ngrok-free.app` / `ngrok.io`) — cẩn thận khi động vào.
- `audit_logs` và `LocalStorageService`/`S3StorageService` mới chỉ có khung, chưa dùng.
- Comment trong code viết tiếng Việt hoặc tiếng Anh đều gặp; giữ nguyên văn phong của file đang sửa.

## Bản đồ file

| Cần gì | Ở đâu |
|---|---|
| Thêm/sửa endpoint | `interfaces/routes/`, `interfaces/controllers/` |
| Nghiệp vụ | `usecases/<feature>/` |
| Bảng & cột | `infrastructure/database/models/`, association ở `models/index.js` |
| Query DB | `infrastructure/repositories/` |
| Map model ↔ entity | `infrastructure/mappers/` |
| Enum, permission slug | `domain/constants/` |
| Auth/JWT/bcrypt | `interfaces/middlewares/authMiddleware.js`, `infrastructure/utils/auth_helper.js` |
| Transaction | `infrastructure/unitOfWork/SequelizeUnitOfWork.js` |
| Job định kỳ | `infrastructure/jobs/autoSubmitAttempts.js` |
| Seed | `usecases/base/SeedSystemData.js` |
| Đăng ký DI | `src/container.js` |

Skill `add-api-endpoint` (`.claude/skills/add-api-endpoint/`) có checklist từng bước khi thêm một resource mới.
