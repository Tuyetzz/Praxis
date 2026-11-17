# Backend — Praxis

Express 5 · Sequelize 6 + MySQL 8 · Redis · Awilix DI · JWT · CommonJS.

```bash
npm run dev            # start with nodemon
npm run seed:system    # seed permissions, roles and the superadmin user
npm test               # run the test suite
```

---

## Project structure

```
src/
├── domain/
│   ├── entities/          # Data classes and their validation rules
│   └── constants/         # Business constants (enums, permission slugs)
├── usecases/
│   ├── user/              # e.g. RegisterUser.js, GetUserProfile.js
│   └── base/              # Shared business logic
├── interfaces/
│   ├── controllers/       # Accept HTTP requests, dispatch to a usecase
│   ├── routes/            # Endpoint declarations
│   └── middlewares/       # Auth, context, upload, rate limiting
├── infrastructure/
│   ├── database/
│   │   ├── models/        # Sequelize models (extend BaseModel)
│   │   └── config/        # MySQL connection
│   ├── repositories/      # Repository implementations (extend BaseRepository)
│   └── utils/             # Bcrypt, JWT helpers
└── server.js
```

The seed creates one superadmin user, every permission from
`domain/constants/permissions.js`, and the base roles (`admin`, `teacher`,
`student`).

### Read flow

1. The repository queries the database using an infrastructure model.
   Tables are created from the models at boot.
2. The mapper converts the record into a domain entity.
3. The usecase receives the domain entity.

### Write flow

1. The usecase creates or mutates a domain entity.
2. The repository converts it back to a plain object via the mapper's
   `toPersistence()`.
3. Infrastructure issues the insert/update.

---

## API Endpoints

All `/api/*` routes require `Authorization: Bearer <accessToken>` unless marked
public. Errors use `{ message }`, except `/api/auth/*` which uses the envelope
`{ success, message, data }`.

### Health (public)

| Method | URL              | Description                                                        |
|--------|------------------|--------------------------------------------------------------------|
| GET    | /api/health      | Checks MySQL and Redis. `200` if the DB is up, `503` if it is down |
| GET    | /api/health/live | Liveness only — does not touch MySQL or Redis                      |

Response from `/api/health`:

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

**Important notes**

- These two endpoints require **no authentication** — Docker healthchecks, load
  balancers and uptime monitors cannot send a JWT. They are mounted **before**
  `authMiddleware` in `routes/index.js`.
- **Redis being down does NOT fail `/health`** (it still returns `200` with
  `status: "ok"`), because Redis is only a cache — `authMiddleware` falls back
  to the database. Only a DB outage returns `503`.
- Each dependency has its own timeout (2000ms by default) and they run in
  parallel, so one slow service cannot stall the whole check.
- The Docker healthcheck uses `/health/live` (not `/health`) so a brief
  Redis/MySQL hiccup does not cause a restart loop.

### Auth

| Method | URL                | Body                      | Description                        |
|--------|--------------------|---------------------------|------------------------------------|
| POST   | /api/auth/register | { name, email, password } | Register an account                |
| POST   | /api/auth/login    | { email, password }       | Log in                             |
| POST   | /api/auth/refresh  | { refreshToken }          | Exchange a refresh token           |
| POST   | /api/auth/logout   | { refreshToken }          | Revoke the session                 |

### User (requires authentication)

| Method | URL              | Body        | Description                          |
|--------|------------------|-------------|--------------------------------------|
| GET    | /api/users       | ?filter     | List users                           |
| GET    | /api/users/me    | -           | Current user profile                 |
| POST   | /api/users       | { ...user } | Create a user                        |
| PUT    | /api/users/:id   | { ...user } | Update a user                        |
| DELETE | /api/users/:id   | -           | Soft delete (admin/superadmin)       |

### Role (requires `role:manage` or `permission:manage`)

| Method | URL                             | Body               | Description                    |
|--------|---------------------------------|--------------------|--------------------------------|
| GET    | /api/roles                      | ?filter            | List roles                     |
| POST   | /api/roles                      | { name, description } | Create a role               |
| GET    | /api/roles/:id                  | -                  | Get one role                   |
| PUT    | /api/roles/:id                  | { name, description } | Update a role               |
| DELETE | /api/roles/:id                  | -                  | Delete a role                  |
| GET    | /api/roles/:id/permissions      | -                  | Permissions granted to a role   |
| POST   | /api/roles/:id/permissions      | { permissionId }   | Grant a permission              |
| DELETE | /api/roles/:id/permissions      | { permissionId }   | Revoke a permission             |
| POST   | /api/roles/:id/users            | { userId }         | Assign a role to a user         |
| DELETE | /api/roles/:id/users/:userId    | -                  | Remove a role from a user       |
| GET    | /api/roles/users/:userId/roles  | -                  | Roles held by a user            |

### Permission (requires `permission:manage`)

| Method | URL              | Description        |
|--------|------------------|--------------------|
| GET    | /api/permissions | List permissions   |

### Subject (requires authentication and the matching permission)

| Method | URL                     | Query                      | Description            |
|--------|-------------------------|----------------------------|------------------------|
| GET    | /api/subjects/search    | search, page, limit, order | Paginated search       |
| GET    | /api/subjects           | -                          | List subjects          |
| GET    | /api/subjects/:id       | -                          | Get one subject        |
| POST   | /api/subjects           | { ...subject }             | Create a subject       |
| PUT    | /api/subjects/:id       | { ...subject }             | Update a subject       |
| DELETE | /api/subjects/:id       | -                          | Soft delete            |

### Chapter

| Method | URL                              | Query                                 | Description               |
|--------|----------------------------------|---------------------------------------|---------------------------|
| GET    | /api/chapters                    | -                                     | List chapters             |
| GET    | /api/chapters/search             | search, subjectId, page, limit, order | Paginated search          |
| GET    | /api/chapters/subject/:subjectId | -                                     | Chapters for a subject    |
| GET    | /api/chapters/:id                | -                                     | Get one chapter           |
| POST   | /api/chapters                    | { ...chapter }                        | Create a chapter          |
| PUT    | /api/chapters/:id                | { ...chapter }                        | Update a chapter          |
| DELETE | /api/chapters/:id                | -                                     | Soft delete               |

### Question

| Method | URL                               | Body / Query                                                  | Description                     |
|--------|-----------------------------------|---------------------------------------------------------------|---------------------------------|
| GET    | /api/questions/search             | search, subjectId, chapterId, type, difficulty, page, limit, order | Paginated search           |
| GET    | /api/questions                    | -                                                             | List questions                  |
| GET    | /api/questions/subject/:subjectId | -                                                             | Questions for a subject         |
| GET    | /api/questions/chapter/:chapterId | -                                                             | Questions for a chapter         |
| GET    | /api/questions/:id                | -                                                             | Get one question                |
| POST   | /api/questions/batch              | See "Batch format" below                                      | Create many questions at once   |
| POST   | /api/questions                    | { subjectId, chapterId, type, text, explanation, difficulty, points, media, tags } | Create a question |
| PUT    | /api/questions/:id                | { type, text, explanation, difficulty, points, media, tags }   | Update a question               |
| DELETE | /api/questions/:id                | -                                                             | Soft delete                     |

#### Batch format

`POST /api/questions/batch`

```json
{
  "mode": "all-or-nothing",
  "subjectId": "uuid",
  "chapterId": "uuid",
  "type": "single",
  "items": [
    {
      "text": "Question text",
      "explanation": "Optional explanation",
      "difficulty": 1,
      "points": 1,
      "media": [],
      "tags": [],
      "options": [
        { "text": "Option A", "isCorrect": true, "order": 1, "media": null },
        { "text": "Option B", "isCorrect": false, "order": 2 }
      ]
    }
  ]
}
```

- `mode`: `all-or-nothing` (roll back everything if one item fails) or
  `continue-on-error` (skip failed items).
- `subjectId`, `chapterId`: required.
- `type`: taken from the batch level by default; each item may override it.
- Optional per-item fields fall back to defaults (`explanation`, `difficulty`,
  `points`, `media`, `tags`).
- `options` may be empty.
- Response: `{ mode, created, errors?, data }`.

### Option (uses the `question:*` permissions)

| Method | URL                               | Body                                          | Description          |
|--------|-----------------------------------|-----------------------------------------------|----------------------|
| GET    | /api/options                      | -                                             | List options         |
| GET    | /api/options/question/:questionId | -                                             | Options for a question |
| GET    | /api/options/:id                  | -                                             | Get one option       |
| POST   | /api/options                      | { questionId, text, isCorrect, media, order } | Create an option     |
| PUT    | /api/options/:id                  | { text, isCorrect, media, order }             | Update an option     |
| DELETE | /api/options/:id                  | -                                             | Soft delete          |

### Flashcard deck

| Method | URL                        | Body                | Description                          |
|--------|----------------------------|---------------------|--------------------------------------|
| GET    | /api/flashcard-decks/mine  | -                   | Decks owned by the caller             |
| GET    | /api/flashcard-decks/public| -                   | Public decks                          |
| GET    | /api/flashcard-decks/:id   | -                   | Get one deck (if viewable)            |
| POST   | /api/flashcard-decks       | { title, isPublic } | Create a deck                         |
| PUT    | /api/flashcard-decks/:id   | { title, isPublic } | Update a deck                         |
| DELETE | /api/flashcard-decks/:id   | -                   | Soft delete                           |

### Flashcard

| Method | URL                            | Body / Query                             | Description                  |
|--------|--------------------------------|------------------------------------------|------------------------------|
| GET    | /api/flashcards/deck/:deckId   | -                                        | Cards in a deck              |
| GET    | /api/flashcards/export/:deckId | ?format=txt\|csv                         | Download a deck              |
| GET    | /api/flashcards/:id            | -                                        | Get one card                 |
| POST   | /api/flashcards                | { deckId, frontText, backText, order, nextReview } | Create a card     |
| POST   | /api/flashcards/import         | multipart: file + deckId                 | Import cards from a file     |
| PUT    | /api/flashcards/:id            | { frontText, backText, order, nextReview } | Update a card              |
| DELETE | /api/flashcards/:id            | -                                        | Soft delete                  |

#### Import flashcards

`POST /api/flashcards/import` — `multipart/form-data` with fields `file` and
`deckId`. Only the deck owner may import (same rule as creating a card).
Maximum **500 cards** per import.

**`.txt` format** — one card per line, separated by ` - ` (a hyphen with a space
on each side):

```
# Lines starting with # are comments and are ignored
Bustling - nhộn nhịp (bustling city)
well-known - nổi tiếng
```

- Only the **first** ` - ` splits the line, so `well-known` is not broken apart.
- The back side may contain hyphens and commas.
- Blank lines and comment lines are skipped.
- Lines missing either side are skipped (not counted as errors).

**`.csv` / `.xlsx` format** — requires a header row. Recognised column names
(case-insensitive):

| Front | Back |
|---|---|
| `front`, `frontText`, `term`, `word`, `question` | `back`, `backText`, `definition`, `meaning`, `answer` |

```csv
front,back
Bustling,nhộn nhịp
"proximity","(n) sự lân cận, trạng thái gần"
```

**`.json` format** — an array of objects:

```json
[{ "front": "Bustling", "back": "nhộn nhịp" }]
```

**Response**

```json
{
  "totalCards": 14,
  "imported": 14,
  "failed": 0,
  "errors": [{ "line": 3, "error": "Mặt trước của thẻ không được để trống." }]
}
```

> `errors[].error` is the entity's own validation message, passed through
> verbatim. Some entity messages are still Vietnamese (see
> `domain/entities/Flashcard.js`) while usecase messages are English — the
> payload above is real output, not a placeholder.

Imported cards continue from the highest existing `order` in the deck, so they
land at the end rather than interleaving. `errors` only appears when a row
failed.

> Downloadable template: `frontend/public/flashcard-import-example.txt`
> (served at `/flashcard-import-example.txt`).

#### Export flashcards

`GET /api/flashcards/export/:deckId?format=txt` — returns the file with
`Content-Disposition: attachment`, so the browser downloads it.

- `format=txt` (default) — same layout as the importer, so an exported deck can
  be **re-imported without conversion**.
- `format=csv` — includes a `front,back` header; values containing commas are
  quoted.
- Anyone who can view the deck (owner or public) may export it.
- Newlines inside a card are collapsed to spaces to preserve one line per card.

### Attempt

| Method | URL                              | Body                                                       | Description                   |
|--------|----------------------------------|------------------------------------------------------------|-------------------------------|
| POST   | /api/attempts/start              | { subjectId, chapterId, mode, settings }                   | Start an attempt              |
| GET    | /api/attempts/:id                | -                                                          | Get one attempt               |
| POST   | /api/attempts/:attemptId/answers | { questionId, optionId/selectedOptionIds, value, flagged }  | Save an answer                |
| POST   | /api/attempts/:attemptId/submit  | -                                                          | Submit and grade              |

**Flow**

1. `POST /api/attempts/start` creates an attempt with `status: in_progress`.
2. Each answer selection calls `POST /api/attempts/:attemptId/answers`.
3. `POST /api/attempts/:attemptId/submit` finalises and grades it
   (`status: graded`).
4. `GET /api/attempts/:id` returns the attempt at any point.

**`settings` sent to `start`**

```json
{
  "paging": "1-50",
  "questionsPerPage": 10,
  "questionTimeSeconds": 30,
  "showAnswerAfterSelect": true,
  "shuffleQuestions": true
}
```

**Notes**

- Only the user who created an attempt may act on it.
- Submitting grades immediately; answers cannot change afterwards.
- Answers are saved per question and may be updated repeatedly until submission.
- `showAnswerAfterSelect` only takes effect in `practice` mode.

**Answering, by question type** (`questionId` is always required; `flagged` is
optional)

```jsonc
// single / true_false
{ "questionId": "uuid", "optionId": "uuid", "flagged": true }

// multiple
{ "questionId": "uuid", "selectedOptionIds": ["uuid-1", "uuid-2"] }

// fill_blank
{ "questionId": "uuid", "value": "the answer text" }
```

**Grading (automatic on submit)**

| Question type | Rule |
|---|---|
| `single` / `true_false` | the selected option must equal the correct option |
| `multiple` | selected set must match the correct set exactly |
| `fill_blank` | case-insensitive comparison against the correct option's text |

A correct answer earns the question's full `points`; a wrong one earns 0.
`score` is the sum of earned points. Response:
`{ attempt, totalEarnedPoints, maxScore, correctCount, totalCount }`.

### Grading result

| Method | URL                            | Description                       |
|--------|--------------------------------|-----------------------------------|
| GET    | /api/attempts/:attemptId/grade | Detailed result of a graded attempt |

Returns the attempt, summary statistics, and a per-question breakdown including
the correct answers.

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

> Reads the summary persisted at submit time; it does not re-grade.

### Typing text

| Method | URL                    | Body                                                                      | Description        |
|--------|------------------------|---------------------------------------------------------------------------|--------------------|
| GET    | /api/typing-texts/mine | -                                                                         | Texts authored by the caller |
| GET    | /api/typing-texts/public | -                                                                       | Public texts       |
| GET    | /api/typing-texts      | -                                                                         | All texts          |
| GET    | /api/typing-texts/:id  | -                                                                         | Get one text       |
| POST   | /api/typing-texts      | { title, content, language, isPublic, difficulty, isDefault, sourceType } | Create a text      |
| PUT    | /api/typing-texts/:id  | { title, content, language, isPublic, difficulty, isDefault, sourceType } | Update a text      |
| DELETE | /api/typing-texts/:id  | -                                                                         | Soft delete        |

### Typing result

| Method | URL                                          | Body                                                          | Description              |
|--------|----------------------------------------------|---------------------------------------------------------------|--------------------------|
| GET    | /api/typing-results/mine                     | -                                                             | Results for the caller   |
| GET    | /api/typing-results/text/:textId             | -                                                             | Results for one text     |
| GET    | /api/typing-results/text/:textId/leaderboard | -                                                             | Leaderboard for one text |
| GET    | /api/typing-results/:id                      | -                                                             | Get one result           |
| POST   | /api/typing-results                          | { textId, wpm, accuracy, rawWpm, durationSeconds, errorTags }  | Save a result            |

### AI — question generation

| Method | URL                   | Body                                                                    | Description                          |
|--------|-----------------------|-------------------------------------------------------------------------|--------------------------------------|
| POST   | /api/ai/generate-quiz | { topic, numQuestions, questionTypes, difficulty, subjectId?, chapterId? } | Generate questions (does not persist) |

#### Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENROUTER_API_KEY` | yes | — | OpenRouter API key |
| `OPENROUTER_MODEL` | no | `deepseek/deepseek-chat` | Model used for generation |
| `OPENROUTER_BASE_URL` | no | `https://openrouter.ai/api/v1/chat/completions` | Override when using a proxy |
| `OPENROUTER_TIMEOUT_MS` | no | `60000` | AI request timeout |
| `REDIS_CONNECT_TIMEOUT_MS` | no | `2000` | Redis connect timeout (permission cache) |

> **Model choice:** prefer a **non-reasoning** model such as
> `deepseek/deepseek-chat`. Reasoning models spend part of the token budget on
> hidden reasoning before writing any output, so they frequently return empty
> `content` with `finish_reason: length`. If you see *"ran out of output
> tokens"*, switch `OPENROUTER_MODEL` to a standard model.

#### Request body

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `topic` | string | yes | — | Topic **or** source text to generate from (max 12000 characters) |
| `numQuestions` | int | no | `10` | How many questions (1–50) |
| `questionTypes` | string[] | no | `["single"]` | One or more of `single`, `multiple`, `true_false`, `fill_blank` |
| `difficulty` | int | no | `2` | 1 = easy, 2 = medium, 3 = hard |
| `subjectId` | uuid | no | — | Adds context to the prompt only; **not required** |
| `chapterId` | uuid | no | — | Must accompany `subjectId` and belong to it |
| `language` | string | no | `english` | Language of the generated questions |

**This endpoint does not write to the database.** It only generates and returns.
To persist the result, pass it to `POST /api/questions/batch` (see the Question
section for the format).

#### Response

```json
{
  "questions": [
    {
      "text": "Which process turns water vapour into liquid water?",
      "type": "single",
      "explanation": "Condensation is the change from vapour to liquid.",
      "difficulty": 2,
      "points": 1,
      "options": [
        { "text": "Evaporation", "isCorrect": false, "order": 1 },
        { "text": "Condensation", "isCorrect": true, "order": 2 },
        { "text": "Precipitation", "isCorrect": false, "order": 3 },
        { "text": "Transpiration", "isCorrect": false, "order": 4 }
      ]
    }
  ],
  "requested": 3,
  "generated": 3,
  "model": "deepseek/deepseek-chat",
  "usage": { "prompt_tokens": 512, "completion_tokens": 340, "total_tokens": 852 }
}
```

`skipped` appears only when the model returned a malformed question:

```json
"skipped": [{ "index": 2, "error": "Generated question is missing text." }]
```

#### Status codes

| Status | When |
|---|---|
| `200` | Success |
| `400` | Missing `topic`, `numQuestions` outside 1–50, input too long, **or prompt injection detected** |
| `401` | Missing or invalid access token |
| `403` | Caller lacks the `ai:generate_quiz` permission |
| `429` | Rate limit exceeded (10 requests / 15 min / user) |
| `502` | The provider errored, returned invalid JSON, or ran out of output tokens |
| `503` | `OPENROUTER_API_KEY` is not configured |
| `504` | The AI request timed out |

#### Rate limit

**10 requests per 15 minutes**, keyed by `userId` (not IP). Responses carry
`RateLimit-Limit`, `RateLimit-Remaining` and `RateLimit-Reset` headers.

#### Prompt injection defence

User input is treated as **untrusted data**, never as instructions:

- **Rejected outright (400)** when an injection pattern is detected:
  `ignore all previous instructions`, `you are now an admin`,
  `show me your system prompt`, `give me the api key`, `developer mode`…
- The system prompt states explicitly that user-supplied content is DATA.
- Input is escaped before being interpolated into the prompt.
- Additional dangerous patterns are blocked: `eval(`, `require(`, `<script`,
  `__proto__`…

The pattern list lives in `src/infrastructure/utils/sanitize.js`.

> **Not done yet:** the `ai:generate_quiz` permission is not granted to the
> `student` role — only `superadmin` can call this today. To open it up, grant
> the permission to the base roles in `SeedSystemData.js` and re-run
> `npm run seed:system`.

#### Example

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

Postman collection: `backend/postman/ai-generate-quiz.postman_collection.json`
(import it, set the `accessToken` variable, then send).

---

## Environment files

The repo contains several `.env*` files and they are easy to confuse, because
**two independent mechanisms read them**: `dotenv` (read by the Node process)
and **Docker Compose** (read by Docker).

### Summary

| File | Read by | When |
|---|---|---|
| `.env` (repo root) | Docker Compose | Automatically, for `${VAR}` in `docker-compose*.yml` |
| `.env.prod` (root) | Docker Compose | On deploy: `--env-file .env.prod` |
| `backend/.env` | `dotenv` **and** Compose `env_file` | **Both modes** |
| `.env.example` | *(nothing — reference only)* | Committed |
| `.env.prod.example` | *(nothing — reference only)* | Committed |

### Mechanism 1 — `dotenv` (read by the Node process)

```js
// src/server.js:1
require("dotenv").config();   // no arguments
```

With no path, dotenv looks for a file named `.env` in the **current working
directory** (`process.cwd()`):

- Running `npm run dev` inside `backend/` → reads `backend/.env`
- Inside Docker, `WORKDIR /app` → reads `/app/.env` (the mounted `backend/.env`)

This is why the root `.env` has no effect when running locally — the code never
sees it.

### Mechanism 2 — Docker Compose

```yaml
env_file:
  - ./backend/.env      # loads every variable into the container
environment:
  DB_HOST: mysql        # overrides env_file
```

Compose also reads the root `.env` automatically to substitute `${VAR}` inside
the compose files.

**Precedence (highest first):**

```
environment:  >  env_file:  >  .env (root, for ${VAR})
```

### Four real scenarios

**1. Local development**
```bash
cd backend && npm run dev
```
Reads `backend/.env` only.

**2. Docker dev**
```bash
docker compose up
```
All three sources at once:
- root `.env` → provides `${MYSQL_ROOT_PASSWORD}`, `${MYSQL_PASSWORD}`…
- `backend/.env` → `env_file`, loaded into the container
- `environment:` → overrides (`DB_HOST=mysql`, `DB_USER=quizuser`…)

**3. Production deploy**
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```
`.env.prod` replaces the root `.env`. `backend/.env` is **still read**, but
overridden by `environment:`.

**4. CI (GitHub Actions)** — needs no env file at all; every test is a unit test
using fake repositories.

### Rules of thumb

| Kind of variable | Where it goes |
|---|---|
| Infrastructure (host, port, service names) | `docker-compose*.yml` — hard-coded |
| Docker secrets (MySQL password) | root `.env` (dev) / `.env.prod` (prod) |
| Application secrets (JWT, OpenRouter key) | `.env.prod` (prod) or `backend/.env` (local) |
| Variables used only when running locally | `backend/.env` |

**Why `DB_HOST` differs:** locally MySQL is on `localhost`. Inside Docker,
`localhost` is the backend container itself — MySQL is a separate container, so
the service name `mysql` must be used. Compose overrides this via
`environment:`, which lets `backend/.env` stay correct for local runs.

**Why `MYSQL_USER` must not be `root`:** the MySQL entrypoint rejects it and the
container crash-loops:

```
MYSQL_USER and MYSQL_PASSWORD are for configuring a regular user
and cannot be used for the root user
```

---

## Caching

A user's permission slugs are cached under `user_permissions:<userId>`:

- **Key:** `user_permissions:<user-uuid>` (string)
- **Value:** `["permission:one", "permission:two"]` (array of strings)
- **TTL:** 600 seconds

The cache is best-effort: if Redis is unreachable the permission check falls
back to the database instead of failing the request. Any change to roles or
permissions clears the affected keys.

## Pagination examples

```
GET /subjects/search?search=math&page=1&limit=10&order=name
GET /chapters/search?search=chapter1&subjectId=xxx&page=1&limit=10&order=name
```
