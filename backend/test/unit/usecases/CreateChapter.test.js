// test/unit/usecases/CreateChapter.test.js
//
// Chapter is a good second example because the usecase depends on TWO
// repositories: it checks the subject exists, then creates the chapter.
// That means faking two things instead of one, which is the pattern you'll
// repeat for most usecases here.
//
// Validation lives in the USECASE, not the entity - unlike Subject, the Chapter
// entity has no validate() in its constructor. So these tests cover the rules.
//
// Run: node --test test/unit/usecases/CreateChapter.test.js

const { describe, it, beforeEach, mock } = require("node:test");
const assert = require("node:assert/strict");

const CreateChapter = require("../../../src/usecases/chapter/CreateChapter");

/**
 * Two fakes, because this usecase talks to two repositories.
 * `subjectExists: false` simulates an unknown subjectId.
 */
function makeFakes({ subjectExists = true } = {}) {
  return {
    subjectRepository: {
      findById: mock.fn(async (id) => (subjectExists ? { id, name: "Mathematics" } : null)),
    },
    chapterRepository: {
      create: mock.fn(async (data) => ({
        ...data,
        id: "chapter-uuid",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      })),
    },
  };
}

describe("CreateChapter usecase", () => {
  let fakes;
  let usecase;

  beforeEach(() => {
    fakes = makeFakes();
    usecase = new CreateChapter(fakes);
  });

  describe("happy path", () => {
    it("creates a chapter and returns the public fields", async () => {
      const result = await usecase.execute({
        subjectId: "subject-1",
        name: "Algebra",
        order: 1,
      });

      assert.equal(result.id, "chapter-uuid");
      assert.equal(result.subjectId, "subject-1");
      assert.equal(result.name, "Algebra");
      assert.equal(result.order, 1);
      assert.ok(result.createdAt);
    });

    it("defaults order to 0 when omitted", async () => {
      const result = await usecase.execute({ subjectId: "subject-1", name: "Algebra" });

      assert.equal(result.order, 0);
    });

    it("trims whitespace from the name", async () => {
      const result = await usecase.execute({
        subjectId: "subject-1",
        name: "  Algebra  ",
      });

      assert.equal(result.name, "Algebra");
    });

    it("returns only the public shape (no internal fields)", async () => {
      const result = await usecase.execute({ subjectId: "subject-1", name: "Algebra" });

      assert.deepEqual(Object.keys(result).sort(), [
        "createdAt",
        "id",
        "name",
        "order",
        "subjectId",
      ]);
    });
  });

  describe("subject checks", () => {
    it("rejects a missing subjectId", async () => {
      await assert.rejects(
        () => usecase.execute({ name: "Algebra" }),
        /provide the ID of the subject/i
      );
    });

    it("rejects an unknown subjectId", async () => {
      fakes = makeFakes({ subjectExists: false });
      usecase = new CreateChapter(fakes);

      await assert.rejects(
        () => usecase.execute({ subjectId: "nope", name: "Algebra" }),
        /Subject not found/
      );
    });

    it("checks the subject exists BEFORE creating the chapter", async () => {
      // Order matters: creating first would leave an orphan row if the
      // subject check then failed.
      await usecase.execute({ subjectId: "subject-1", name: "Algebra" });

      assert.equal(fakes.subjectRepository.findById.mock.callCount(), 1);
      assert.equal(fakes.chapterRepository.create.mock.callCount(), 1);
    });

    it("does not create a chapter when the subject is missing", async () => {
      fakes = makeFakes({ subjectExists: false });
      usecase = new CreateChapter(fakes);

      await assert.rejects(() => usecase.execute({ subjectId: "nope", name: "Algebra" }));

      assert.equal(fakes.chapterRepository.create.mock.callCount(), 0);
    });
  });

  describe("validation", () => {
    it("rejects a name shorter than 2 characters", async () => {
      await assert.rejects(
        () => usecase.execute({ subjectId: "subject-1", name: "A" }),
        /at least 2 characters/
      );
    });

    it("rejects a missing name", async () => {
      await assert.rejects(
        () => usecase.execute({ subjectId: "subject-1" }),
        /at least 2 characters/
      );
    });

    it("rejects a name that is only whitespace", async () => {
      await assert.rejects(
        () => usecase.execute({ subjectId: "subject-1", name: "   " }),
        /at least 2 characters/
      );
    });

    it("rejects a negative order", async () => {
      await assert.rejects(
        () => usecase.execute({ subjectId: "subject-1", name: "Algebra", order: -1 }),
        /cannot be a negative number/
      );
    });

    it("accepts order 0 (boundary - must not be treated as negative)", async () => {
      const result = await usecase.execute({ subjectId: "subject-1", name: "Algebra", order: 0 });

      assert.equal(result.order, 0);
    });

    it("does not touch the repository when validation fails", async () => {
      // The subject lookup happens first, but create() must never run.
      await assert.rejects(() => usecase.execute({ subjectId: "subject-1", name: "A" }));

      assert.equal(fakes.chapterRepository.create.mock.callCount(), 0);
    });
  });

  describe("repository interaction", () => {
    it("sends subjectId, trimmed name and order to the repository", async () => {
      await usecase.execute({ subjectId: "subject-1", name: "  Algebra  ", order: 3 });

      const payload = fakes.chapterRepository.create.mock.calls[0].arguments[0];

      assert.deepEqual(payload, {
        subjectId: "subject-1",
        name: "Algebra",
        order: 3,
      });
    });

    it("looks up the subject using the provided subjectId", async () => {
      await usecase.execute({ subjectId: "subject-42", name: "Algebra" });

      assert.equal(fakes.subjectRepository.findById.mock.calls[0].arguments[0], "subject-42");
    });
  });
});
