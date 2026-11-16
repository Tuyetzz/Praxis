Cách chạy: npm run dev
Cách seed: npm run seed:system

src/
├── domain/
│   ├── entities/          # Các class định nghĩa dữ liệu (Plain JS/TS)
│   └── constants/         # Các biến hằng số nghiệp vụ
├── usecases/
│   ├── user/              # Ví dụ: RegisterUser.js, GetUserProfile.js
│   └── base/              # (Option) Các logic nghiệp vụ chung
├── interfaces/
│   ├── controllers/       # Nhận HTTP request, điều hướng vào usecase
│   ├── routes/            # Khai báo các endpoint
│   └── middlewares/       # Auth, Validation, Error Handler
├── infrastructure/
│   ├── database/
│   │   ├── models/        # Sequelize Models (Kế thừa từ Base Model)
│   │   └── config.js      # Cấu hình kết nối MySQL
│   ├── repositories/      # Triển khai thực tế của Repository (Kế thừa từ Base Repo)
│   └── utils/             # Bcrypt, JWT helpers
└── server.js

Seed vào db 1 superadmin
Seed vào db permission, tạo 1 file enum

Luồng get
- Repository sẽ lấy ra từ db dùng model của infrastructure
  - Khi chạy thì migrate bảng ra từ infrastructure
- Sau đó sẽ nhét vào trong mapper để đổi sang của domain
- Usecase sẽ nhận về domain entity

Luồng insert/update
- Khi có 1 hành động update, usecase sẽ tạo/đổi cái domain entity
- Repository nhận domain entity dùng toPersistence() ở mapper để biến thành obj
- Infrastructure sẽ gọi lệnh insert/update vào db

Các API controller:

# API Endpoints

## Health (public — không cần token)

| Method | URL                | Body/Params | Description                                      |
|--------|--------------------|-------------|--------------------------------------------------|
| GET    | /api/health        | -           | Kiểm tra DB + Redis. 200 nếu DB ok, 503 nếu DB down |
| GET    | /api/health/live   | -           | Chỉ báo process còn sống, không chạm DB/Redis     |

Response của `/api/health`:

```json
{
  "status": "ok",
  "uptimeSeconds": 128,
  "checks": {
    "database": { "ok": true, "latencyMs": 199 },
    "cache": { "ok": false, "latencyMs": 2035, "error": "Redis connect timed out after 2000ms" }
  }
}
```

**Lưu ý quan trọng:**
- Hai endpoint này **không cần auth** — Docker healthcheck, load balancer và uptime monitor
  không gửi JWT được. Chúng được mount **trước** `authMiddleware` trong `routes/index.js`.
- **Redis down KHÔNG làm `/health` fail** (vẫn trả 200, `status: "ok"`), vì Redis chỉ là cache —
  `authMiddleware` tự fallback sang DB. Chỉ DB down mới trả 503.
- Mỗi dependency có timeout riêng (mặc định 2000ms) và chạy song song, nên một service treo
  không làm treo cả health check.
- Docker healthcheck dùng `/health/live` (không phải `/health`) để Redis/MySQL chập chờn
  không gây restart loop.

## Auth
| Method | URL                  | Body/Params                | Description              |
|--------|----------------------|----------------------------|--------------------------|
| POST   | /api/auth/register   | { name, email, password }  | Đăng ký tài khoản        |
| POST   | /api/auth/login      | { email, password }        | Đăng nhập                |
| POST   | /api/auth/refresh    | { refreshToken }           | Làm mới access token     |
| POST   | /api/auth/logout     | { refreshToken }           | Đăng xuất                |

## User (Yêu cầu xác thực)
| Method | URL                | Body/Params         | Description                        |
|--------|--------------------|---------------------|------------------------------------|
| GET    | /api/users         | ?filter             | Lấy danh sách user                 |
| GET    | /api/users/me      | -                   | Lấy thông tin user hiện tại        |
| POST   | /api/users         | { ...user }         | Tạo user mới                       |
| PUT    | /api/users/:id     | { ...user }         | Cập nhật user                      |
| DELETE | /api/users/:id     | -                   | Xóa mềm user (admin/superadmin)    |

## Role (Yêu cầu quyền ROLE_MANAGE hoặc PERMISSION_MANAGE)
| Method | URL                                 | Body/Params                | Description                         |
|--------|-------------------------------------|----------------------------|-------------------------------------|
| GET    | /api/roles                          | ?filter                    | Lấy danh sách role                  |
| POST   | /api/roles                          | { name, description }      | Tạo role mới                        |
| GET    | /api/roles/:id                      | -                          | Lấy thông tin 1 role                |
| PUT    | /api/roles/:id | { name, description }      | Cập nhật role |
| DELETE | /api/roles/:id  | -          | Xóa role                            |
| GET    | /api/roles/:id/permissions  | -        | Lấy danh sách permission của role    |
| POST   | /api/roles/:id/permissions | { permissionId } | Gán permission cho role|
| DELETE | /api/roles/:id/permissions| { permissionId }| Gỡ permission khỏi role|
| POST   | /api/roles/:id/users                | { userId }                 | Gán role cho user                   |
| DELETE | /api/roles/:id/users/:userId        | -                          | Gỡ role khỏi user                   |
| GET    | /api/roles/users/:userId/roles      | -                          | Lấy danh sách role của user         |

## Permission (Yêu cầu quyền PERMISSION_MANAGE)
| Method | URL               | Body/Params | Description                 |
|--------|-------------------|-------------|-----------------------------|
| GET    | /api/permissions  | -           | Lấy danh sách permission    |

## Subject (Yêu cầu xác thực và quyền tương ứng)
| Method | URL                       | Body/Params                | Description                    |
|--------|---------------------------|----------------------------|--------------------------------|
| GET    | /api/subjects/search      | search, page, limit, order | Tìm kiếm subject (có paging)   |
| GET    | /api/subjects             | -                          | Lấy danh sách subject          |
| GET    | /api/subjects/:id         | -                          | Lấy thông tin 1 subject        |
| POST   | /api/subjects             | { ...subject }             | Tạo subject mới                |
| PUT    | /api/subjects/:id         | { ...subject }             | Cập nhật subject               |
| DELETE | /api/subjects/:id         | -                          | Xóa subject                    |

## Chapter (Yêu cầu xác thực và quyền tương ứng)
| Method | URL                                | Body/Params                | Description                        |
|--------|------------------------------------|----------------------------|------------------------------------|
| GET    | /api/chapters                      | -                          | Lấy danh sách chapter              |
| GET    | /api/chapters/search               | search, subjectId, page, limit, order | Tìm kiếm chapter (có paging) |
| GET    | /api/chapters/subject/:subjectId   | -                          | Lấy danh sách chapter theo subject |
| GET    | /api/chapters/:id                  | -                          | Lấy thông tin 1 chapter            |
| POST   | /api/chapters                      | { ...chapter }             | Tạo chapter mới                    |
| PUT    | /api/chapters/:id                  | { ...chapter }             | Cập nhật chapter                   |
| DELETE | /api/chapters/:id                  | -                          | Xóa chapter                        |

## Question (Yêu cầu xác thực và quyền tương ứng)
| Method | URL                                 | Body/Params                                   | Description                          |
|--------|-------------------------------------|-----------------------------------------------|--------------------------------------|
| GET    | /api/questions/search               | search, subjectId, chapterId, type, difficulty, page, limit, order | Tìm kiếm question (có paging) |
| GET    | /api/questions                      | -                                             | Lấy danh sách question               |
| GET    | /api/questions/subject/:subjectId   | -                                             | Lấy danh sách question theo subject  |
| GET    | /api/questions/chapter/:chapterId   | -                                             | Lấy danh sách question theo chapter  |
| GET    | /api/questions/:id                  | -                                             | Lấy thông tin 1 question             |
| POST   | /api/questions/batch                | Xem phần "Batch Questions Input Format" dưới | Thêm nhiều question + options cùng lúc |
| POST   | /api/questions                      | { subjectId, chapterId, type, text, explanation, difficulty, points, media, tags } | Tạo question mới |
| PUT    | /api/questions/:id                  | { type, text, explanation, difficulty, points, media, tags } | Cập nhật question |
| DELETE | /api/questions/:id                  | -                                             | Xóa question                         |

### Batch Questions Input Format
POST /api/questions/batch

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
        {
          "text": "Lựa chọn A",
          "isCorrect": true,
          "order": 1,
          "media": null
        },
        {
          "text": "Lựa chọn B",
          "isCorrect": false,
          "order": 2
        }
      ]
    }
  ]
}
```

**Thông tin chi tiết:**
- `mode`: "all-or-nothing" (hủy toàn bộ nếu 1 item lỗi) hoặc "continue-on-error" (bỏ qua item lỗi)
- `subjectId`, `chapterId`: Bắt buộc
- `type`: Mặc định sẽ dùng giá trị chỉ định ở level batch, có thể override ở mỗi item
- Mỗi item có thể thiếu các trường (explanation, difficulty, points, media, tags) sẽ lấy giá trị mặc định
- `options`: Có thể để trống nếu không có options
- Response sẽ trả về: `{ mode, created: (số lượng), errors?: [...], data: [...] }`

## Option (Yêu cầu xác thực và quyền tương ứng - sử dụng QUESTION_*)
| Method | URL                             | Body/Params                              | Description                    |
|--------|--------------------------------|------------------------------------------|--------------------------------|
| GET    | /api/options                   | -                                        | Lấy danh sách option           |
| GET    | /api/options/question/:questionId | -                                      | Lấy danh sách option theo question |
| GET    | /api/options/:id               | -                                        | Lấy thông tin 1 option         |
| POST   | /api/options                   | { questionId, text, isCorrect, media, order } | Tạo option mới         |
| PUT    | /api/options/:id               | { text, isCorrect, media, order }        | Cập nhật option                |
| DELETE | /api/options/:id               | -                                        | Xóa option                     |


## Flashcard Deck (Yêu cầu xác thực và quyền tương ứng)
| Method | URL                          | Body/Params                | Description                        |
|--------|------------------------------|----------------------------|------------------------------------|
| GET    | /api/flashcard-decks/mine    | -                          | Lấy danh sách deck của tôi         |
| GET    | /api/flashcard-decks/public  | -                          | Lấy danh sách deck public          |
| GET    | /api/flashcard-decks/:id     | -                          | Lấy thông tin 1 deck (nếu xem được)|
| POST   | /api/flashcard-decks         | { title, isPublic }        | Tạo deck mới                       |
| PUT    | /api/flashcard-decks/:id     | { title, isPublic }        | Cập nhật deck                      |
| DELETE | /api/flashcard-decks/:id     | -                          | Xóa deck                           |

## Flashcard (Yêu cầu xác thực và quyền tương ứng)
| Method | URL                              | Body/Params                              | Description                        |
|--------|----------------------------------|------------------------------------------|------------------------------------|
| GET    | /api/flashcards/deck/:deckId     | -                                        | Lấy danh sách flashcard trong deck |
| GET    | /api/flashcards/export/:deckId   | ?format=txt\|csv                         | Tải deck về (mặc định txt)         |
| GET    | /api/flashcards/:id              | -                                        | Lấy thông tin 1 flashcard          |
| POST   | /api/flashcards                  | { deckId, frontText, backText, order, nextReview } | Tạo flashcard mới      |
| POST   | /api/flashcards/import           | multipart: file + deckId                 | Import nhiều thẻ từ file           |
| PUT    | /api/flashcards/:id              | { frontText, backText, order, nextReview }        | Cập nhật flashcard      |
| DELETE | /api/flashcards/:id              | -                                        | Xóa flashcard                     |

### Import flashcard

`POST /api/flashcards/import` — `multipart/form-data`, field `file` + field `deckId`.
Chỉ chủ deck mới import được (giống quyền tạo thẻ). Tối đa **500 thẻ** mỗi lần.

**Định dạng `.txt`** — mỗi dòng 1 thẻ, ngăn cách bằng ` - ` (gạch ngang có dấu cách 2 bên):

```
# Dòng bắt đầu bằng # là comment, sẽ bị bỏ qua
Bustling - nhộn nhịp (bustling city)
well-known - nổi tiếng
```

- Chỉ cắt ở dấu ` - ` **đầu tiên**, nên `well-known` không bị tách nhầm.
- Vế sau được phép chứa dấu gạch ngang và dấu phẩy.
- Dòng trống và dòng comment bị bỏ qua.
- Dòng thiếu vế trước hoặc vế sau bị bỏ qua (không tính là lỗi).

**Định dạng `.csv` / `.xlsx`** — cần header. Tên cột được nhận (không phân biệt hoa thường):

| Vế trước | Vế sau |
|---|---|
| `front`, `frontText`, `term`, `word`, `question` | `back`, `backText`, `definition`, `meaning`, `answer` |

```csv
front,back
Bustling,nhộn nhịp
"proximity","(n) sự lân cận, trạng thái gần"
```

**Định dạng `.json`** — mảng object:

```json
[{ "front": "Bustling", "back": "nhộn nhịp" }]
```

**Response:**

```json
{
  "totalCards": 14,
  "imported": 14,
  "failed": 0,
  "errors": [{ "line": 3, "error": "Mặt trước của thẻ không được để trống." }]
}
```

`order` của thẻ mới được nối tiếp từ thẻ cuối cùng trong deck, nên thẻ import
luôn nằm ở cuối chứ không xen vào giữa. `errors` chỉ xuất hiện khi có dòng lỗi.

> File mẫu để tải về: `frontend/public/flashcard-import-example.txt`
> (được serve tại `/flashcard-import-example.txt`).

### Export flashcard

`GET /api/flashcards/export/:deckId?format=txt` — trả file kèm header
`Content-Disposition: attachment`, trình duyệt tự tải về.

- `format=txt` (mặc định) — cùng định dạng với import, nên **export rồi import lại được ngay**.
- `format=csv` — có header `front,back`, value chứa dấu phẩy được bọc trong `"`.
- Ai xem được deck (chủ deck hoặc deck public) thì export được.
- Xuống dòng trong nội dung thẻ được thay bằng dấu cách để giữ định dạng 1 dòng/thẻ.

Ghi chú:
- Các route `/api/users/*` yêu cầu JWT token ở header `Authorization: Bearer <token>`
- Các trường body/params tham khảo ở phần entity User hoặc liên hệ BE nếu cần chi tiết.

Cache:
- Hiện tại đang dùng map cho tiện, mai sau sau khi xong be sẽ sửa thành redis
- Cấu trúc lưu:
  - Key: user_permissions:uuid-cua-user (String)
  - Value: ["permission_1", "permission_2", ...] (Mảng các String)

Ví dụ về paging của 2 cái kia
GET /subjects/search?search=math&page=1&limit=10&order=name
GET /chapters/search?search=chapter1&subjectId=xxx&page=1&limit=10&order=name

Lưu ý : mode = practice và showAnswerAfterSelect true thì nó mới hiện đáp án
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

## Attempt (Làm bài thi/trắc nghiệm)
| Method | URL                                   | Body/Params                                 | Description                        |
|--------|---------------------------------------|---------------------------------------------|------------------------------------|
| POST   | /api/attempts/start                   | { subjectId, chapterId, mode, settings }    | Bắt đầu 1 lượt làm bài mới         |
| GET    | /api/attempts/:id                     | -                                           | Lấy thông tin 1 attempt            |
| POST   | /api/attempts/:attemptId/answers      | { questionId, optionId/selectedOptionIds, value, flagged } | Lưu/chọn đáp án cho 1 câu hỏi |
| POST   | /api/attempts/:attemptId/submit       | -                                           | Nộp bài, chấm điểm, trả kết quả  |

**Luồng làm bài:**
1. Gọi POST /api/attempts/start để tạo attempt mới (status: in_progress)
2. Mỗi lần chọn đáp án, gọi POST /api/attempts/:attemptId/answers để lưu đáp án
3. Khi nộp bài, gọi POST /api/attempts/:attemptId/submit để chốt bài + chấm điểm (status: graded)
4. Có thể GET /api/attempts/:id để lấy lại thông tin attempt bất kỳ lúc nào

**settings** khi start attempt:
```json
{
  "paging": "1-50",
  "questionsPerPage": 10,
  "questionTimeSeconds": 30,
  "showAnswerAfterSelect": true,
  "shuffleQuestions": true
}
```

**Lưu ý:**
- Chỉ user tạo attempt mới được phép thao tác với attempt đó
- Khi nộp bài (submit), status chuyển sang graded (chấm điểm ngay)
- Sau khi nộp, không thể sửa đáp án nữa
- Đáp án được lưu từng câu, có thể update nhiều lần khi làm bài (trừ khi đã nộp)

**Điền 1 đáp án (Có thể gửi mỗi cái flagged cũng đc, nhưng mà questionId là bắt buộc)**
- single/true-false
{
  "questionId": "cau-hoi-uuid",
  "optionId": "option-uuid",
  "flagged": true
}
- multiple
{
  "questionId": "cau-hoi-uuid",
  "selectedOptionIds": ["option-uuid-1", "option-uuid-2"]
}
- fill blank
{
  "questionId": "cau-hoi-uuid",
  "value": "đáp án điền vào"
}

**Chấm điểm (Grading - tự động khi submit):**
- POST /api/attempts/:attemptId/submit sẽ tự động chấm điểm theo loại câu hỏi:
  - Single/TrueFalse: so sánh optionId với đáp án đúng
  - Multiple: so sánh selectedOptionIds với danh sách đáp án đúng (phải khớp chính xác)
  - FillBlank: so sánh value với text của option đúng (case-insensitive)
- Mỗi câu đúng sẽ được fullpoint, câu sai được 0 điểm
- Score cuối = tổng điểm của tất cả câu đúng
- Response trả về: `{ attempt, totalEarnedPoints, maxScore, correctCount, totalCount }`

## Xem kết quả chấm điểm (Grading Result)
| Method | URL                                   | Body/Params | Description                        |
|--------|---------------------------------------|-------------|------------------------------------|
| GET    | /api/attempts/:attemptId/grade        | -           | Xem chi tiết kết quả chấm điểm     |

**Luồng:**
- Sau khi nộp bài (submit), gọi GET /api/attempts/:attemptId/grade để lấy lại kết quả đã chấm.
- API trả về:
  - Thông tin attempt (id, userId, score, maxScore, status, thời gian)
  - Thống kê: số câu đúng, sai, bỏ trống, phần trăm đúng, pass/fail
  - Danh sách đáp án chi tiết từng câu (có đáp án đúng để so sánh)

**Ví dụ response:**
```json
{
  "attempt": {
    "id": "uuid",
    "userId": "uuid",
    "score": 85,
    "maxScore": 100,
    "status": "graded",
    "timeSpentSeconds": 3600
  },
  "summary": {
    "correctCount": 17,
    "wrongCount": 2,
    "blankCount": 1,
    "totalQuestions": 20,
    "totalEarnedPoints": 85,
    "maxScore": 100,
    "accuracyPercentage": 85.0,
    "isPassed": true
  },
  "detailedAnswers": [
    {
      "questionId": "uuid",
      "questionType": "single",
      "status": "correct",
      "points": 5,
      "selectedAnswer": ["option-id"],
      "correctAnswer": ["option-id"]
    }
  ]
}
```

**Lưu ý:**
- Kết quả này sẽ tính lại toàn bộ điểm.

## Typing text
| Method | URL                            | Body/Params                                                               | Description                        |
|--------|--------------------------------|---------------------------------------------------------------------------|------------------------------------|
| GET    | /api/typing-texts/mine         | -                                                                         | Lấy danh sách bài tập của tôi      |
| GET    | /api/typing-texts/public       | -                                                                         | Lấy danh sách bài tập công khai    |
| GET    | /api/typing-texts              | -                                                                         | Lấy tất cả bài tập                 |
| GET    | /api/typing-texts/:id          | -                                                                         | Lấy chi tiết một văn bản           |
| POST   | /api/typing-texts              | { title, content, language, isPublic, difficulty, isDefault, sourceType } | Tạo mới một bài tập                |
| PUT    | /api/typing-texts/:id          | { title, content, language, isPublic, difficulty, isDefault, sourceType } | Cập nhật một bài tập               |
| DELETE | /api/typing-texts/:id          | -                                                                         | Xóa một bài tập                    |

## Typing result
| Method | URL                                     | Body/Params                                              | Description                        |
|--------|-----------------------------------------|----------------------------------------------------------|------------------------------------|
| GET    | /api/typing-results/mine                | -                                                        | Lấy lịch sử kết quả của tôi        |
| GET    | /api/typing-results/text/:textId        | textId (path)                                            | Lấy danh sách kết quả theo bài tập |
| GET    | /api/typing-results/text/:textId/leaderboard | textId (path)                                        | Lấy bảng xếp hạng theo bài tập     |
| GET    | /api/typing-results/:id                 | id (path)                                                | Lấy chi tiết kết quả               |
| POST   | /api/typing-results                     | { textId, wpm, accuracy, rawWpm, durationSeconds, errorTags } | Lưu kết quả gõ phím                |

## AI — Tạo câu hỏi tự động

| Method | URL                       | Body/Params                                                             | Description                     |
|--------|---------------------------|-------------------------------------------------------------------------|---------------------------------|
| POST   | /api/ai/generate-quiz     | { topic, numQuestions, questionTypes, difficulty, subjectId?, chapterId? } | Sinh câu hỏi bằng AI (không lưu DB) |

### Biến môi trường

| Biến | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|
| `OPENROUTER_API_KEY` | có | — | API key của OpenRouter |
| `OPENROUTER_MODEL` | không | `deepseek/deepseek-chat` | Model dùng để sinh câu hỏi |
| `OPENROUTER_BASE_URL` | không | `https://openrouter.ai/api/v1/chat/completions` | Đổi khi dùng proxy |
| `OPENROUTER_TIMEOUT_MS` | không | `60000` | Timeout gọi AI |
| `REDIS_CONNECT_TIMEOUT_MS` | không | `2000` | Timeout kết nối Redis (cache quyền) |

> **Lưu ý chọn model**: nên dùng model **không phải reasoning** (`deepseek/deepseek-chat`).
> Model reasoning (ví dụ `dots-studio/...`) tiêu tốn token vào phần suy luận ẩn trước khi viết
> output, nên hay trả về `content` rỗng với `finish_reason: length`. Nếu gặp lỗi
> *"ran out of output tokens"* thì đổi `OPENROUTER_MODEL` sang model thường.

### Request body

| Field | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|---|
| `topic` | string | có | — | Chủ đề **hoặc** văn bản nguồn để sinh câu hỏi (tối đa 12000 ký tự) |
| `numQuestions` | int | không | `10` | Số câu hỏi cần sinh (1–50) |
| `questionTypes` | string[] | không | `["single"]` | Loại câu hỏi: `single`, `multiple`, `true_false`, `fill_blank` |
| `difficulty` | int | không | `2` | 1 = dễ, 2 = trung bình, 3 = khó |
| `subjectId` | uuid | không | — | Chỉ dùng để thêm ngữ cảnh vào prompt, **không bắt buộc** |
| `chapterId` | uuid | không | — | Phải đi kèm `subjectId`, chapter phải thuộc subject đó |
| `language` | string | không | `english` | Ngôn ngữ của câu hỏi |

**API này KHÔNG lưu vào database.** Nó chỉ sinh và trả về. Muốn lưu thì gọi tiếp
`POST /api/questions/batch` với kết quả nhận được (xem format ở phần Question).

### Response

```json
{
  "questions": [
    {
      "text": "Quá trình nào chuyển hơi nước thành nước lỏng?",
      "type": "single",
      "explanation": "Ngưng tụ là quá trình hơi nước chuyển thành nước lỏng.",
      "difficulty": 2,
      "points": 1,
      "options": [
        { "text": "Bay hơi", "isCorrect": false, "order": 1 },
        { "text": "Ngưng tụ", "isCorrect": true, "order": 2 },
        { "text": "Mưa", "isCorrect": false, "order": 3 },
        { "text": "Thoát hơi nước", "isCorrect": false, "order": 4 }
      ]
    }
  ],
  "requested": 3,
  "generated": 3,
  "model": "deepseek/deepseek-chat",
  "usage": { "prompt_tokens": 512, "completion_tokens": 340, "total_tokens": 852 }
}
```

`skipped` chỉ xuất hiện khi có câu hỏi AI trả về sai format và bị bỏ:

```json
"skipped": [{ "index": 2, "error": "Generated question is missing text." }]
```

### Mã lỗi

| Status | Khi nào |
|---|---|
| `200` | Thành công |
| `400` | Thiếu `topic`, `numQuestions` ngoài khoảng 1–50, input quá dài, **hoặc phát hiện prompt injection** |
| `401` | Thiếu / sai access token |
| `403` | User không có permission `ai:generate_quiz` |
| `429` | Vượt rate limit (10 request / 15 phút / user) |
| `502` | AI trả về lỗi, JSON không hợp lệ, hoặc hết token output |
| `503` | Chưa cấu hình `OPENROUTER_API_KEY` |
| `504` | Gọi AI quá timeout |

### Rate limit

**10 request / 15 phút**, tính theo `userId` (không phải IP). Vượt sẽ trả `429`.
Response có header `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`.

### Bảo mật — chống prompt injection

Input của user được coi là **dữ liệu không đáng tin**, không phải instruction:

- **Từ chối thẳng (400)** nếu phát hiện pattern injection: `ignore all previous instructions`,
  `you are now an admin`, `show me your system prompt`, `give me the api key`, `developer mode`...
- System prompt nói rõ với model rằng phần user gửi vào là DATA, không phải mệnh lệnh.
- Input được escape trước khi ghép vào prompt để không phá vỡ cấu trúc.
- Chặn thêm các pattern nguy hiểm: `eval(`, `require(`, `<script`, `__proto__`...

Danh sách pattern nằm ở `src/infrastructure/utils/sanitize.js`.

> **Chưa làm**: API này chưa được gán cho role `student`. Hiện chỉ `superadmin` gọi được.
> Muốn mọi user dùng được thì phải grant permission `ai:generate_quiz` cho các role nền
> trong `SeedSystemData.js` rồi chạy lại `npm run seed:system`.

### Ví dụ gọi API

```bash
curl -X POST http://localhost:5000/api/ai/generate-quiz \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "The water cycle",
    "numQuestions": 3,
    "questionTypes": ["single"],
    "difficulty": 2
  }'
```

File test Postman: `backend/postman/ai-generate-quiz.postman_collection.json` (import vào Postman,
sửa biến `accessToken` rồi bấm Send).
---

## Các file env — file nào được đọc khi nào

Có nhiều file `.env*` trong repo và rất dễ rối, vì **có hai cơ chế đọc khác nhau**:
`dotenv` (đọc bởi code Node) và **Docker Compose** (đọc bởi Docker). Chúng độc lập với nhau.

### Bảng tổng hợp

| File | Ai đọc | Khi nào |
|---|---|---|
| `.env` (thư mục gốc) | Docker Compose | Tự động, cho `${VAR}` trong `docker-compose*.yml` |
| `.env.prod` (gốc) | Docker Compose | Khi deploy: `--env-file .env.prod` |
| `backend/.env` | `dotenv` **và** Compose `env_file` | **Cả hai chế độ** |
| `.env.example` | *(không ai đọc — chỉ để tham khảo)* | Được commit |
| `.env.prod.example` | *(không ai đọc — chỉ để tham khảo)* | Được commit |

### Cơ chế 1 — `dotenv` (code Node đọc)

```js
// src/server.js:1
require("dotenv").config();   // KHÔNG có tham số
```

Không truyền đường dẫn → dotenv tìm file tên `.env` ở **thư mục hiện hành** (`process.cwd()`):

- Chạy `npm run dev` trong `backend/` → đọc `backend/.env`
- Trong Docker, `WORKDIR /app` → đọc `/app/.env` (chính là `backend/.env` được mount)

Đây là lý do `.env` ở thư mục gốc **không** ảnh hưởng gì khi chạy local — code không nhìn thấy nó.

### Cơ chế 2 — Docker Compose (Docker đọc)

```yaml
env_file:
  - ./backend/.env      # nạp toàn bộ biến vào container
environment:
  DB_HOST: mysql        # ghi đè lên env_file
```

Compose còn tự động đọc `.env` ở thư mục gốc để thay `${VAR}` trong file compose.

**Thứ tự ưu tiên (cao → thấp):**

```
environment:  >  env_file:  >  .env (gốc, cho ${VAR})
```

### Bốn tình huống thực tế

**1. Chạy local**
```bash
cd backend && npm run dev
```
Chỉ đọc `backend/.env`. Không file nào khác.

**2. Docker dev**
```bash
docker compose up
```
Cả ba nguồn cùng lúc:
- `.env` (gốc) → cấp `${MYSQL_ROOT_PASSWORD}`, `${MYSQL_PASSWORD}`…
- `backend/.env` → `env_file`, nạp vào container
- `environment:` → ghi đè (`DB_HOST=mysql`, `DB_USER=quizuser`…)

**3. Deploy production**
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```
`.env.prod` thay cho `.env` gốc. `backend/.env` **vẫn được đọc**, nhưng bị `environment:` ghi đè.

**4. CI (GitHub Actions)**
Không cần file env nào — toàn bộ test là unit test dùng fake repository.

### Quy tắc để không bị rối

| Loại biến | Để ở đâu |
|---|---|
| Hạ tầng (host, port, tên service) | `docker-compose*.yml` — hard-code |
| Secrets của Docker (MySQL password) | `.env` gốc (dev) / `.env.prod` (prod) |
| Secrets của app (JWT, OpenRouter key) | `.env.prod` (prod) hoặc `backend/.env` (local) |
| Biến chỉ dùng khi chạy local | `backend/.env` |

**Vì sao `DB_HOST` phải khác nhau:** khi chạy local, MySQL ở `localhost`. Trong Docker, `localhost` là chính container backend — MySQL là một container khác, nên phải dùng tên service `mysql`. Compose override biến này qua `environment:` để `backend/.env` vẫn dùng được cho local.

**Vì sao `MYSQL_USER` không được là `root`:** entrypoint của MySQL từ chối thẳng và container crash-loop:
```
MYSQL_USER and MYSQL_PASSWORD are for configuring a regular user
and cannot be used for the root user
```
