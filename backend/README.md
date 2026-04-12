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
| Method | URL                | Body/Params         | Description                |
|--------|--------------------|---------------------|----------------------------|
| POST   | /api/auth/register | { name, email, password } | Đăng ký tài khoản         |
| POST   | /api/auth/login    | { email, password } | Đăng nhập                  |
| POST   | /api/auth/refresh | { refreshToken }  | Làm mới access token       |
| POST   | /api/auth/logout   | { refreshToken }    | Đăng xuất                  |

## User (Yêu cầu xác thực)
| Method | URL                | Body/Params         | Description                |
|--------|--------------------|---------------------|----------------------------|
| GET    | /api/users         | ?filter             | Lấy danh sách user         |
| GET    | /api/users/me      | -                   | Lấy thông tin user hiện tại|
| POST   | /api/users         | { ...user }         | Tạo user mới               |
| PUT    | /api/users/:id     | { ...user }         | Cập nhật user              |
| DELETE | /api/users/:id     | -                   | Xóa mềm user (admin/superadmin) |

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