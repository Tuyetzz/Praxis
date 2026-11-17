---
name: add-api-endpoint
description: Add a new resource/endpoint to the Praxis backend following the 4-layer architecture (entity → model → mapper → repository → usecase → controller → route → container). Use when creating new CRUD, adding a usecase to an existing resource, or adding a route to an existing resource.
---

# Adding a new API endpoint (Praxis backend)

Goal: keep the 4-layer architecture and existing conventions intact. Before writing anything, read one complete resource and copy it — **`Subject` is the smallest complete example**:

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
- [ ] 1. Decide the resource + which permission slugs it needs
- [ ] 2. domain/entities/<Name>.js
- [ ] 3. infrastructure/database/models/<Name>Model.js  (+ association in models/index.js)
- [ ] 4. infrastructure/mappers/<Name>Mapper.js
- [ ] 5. infrastructure/repositories/<Name>Repository.js
- [ ] 6. usecases/<feature>/<Action>.js  (one file per action)
- [ ] 7. interfaces/controllers/<Name>Controller.js
- [ ] 8. interfaces/routes/<name>Routes.js  (+ mount in routes/index.js)
- [ ] 9. Register repository + usecase + controller in src/container.js
- [ ] 10. Re-seed if you added a permission slug
- [ ] 11. Run it and check the response
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
      throw new Error("Title cannot be empty.");
    }
  }
}

module.exports = Post;
```

The entity is where validation and small domain logic live (e.g. `ResultSummary.getAccuracyPercentage()`).

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

- **Do not re-declare** `id` / `createdBy` / `updatedBy` / `isDeleted` — `BaseModel` already provides them.
- Add the association in `infrastructure/database/models/index.js` (grouped with related models, with a sensible `onDelete`) and export the model at the end of that file.

## 3. Mapper — `infrastructure/mappers/<Name>Mapper.js`

```js
const BaseMapper = require("./BaseMapper");
const PostEntity = require("../../domain/entities/Post");

class PostMapper extends BaseMapper {
  constructor() {
    super(PostEntity);
  }
}

module.exports = new PostMapper();   // export an instance, not the class
```

Only override `toDomain` / `toPersistence` when you need to rename fields or reshape data.

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

module.exports = PostRepository;   // export the class (the container instantiates it)
```

- Use `this._applyDeletedFilter(where, options)` in every hand-written query so `isDeleted` / `includeDeleted` / `onlyDeleted` are respected.
- Always run `this.mapper.toDomain(record)` before returning — never leak a Sequelize instance out of this layer.
- Inherited for free: `findAll`, `findById`, `create`, `update`, `softDelete`, `restore`, `hardDelete`, `hardDeleteWhere`, `findWithPagination`.

## 5. Usecase — `usecases/<feature>/<Action>.js`

```js
class CreatePost {
  constructor({ postRepository, redisClient }) {   // injected by the name registered in the container
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

- One file = one action = one `execute()` method. Never call a usecase from another usecase.
- Writing to multiple tables → wrap in `unitOfWork`:

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

- If a usecase needs per-request state (unitOfWork, transaction), register it `.scoped()` in the container, not `.singleton()`.

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

There is no global error handler → **every method must do its own try/catch**. `req.user = { id, roles }` is set by `authMiddleware`.

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

- Use the `PERMISSIONS` constants; never hard-code a slug string.
- Route order matters: static paths (`/search`, `/mine`) must be declared **before** `/:id`.
- Mount it in `interfaces/routes/index.js`; remember `/auth` must come before `authMiddleware`, every other router after.
- File upload → use `upload.single('file')` from `interfaces/middlewares/uploadMiddleware`.

## 8. Container — `src/container.js`

Add three groups of lines (keeping the import → register order):

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

## 9. New permission slug

Add it to `src/domain/constants/permissions.js`, then run:

```bash
npm run seed:system
```

The seed is idempotent (upserts permissions, restores soft-deleted roles) — re-running it won't corrupt data.

## 10. Verify

```bash
npm run dev
curl -H "Authorization: Bearer <accessToken>" http://localhost:5000/api/posts
```

- A regular user needs the permission granted via `/api/roles/:id/permissions`; if you just changed permissions and still get 403, the Redis cache `user_permissions:<userId>` hasn't been cleared (TTL 600s) — delete the key or call the assign/remove API so it clears itself.
- An `AwilixResolutionError` means you forgot to register something in `container.js`.

## Common failures

| Symptom | Cause |
|---|---|
| `Could not resolve 'xController'` | Not registered in `container.js` |
| New route always 404s | Not mounted in `routes/index.js`, or shadowed by an earlier `/:id` |
| Changed a model column but the DB didn't change | `sequelize.sync({ alter: false })` — you must `ALTER TABLE` by hand or drop the volume |
| Soft-deleted records come back in results | Hand-written query missing `this._applyDeletedFilter()` |
| Transaction hangs / commits into another request | Usecase uses `unitOfWork` but is registered `.singleton()` instead of `.scoped()` |
