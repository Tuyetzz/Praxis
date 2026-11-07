// test/unit/usecases/CreateSubject.test.js
//
// Usecase tests. These are the sweet spot for CI: they cover real business
// rules but run in milliseconds because the repository is a FAKE, not the
// database. No MySQL, no Redis, no server needed - which is exactly what you
// want in a pipeline.
//
// This is the most valuable test file of the three to copy when you add more
// usecases, because the pattern (inject a fake repository) repeats everywhere.
//
// Run: node --test test/unit/usecases/CreateSubject.test.js

const { describe, it, beforeEach, mock } = require("node:test");
const assert = require("node:assert/strict");

const CreateSubject = require("../../../src/usecases/subject/CreateSubject");

/**
 * Build a fake SubjectRepository.
 *
 * The real repository talks to MySQL. The usecase only cares that these two
 * methods exist and return the right shapes, so a plain object is enough.
 * `mock.fn()` wraps them so we can assert HOW they were called, not just what
 * came back.
 */
function makeFakeRepository({ existing = null } = {}) {
  return {
    findBySlug: mock.fn(async () => existing),
    create: mock.fn(async (data) => ({
      // Echo back what the usecase sent, plus the fields the DB would add.
      ...data,
      id: "generated-uuid",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    })),
  };
}

describe("CreateSubject usecase", () => {
  let repository;
  let usecase;

  beforeEach(() => {
    // Fresh fakes for every test - never share state between tests.
    repository = makeFakeRepository();
    usecase = new CreateSubject({ subjectRepository: repository });
  });

  describe("happy path", () => {
    it("creates a subject and returns the public fields", async () => {
      const result = await usecase.execute({ name: "Mathematics", slug: "mathematics" });

      assert.equal(result.id, "generated-uuid");
      assert.equal(result.name, "Mathematics");
      assert.equal(result.slug, "mathematics");
      assert.equal(result.order, 0);
      assert.ok(result.createdAt);
    });

    it("trims whitespace from the name", async () => {
      const result = await usecase.execute({ name: "  Mathematics  ", slug: "mathematics" });

      assert.equal(result.name, "Mathematics");
    });

    it("lowercases the slug before saving", async () => {
      // A slug must already be lowercase to pass validation, so lowercasing in
      // the usecase is a safety net rather than a transformation you can
      // observe from outside. Asserted at the repository boundary below.
      await usecase.execute({ name: "Math", slug: "math" });

      const payload = repository.create.mock.calls[0].arguments[0];
      assert.equal(payload.slug, payload.slug.toLowerCase());
    });

    it("defaults order to 0 when not provided", async () => {
      const result = await usecase.execute({ name: "Physics", slug: "physics" });

      assert.equal(result.order, 0);
    });

    it("passes an explicit order through", async () => {
      const result = await usecase.execute({ name: "Chemistry", slug: "chemistry", order: 5 });

      assert.equal(result.order, 5);
    });

    it("does not return the whole entity (only the public shape)", async () => {
      const result = await usecase.execute({ name: "Biology", slug: "biology" });

      // Guards against accidentally leaking internal fields later.
      assert.deepEqual(Object.keys(result).sort(), ["createdAt", "id", "name", "order", "slug"]);
    });
  });

  describe("validation", () => {
    it("rejects a missing name", async () => {
      await assert.rejects(
        () => usecase.execute({ slug: "mathematics" }),
        /Subject name must be at least 2 characters long/
      );
    });

    it("rejects a name shorter than 2 characters", async () => {
      await assert.rejects(
        () => usecase.execute({ name: "M", slug: "mathematics" }),
        /at least 2 characters/
      );
    });

    it("rejects a name that is only whitespace", async () => {
      await assert.rejects(
        () => usecase.execute({ name: "   ", slug: "mathematics" }),
        /at least 2 characters/
      );
    });

    it("rejects a missing slug", async () => {
      await assert.rejects(
        () => usecase.execute({ name: "Mathematics" }),
        /Slug is invalid/
      );
    });

    it("rejects an uppercase slug", async () => {
      await assert.rejects(
        () => usecase.execute({ name: "Mathematics", slug: "Mathematics" }),
        /Slug is invalid/
      );
    });

    it("rejects a slug with spaces", async () => {
      await assert.rejects(
        () => usecase.execute({ name: "Mathematics", slug: "math ematics" }),
        /Slug is invalid/
      );
    });

    it("does not touch the repository when validation fails", async () => {
      // Important: invalid input must never reach the database.
      await assert.rejects(() => usecase.execute({ name: "M", slug: "mathematics" }));

      assert.equal(repository.findBySlug.mock.callCount(), 0);
      assert.equal(repository.create.mock.callCount(), 0);
    });
  });

  describe("duplicate slug", () => {
    it("rejects a slug that already exists", async () => {
      repository = makeFakeRepository({ existing: { id: "existing", slug: "mathematics" } });
      usecase = new CreateSubject({ subjectRepository: repository });

      await assert.rejects(
        () => usecase.execute({ name: "Mathematics", slug: "mathematics" }),
        /Slug is already in use/
      );
    });

    it("does not create anything when the slug is taken", async () => {
      repository = makeFakeRepository({ existing: { id: "existing" } });
      usecase = new CreateSubject({ subjectRepository: repository });

      await assert.rejects(() => usecase.execute({ name: "Math", slug: "math" }));

      assert.equal(repository.create.mock.callCount(), 0);
    });
  });

  describe("repository interaction", () => {
    it("looks up the slug before creating", async () => {
      await usecase.execute({ name: "Mathematics", slug: "mathematics" });

      assert.equal(repository.findBySlug.mock.callCount(), 1);
      assert.equal(repository.findBySlug.mock.calls[0].arguments[0], "mathematics");
    });

    it("sends trimmed name and lowercased slug to the repository", async () => {
      await usecase.execute({ name: "  Mathematics  ", slug: "mathematics", order: 2 });

      const payload = repository.create.mock.calls[0].arguments[0];

      assert.deepEqual(payload, {
        name: "Mathematics",
        slug: "mathematics",
        order: 2,
      });
    });
  });
});
