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
| GET    | /api/flashcards/:id              | -                                        | Lấy thông tin 1 flashcard          |
| POST   | /api/flashcards                  | { deckId, frontText, backText, order, nextReview } | Tạo flashcard mới      |
| PUT    | /api/flashcards/:id              | { frontText, backText, order, nextReview }        | Cập nhật flashcard      |
| DELETE | /api/flashcards/:id              | -                                        | Xóa flashcard                     |

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