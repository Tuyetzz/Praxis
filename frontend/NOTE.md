frontend/
├── node_modules/
├── public/
├── src/
│   ├── api/             # Các instance của Axios/Fetch, API calls
│   ├── app/             # Cấu hình mức ứng dụng (Router, Providers, Layouts)
│   │   ├── layouts/
│   │   ├── providers/
│   │   ├── router/
│   │   └── App.tsx
│   ├── assets/          # Hình ảnh, icon, file tĩnh
│   ├── components/      # UI Components dùng chung (Button, Input, Modal...)
│   ├── hooks/           # Custom hooks dùng chung toàn app
pages/
├── auth/            # Login, Register, ForgotPassword
├── dashboard/       # Trang chủ cá nhân - homepage
├── quiz/           # Các trang học tập
│   ├── subjects/    # Danh sách môn học
│   ├── attempts/    # Trang làm bài (Exam/Practice)
│   └── history/     # Lịch sử các bài thi
├── flashcards/      # Danh sách decks, trang học thẻ
├── typing/          # Trang chọn đoạn văn, trang gõ, trang kết quả
├── admin/           # Tất cả các trang admin (Chapter, Subject, Questions...)
└── error/           # 404, 403
│   ├── styles/          # Global styles, Tailwind config, CSS variables
│   ├── types/           # TypeScript interfaces/types dùng chung
│   ├── utils/           # Helper functions, formatter, validator
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .gitignore
└── eslint.config.js

Trang login + register

Trang chính : bảng xếp hạng (chưa làm BE)

admin : 
Trang xem thống kê (chưa làm BE)
Trang CRUD role + gán permission (permission đc seed sẵn từ db vào r, chỉ gán cho role)

Các trang CRUD quiz:
CRUD subject -> Chọn 1 -> 
CRUD chapter -> Chọn 1 -> 
CRUD quiz + option (có nút import từ csv/excel - có form sẵn, dùng form sẵn của bên quizziz và kahoot)

Trang chủ quiz:
1 cái danh sách môn học (subject)
1 cái danh sách chương (chapter) (mặc định trắng - Chưa chọn môn học)
Chọn môn học -> hiện ra danh sách chương
Chọn 1 chương -> trang quiz setting (hoặc là tên khác cũng đc)

Trang quiz setting:
Chọn số lượng câu hỏi - VD: 20,50,.. Mặc định 50
Chọn bộ câu hỏi : 1-50 (nếu chọn cái trên là 50, nếu chọn trên là 100 thì là 1-100, 100-200)
Kiểu hiển thị : trả lời tuần tự - hiển thị toàn bộ câu hỏi(paging)
Thời gian đếm ngược câu hỏi : default
Hiển thị đáp án sau câu hỏi : true/false
xáo trộn câu hỏi : true/false
Thời gian tự động chuyển câu hỏi : true false
Button xem trc câu hỏi
Button bắt đầu

Trang làm bài:
Hiện câu hiện tại/tổng câu, ví dụ 1/50
Question.name
Option.name (toàn bộ option)
Chuyển trang button
button nộp bài -> qua trang kết quả
time 1 câu còn lại (nếu có)
time toàn bộ còn lại

Trang kết quả
Hiện kết quả, dùng cái này : {{baseUrl}}/api/attempts/:attemptId/grade
Có nút back -> về homepage

Trang flashcard deck:
Hiện toàn bộ flashcard deck

Trang flashcard:
Nút crud
Hiện flashcard, ấn vào nó flip lại

Trang fast type
Hiện text default random
Hiện nút chọn text bạn muốn

Trang chọn text
Hiện các text
CRUD
Hiện nút summarize từ AI

Trang gen text AI
Đẩy pdf/word lên button
Text input
Nút summarize
Nút save -> tự insert vào trang chọn text
