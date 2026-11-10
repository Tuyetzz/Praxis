# Backend tests

Uses the **built-in Node test runner** (`node:test`). No Jest, no Vitest, no
config file, **no new dependencies** — Node 18+ has everything.

## Running

```bash
npm test              # run everything
npm run test:unit     # only test/unit
npm run test:watch    # re-run on file change (dev)
```

## Layout

```
test/
└── unit/                              # no DB, no network, no server
    ├── domain/Subject.test.js         # entity rules
    ├── usecases/CreateSubject.test.js # business logic (fake repository)
    └── controllers/SubjectController.test.js # HTTP contract (fake req/res)
```

Mirror `src/` inside `test/`. A test for `src/usecases/subject/CreateSubject.js`
goes in `test/unit/usecases/CreateSubject.test.js`.

## The three patterns

**1. Domain — test the entity directly.** Pure and synchronous.

```js
const subject = new Subject({ name: "Math", slug: "math" });
assert.equal(subject.order, 0);
assert.throws(() => new Subject({ name: "M", slug: "math" }), /at least 2/);
```

**2. Usecase — inject a fake repository.** This is the pattern you'll reuse most.
The real repository needs MySQL; the usecase only needs an object with the right
methods. `mock.fn()` also lets you assert *how* it was called.

```js
const repository = {
  findBySlug: mock.fn(async () => null),
  create: mock.fn(async (data) => ({ ...data, id: "uuid" })),
};
const usecase = new CreateSubject({ subjectRepository: repository });

await usecase.execute({ name: "Math", slug: "math" });

assert.equal(repository.create.mock.callCount(), 1);
```

**3. Controller — fake `req` and `res`.** No server started. `res.status()` must
return `this` so calls can chain like real Express.

```js
const res = makeRes();
await controller.create({ body: { name: "Math", slug: "math" } }, res);
assert.equal(res.statusCode, 201);
```

## Ideas worth testing

- `CreateSubject` calls `findBySlug` **before** `create`
- invalid input never reaches the repository (`callCount() === 0`)
- a duplicate slug produces `"Slug is already in use."`
- deleted records are excluded from lookups

## Notes

**Assert message text loosely.** Tests match with regex (`/at least 2/`) rather
than exact strings, so rewording a message doesn't break them. Watch out: the
`CreateSubject` *usecase* throws English messages while the `Subject` *entity*
throws Vietnamese ones — that inconsistency is real and these tests document it.

**`node --test` with no arguments auto-discovers** `*.test.js` anywhere under the
project. Passing a bare directory (`node --test test/unit`) behaves differently
across Node versions — prefer no argument, which is what `npm test` uses.

**Exit codes matter for CI.** `0` = all passed, `1` = something failed. Actions
reads this to decide whether the job is green. Verified both ways.

## Not yet covered

These are deliberately out of scope for now, and are the natural next step:

- **Integration tests** — real HTTP against the Express app. Note
  `src/app.js` hits the real database and Redis, so these need a test database
  and a way to drop `authMiddleware` (every route behind it requires a JWT).
- **Repository tests** — need a live MySQL, so they belong in a CI service
  container, not `test/unit`.
- Everything except Subject. `CreateChapter`, `CreateQuestion`, `StartAttempt`
  and the AI usecase are the ones worth doing next.
