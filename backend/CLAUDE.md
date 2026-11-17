# Backend — Praxis

API server for the quiz practice app (quiz + flashcards + typing).
Express 5 · Sequelize 6 + MySQL · Redis · Awilix DI · JWT · CommonJS (NOT ESM/`import`).

Related docs:
- `README.md` — author's notes: how to run, request/response shape of the main APIs.
- `ARCHITECTURE.md` — architecture, data model, full endpoint list (with permissions), business rules, known issues.

## Commands

```bash
npm run dev            # nodemon src/server.js
npm run start          # node src/server.js
npm run seed:system    # seed permissions + system roles + superadmin (idempotent)
docker compose up --build   # from the repo root: mysql + redis + backend + frontend
```

No tests, no lint script. No migrations directory.

## Architecture — 4 layers, follow this direction

```
interfaces (routes → controllers)  →  usecases  →  domain (entities/constants)
                                          ↓
                                   infrastructure (repositories → mappers → models)
```

Register dependencies in `src/container.js` (Awilix), resolve by camelCase name.
**Forgetting to register a new repository/usecase/controller in `container.js` is the most common mistake.**

Coding rules:

- **1 usecase = 1 class = 1 action**, method `execute()`. Never call one usecase from another.
- **Controllers hold no business logic**: read `req`, call exactly one usecase, return `res`. Every controller does its own `try/catch` (there is no global error handler).
- **Validate inside the usecase and in the entity constructor** (`entity.validate()`) — do not add validation middleware.
- **Every DB query goes through a repository**; never call a Sequelize model directly from a usecase/controller.
- Models extend `BaseModel`, repositories extend `BaseRepository`, mappers extend `BaseMapper`, entities extend `BaseEntity` — reuse what's provided (`findWithPagination`, `softDelete`, `restore`, `hardDelete`, `_applyDeletedFilter`).
- **Writing to multiple tables → use `unitOfWork`**: `await this.unitOfWork.start()` → pass `this.unitOfWork.getTx()` into the repository → `commit()` / `rollback()` in `catch`. Usecases using transactions must be registered `.scoped()` in the container (like `submitAttempt`).
- **Soft delete is the default** (`DELETE /:id`); restore with `PATCH /:id/restore`; only attempts / typing-texts / typing-results support hard delete. `BaseRepository` filters `isDeleted = false` automatically.
- `createdBy`/`updatedBy` are set automatically by `BaseModel` from `AsyncLocalStorage` (populated by `contextMiddleware`) — don't set them by hand.

## Routes & authorization

- Router lives in `src/interfaces/routes/index.js`: `/auth` is mounted **before** `authMiddleware` (public), every other router sits **after** `authMiddleware` + `contextMiddleware`.
- Every route attaches `requiredPermission('<slug>')`. Slugs are declared in `src/domain/constants/permissions.js` (`resource:action`, e.g. `question:create`). Adding a new slug requires re-running `npm run seed:system` to write it to the DB.
- Superadmin bypasses every permission check. A user's permissions are cached in Redis under `user_permissions:<userId>` (TTL 600s) — **clear the cache when you change roles/permissions** (`redisClient.delPattern('user_permissions:*')` or `del` for a single user).
- `requiredRole()` exists but is unused; admin/superadmin checks currently live inside usecases.

## Responses & errors

- `/api/auth/*` returns an envelope `{ success, message?, data? }`; other resources return the usecase payload directly, and errors are `{ message }`.
- Status codes: `200` read/update · `201` create · `204` soft delete · `200 { success: true }` for hard delete.
- Business errors are thrown as `new Error("...")` inside the usecase; the controller catches and returns them (usually 400).

## Things to watch when editing

- `sequelize.sync({ alter: false })` runs at boot — **changing a column in a model does NOT update an existing DB**. You must `ALTER TABLE` by hand or `docker compose down -v` and re-seed.
- CORS is hard-coded to `http://localhost:5173` in `src/app.js`; `rateLimiter` is commented out.
- Question import accepts files up to 5MB via multer `memoryStorage`; multer errors bypass the controller's try/catch, so they return HTML instead of JSON.
- `POST /api/typing-texts/summarize` calls an external AI service using a client-supplied `baseUrl` (only hosts under `ngrok-free.app` / `ngrok.io` are allowed) — be careful when touching this.
- `audit_logs` and `LocalStorageService`/`S3StorageService` are scaffolding only, not wired up.
- Comments in the code are a mix of Vietnamese and English; keep the style of the file you're editing.

## File map

| What you need | Where |
|---|---|
| Add/edit an endpoint | `interfaces/routes/`, `interfaces/controllers/` |
| Business logic | `usecases/<feature>/` |
| Tables & columns | `infrastructure/database/models/`, associations in `models/index.js` |
| DB queries | `infrastructure/repositories/` |
| Map model ↔ entity | `infrastructure/mappers/` |
| Enums, permission slugs | `domain/constants/` |
| Auth/JWT/bcrypt | `interfaces/middlewares/authMiddleware.js`, `infrastructure/utils/auth_helper.js` |
| Transactions | `infrastructure/unitOfWork/SequelizeUnitOfWork.js` |
| Scheduled jobs | `infrastructure/jobs/autoSubmitAttempts.js` |
| Seed | `usecases/base/SeedSystemData.js` |
| DI registration | `src/container.js` |

The `add-api-endpoint` skill (`.claude/skills/add-api-endpoint/`) has a step-by-step checklist for adding a new resource.
