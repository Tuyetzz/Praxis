<div align="center">

# Praxis

**A practice platform for quizzes, flashcards and typing drills.**

Multi-tenant quiz engine with RBAC · AI question generation · spaced-repetition
flashcards · typing trainer with leaderboards.

[![CI](https://github.com/Tuyetzz/Praxis/actions/workflows/ci.yml/badge.svg)](https://github.com/Tuyetzz/Praxis/actions/workflows/ci.yml)

</div>

---

## What it does

| Feature | Description |
|---|---|
| **Quizzes** | Subject → Chapter → Question hierarchy. Build an attempt from any chapter with configurable paging, per-question timing, shuffling and instant feedback. |
| **Auto-grading** | Four question types — single choice, multiple choice, true/false, fill-in-the-blank — graded automatically on submit. |
| **AI generation** | Describe a topic or paste source material and generate a question set, review it, then save it to a chapter. |
| **Flashcards** | Personal or public decks, flip-card study mode, bulk import/export via `.txt`, `.csv`, `.xlsx` or `.json`. |
| **Typing trainer** | Curated and user-authored passages, WPM/accuracy tracking, per-text leaderboards, AI text summarisation. |
| **RBAC** | 38 permission slugs across roles, cached in Redis with a database fallback. |
| **Soft delete** | Every resource is soft-deleted by default, with restore endpoints and admin views that can include or show only deleted rows. |

## Tech stack

**Backend** — Node.js (CommonJS) · Express 5 · Sequelize 6 · MySQL 8 · Redis ·
Awilix (DI) · JWT · Multer · Winston
**Frontend** — React 19 · TypeScript (strict) · Vite 7 · React Router 7 · axios ·
TailwindCSS 3 · lucide-react
**Infrastructure** — Docker Compose (dev + prod) · nginx reverse proxy ·
GitHub Actions

## Architecture

The backend follows a four-layer architecture with dependencies flowing inward:

```
interfaces  →  usecases  →  domain
                    ↓
             infrastructure
```

| Layer | Responsibility |
|---|---|
| `interfaces/` | HTTP: routes, controllers, middlewares. Controllers hold no business logic. |
| `usecases/` | One class per action, one `execute()` method. All validation and orchestration. |
| `domain/` | Entities with their invariants, plus constants (enums, permission slugs). |
| `infrastructure/` | Sequelize models, repositories, mappers, cache, jobs, external services. |

Dependencies are wired through an Awilix container (`backend/src/container.js`),
which makes every layer testable in isolation — the unit tests inject fake
repositories rather than touching a database.

```
Praxis/
├── backend/          # Express API
│   ├── src/
│   ├── test/         # 68 unit tests (node:test, no external runner)
│   └── postman/      # API collection for the AI endpoint
├── frontend/         # React SPA
│   └── src/
├── deploy/           # nginx config + Raspberry Pi deployment guide
├── docker-compose.yml          # development stack
└── docker-compose.prod.yml     # production stack (nginx + static build)
```

## Getting started

### With Docker (recommended)

```bash
git clone git@github.com:Tuyetzz/Praxis.git
cd Praxis
cp .env.example .env          # then fill in the values
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:5000 |
| MySQL | localhost:3307 |

### Running locally

Requires Node 20+, MySQL and Redis.

```bash
# Backend
cd backend
npm install
npm run seed:system    # creates permissions, roles and the superadmin
npm run dev            # http://localhost:5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Testing

```bash
cd backend
npm test               # 68 tests, ~1 second
npm run test:watch     # re-run on change
```

The suite uses Node's built-in test runner — no Jest, no Vitest, no config file.
Because every test fakes its dependencies, `npm test` needs **no database, no
Redis and no `.env`**, which is what lets CI run it without service containers.

## Documentation

| Document | Contents |
|---|---|
| [backend/README.md](backend/README.md) | Full API reference, env file guide, caching |
| [backend/ARCHITECTURE.md](backend/ARCHITECTURE.md) | Data model, auth flow, known issues |
| [frontend/ARCHITECTURE.md](frontend/ARCHITECTURE.md) | Routing, auth flow, design system, tech debt |
| [deploy/README.md](deploy/README.md) | Raspberry Pi deployment, nginx, troubleshooting |
| [frontend/NOTE.md](frontend/NOTE.md) | Original feature spec (Vietnamese) |
| [TODO.md](TODO.md) | Planned work and known bugs |

## Deployment

The production stack puts nginx in front of everything: it serves the built SPA
and proxies `/api` to the backend, so only one port is exposed and the browser
never makes a cross-origin request.

```
            nginx :80
      /              \api/*
   frontend          backend
   (static)          (:5000)
                        │
                  mysql / redis
              (internal network only)
```

Full walkthrough, including Raspberry Pi specifics and troubleshooting:
[deploy/README.md](deploy/README.md).

## License

ISC
