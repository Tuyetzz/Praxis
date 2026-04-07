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