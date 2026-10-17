---
name: add-api-endpoint
description: Thêm một resource/endpoint mới cho backend QuizWeb theo đúng kiến trúc 4 tầng (entity → model → mapper → repository → usecase → controller → route → container). Dùng khi cần tạo CRUD mới, thêm usecase cho resource đã có, hoặc thêm route mới vào resource sẵn có.
---

# Thêm API endpoint mới (backend QuizWeb)

Mục tiêu: giữ đúng kiến trúc 4 tầng và các quy ước đang có. Trước khi viết, đọc 1 resource tương tự đã hoàn chỉnh để bắt chước — **`Subject` là ví dụ gọn và đầy đủ nhất**:

```
domain/entities/Subject.js
infrastructure/database/models/SubjectModel.js
infrastructure/mappers/SubjectMapper.js
infrastructure/repositories/SubjectRepository.js
usecases/subject/*.js
interfaces/controllers/SubjectController.js
interfaces/routes/subjectRoutes.js
```

## Checklist

```
- [ ] 1. Xác định resource + các permission slug cần dùng
- [ ] 2. domain/entities/<Name>.js
- [ ] 3. infrastructure/database/models/<Name>Model.js  (+ association trong models/index.js)
- [ ] 4. infrastructure/mappers/<Name>Mapper.js
- [ ] 5. infrastructure/repositories/<Name>Repository.js
- [ ] 6. usecases/<feature>/<Action>.js  (mỗi hành động 1 file)
- [ ] 7. interfaces/controllers/<Name>Controller.js
- [ ] 8. interfaces/routes/<name>Routes.js  (+ mount trong routes/index.js)
- [ ] 9. Đăng ký repository + usecase + controller trong src/container.js
- [ ] 10. Seed lại nếu có permission slug mới
- [ ] 11. Chạy thử và kiểm tra response
```

## 1. Entity — `domain/entities/<Name>.js`

```js
const BaseEntity = require("./BaseEntity");

class Post extends BaseEntity {
  constructor(data) {
    super(data);                 // id, createdAt, updatedAt, createdBy, updatedBy, isDeleted
    this.title = data.title;
    this.content = data.content;

    this.validate();
  }

  validate() {
    if (!this.title || this.title.trim() === "") {
      throw new Error("Tiêu đề không được để trống.");
    }
  }
}

module.exports = Post;
```

Entity là nơi đặt validate + logic nhỏ (ví dụ `ResultSummary.getAccuracyPercentage()`).

## 2. Model — `infrastructure/database/models/<Name>Model.js`

```js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const BaseModel = require("./BaseModel");

class PostModel extends BaseModel {}

PostModel.init({
  title: { type: DataTypes.STRING(255), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: true }
}, {
  sequelize,
  tableName: "posts",
  timestamps: true,
  indexes: [{ fields: ["title"] }]
});

module.exports = PostModel;
```

- **Không khai báo lại** `id` / `createdBy` / `updatedBy` / `isDeleted` — `BaseModel` đã có.
- Thêm association vào `infrastructure/database/models/index.js` (theo nhóm, kèm `onDelete` phù hợp) và export model ở cuối file đó.

## 3. Mapper — `infrastructure/mappers/<Name>Mapper.js`

```js
const BaseMapper = require("./BaseMapper");
const PostEntity = require("../../domain/entities/Post");

class PostMapper extends BaseMapper {
  constructor() {
    super(PostEntity);
  }
}

module.exports = new PostMapper();   // export instance, không phải class
```

Chỉ override `toDomain` / `toPersistence` khi cần đổi tên field hoặc gộp/bóc tách dữ liệu.

## 4. Repository — `infrastructure/repositories/<Name>Repository.js`

```js
const BaseRepository = require("./BaseRepository");
const PostModel = require("../database/models/PostModel");
const postMapper = require("../mappers/PostMapper");

class PostRepository extends BaseRepository {
  constructor() {
    super(PostModel, postMapper);
  }

  async findByTitle(title, options = {}) {
    const records = await this.model.findAll({
      where: this._applyDeletedFilter({ title }, options)
    });
    return records.map(record => this.mapper.toDomain(record));
  }
}

module.exports = PostRepository;   // export class (container sẽ khởi tạo)
```

- Dùng `this._applyDeletedFilter(where, options)` cho mọi query tự viết, để tôn trọng `isDeleted` / `includeDeleted` / `onlyDeleted`.
- Luôn `this.mapper.toDomain(record)` trước khi trả về — không trả Sequelize instance ra ngoài tầng này.
- Có sẵn: `findAll`, `findById`, `create`, `update`, `softDelete`, `restore`, `hardDelete`, `hardDeleteWhere`, `findWithPagination`.

## 5. Usecase — `usecases/<feature>/<Action>.js`

```js
class CreatePost {
  constructor({ postRepository, redisClient }) {   // inject theo tên đăng ký trong container
    this.postRepository = postRepository;
    this.redisClient = redisClient;
  }

  async execute(payload = {}) {
    const { title, content, userId } = payload;

    if (!title) throw new Error("Title is required.");

    return await this.postRepository.create({ title, content }, userId);
  }
}

module.exports = CreatePost;
```

- 1 file = 1 hành động = 1 method `execute()`. Không gọi usecase từ usecase khác.
- Ghi nhiều bảng → bọc `unitOfWork`:

```js
await this.unitOfWork.start();
try {
  await this.aRepository.create(data, userId, this.unitOfWork.getTx());
  await this.bRepository.create(other, userId, this.unitOfWork.getTx());
  await this.unitOfWork.commit();
} catch (err) {
  await this.unitOfWork.rollback();
  throw err;
}
```

- Nếu usecase cần "trạng thái riêng cho từng request" (unitOfWork, transaction) thì đăng ký `.scoped()` trong container, không dùng `.singleton()`.

## 6. Controller — `interfaces/controllers/<Name>Controller.js`

```js
class PostController {
  constructor({ createPost, getPosts }) {
    this.createPost = createPost;
    this.getPosts = getPosts;
  }

  async create(req, res) {
    try {
      const result = await this.createPost.execute({ ...req.body, userId: req.user.id });
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await this.getPosts.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = PostController;
```

Không có global error handler → **mỗi method phải tự try/catch**. `req.user = { id, roles }` do `authMiddleware` set sẵn.

## 7. Route — `interfaces/routes/<name>Routes.js`

```js
const express = require('express');
const router = express.Router();
const container = require('../../container');
const postController = container.resolve('postController');
const authMiddleware = container.resolve('authMiddleware');
const { requiredPermission } = authMiddleware;
const { PERMISSIONS } = require('../../domain/constants/permissions');

router.get('/', requiredPermission(PERMISSIONS.POST_VIEW), (req, res) =>
  postController.getAll(req, res)
);

router.post('/', requiredPermission(PERMISSIONS.POST_CREATE), (req, res) =>
  postController.create(req, res)
);

module.exports = router;
```

- Dùng hằng trong `PERMISSIONS`, không hard-code chuỗi slug.
- Thứ tự route: các path tĩnh (`/search`, `/mine`) phải khai báo **trước** `/:id`.
- Mount vào `interfaces/routes/index.js`; nhớ `/auth` phải nằm trước `authMiddleware`, mọi router khác nằm sau.
- Có upload file → dùng `upload.single('file')` từ `interfaces/middlewares/uploadMiddleware`.

## 8. Container — `src/container.js`

Thêm 3 nhóm dòng (giữ đúng thứ tự import → register):

```js
const PostRepository = require('./infrastructure/repositories/PostRepository');
const PostController = require('./interfaces/controllers/PostController');
const CreatePost = require('./usecases/post/CreatePost');
const GetPosts = require('./usecases/post/GetPosts');

container.register({
  postRepository: asClass(PostRepository).singleton(),
  createPost: asClass(CreatePost).singleton(),
  getPosts: asClass(GetPosts).singleton(),
  postController: asClass(PostController).singleton(),
});
```

## 9. Permission slug mới

Thêm vào `src/domain/constants/permissions.js` rồi chạy:

```bash
npm run seed:system
```

Seed là idempotent (upsert permission, restore role nếu bị xoá mềm) — chạy lại không hỏng dữ liệu.

## 10. Kiểm tra

```bash
npm run dev
curl -H "Authorization: Bearer <accessToken>" http://localhost:5000/api/posts
```

- User thường cần được gán permission qua `/api/roles/:id/permissions`; nếu vừa đổi quyền mà vẫn bị 403 → cache Redis `user_permissions:<userId>` chưa bị xoá (TTL 600s), xoá key hoặc gọi API gán/gỡ quyền để nó tự xoá.
- Lỗi `AwilixResolutionError` = quên đăng ký ở `container.js`.

## Lỗi thường gặp

| Triệu chứng | Nguyên nhân |
|---|---|
| `Could not resolve 'xController'` | Chưa đăng ký trong `container.js` |
| Route mới luôn 404 | Chưa mount trong `routes/index.js`, hoặc bị `/:id` bắt trước |
| Sửa cột trong model mà DB không đổi | `sequelize.sync({ alter: false })` — phải `ALTER TABLE` tay hoặc xoá volume |
| Trả về cả bản ghi đã xoá mềm | Query tự viết thiếu `this._applyDeletedFilter()` |
| Transaction treo / commit nhầm sang request khác | Usecase dùng `unitOfWork` nhưng đăng ký `.singleton()` thay vì `.scoped()` |
