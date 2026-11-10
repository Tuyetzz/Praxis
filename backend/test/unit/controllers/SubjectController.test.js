// test/unit/controllers/SubjectController.test.js
//
// Controller tests. Controllers are thin (read req, call usecase, write res),
// so these check the HTTP contract: status codes and response bodies.
//
// No server is started. We call the method directly with fake req/res objects
// that record what the controller did. This keeps the test fast, and it is how
// you assert "a validation error becomes a 400" without spinning up Express.
//
// Run: node --test test/unit/controllers/SubjectController.test.js

const { describe, it, beforeEach, mock } = require("node:test");
const assert = require("node:assert/strict");

const SubjectController = require("../../../src/interfaces/controllers/SubjectController");

/**
 * Minimal fake Express response that records the calls made to it.
 * `res.status(201).json(x)` is chainable in Express, so ours must be too.
 */
function makeRes() {
  const res = {
    statusCode: null,
    body: null,
    ended: false,
    status(code) {
      this.statusCode = code;
      return this; // chainable, like real Express
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    send(payload) {
      this.body = payload;
      this.ended = true;
      return this;
    },
  };
  return res;
}

/** Build a controller whose usecases are all mocks. */
function makeController(overrides = {}) {
  const noop = mock.fn(async () => ({}));
  return new SubjectController({
    createSubject: { execute: noop },
    getSubjects: { execute: noop },
    getOneSubject: { execute: noop },
    updateSubject: { execute: noop },
    deleteSubject: { execute: noop },
    searchSubject: { execute: noop },
    restoreSubject: { execute: noop },
    ...overrides,
  });
}

describe("SubjectController.create", () => {
  let createExecute;
  let controller;
  let res;

  beforeEach(() => {
    createExecute = mock.fn(async () => ({
      id: "uuid-1",
      name: "Mathematics",
      slug: "mathematics",
      order: 0,
    }));
    controller = makeController({ createSubject: { execute: createExecute } });
    res = makeRes();
  });

  it("responds 201 on success", async () => {
    await controller.create({ body: { name: "Mathematics", slug: "mathematics" } }, res);

    assert.equal(res.statusCode, 201);
  });

  it("returns the created subject as JSON", async () => {
    await controller.create({ body: { name: "Mathematics", slug: "mathematics" } }, res);

    assert.deepEqual(res.body, {
      id: "uuid-1",
      name: "Mathematics",
      slug: "mathematics",
      order: 0,
    });
  });

  it("passes req.body straight to the usecase", async () => {
    const body = { name: "Mathematics", slug: "mathematics", order: 4 };

    await controller.create({ body }, res);

    assert.equal(createExecute.mock.callCount(), 1);
    assert.deepEqual(createExecute.mock.calls[0].arguments[0], body);
  });

  it("responds 400 with the message when the usecase throws", async () => {
    createExecute = mock.fn(async () => {
      throw new Error("Slug is already in use.");
    });
    controller = makeController({ createSubject: { execute: createExecute } });

    await controller.create({ body: { name: "Math", slug: "math" } }, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: "Slug is already in use." });
  });

  it("does not leak a stack trace in the error body", async () => {
    // The API contract is `{ message }` only - a thrown Error has `stack`,
    // so this guards against ever serialising the whole error object.
    createExecute = mock.fn(async () => {
      throw new Error("boom");
    });
    controller = makeController({ createSubject: { execute: createExecute } });

    await controller.create({ body: {} }, res);

    assert.deepEqual(Object.keys(res.body), ["message"]);
  });

  it("handles a missing body without crashing", async () => {
    // Express gives req.body = {} when nothing is sent, but be explicit.
    createExecute = mock.fn(async () => {
      throw new Error("Subject name must be at least 2 characters long.");
    });
    controller = makeController({ createSubject: { execute: createExecute } });

    await controller.create({ body: {} }, res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.message);
  });
});

describe("SubjectController.delete", () => {
  it("responds 204 with no body on success", async () => {
    const deleteExecute = mock.fn(async () => undefined);
    const controller = makeController({ deleteSubject: { execute: deleteExecute } });
    const res = makeRes();

    await controller.delete({ params: { id: "uuid-1" } }, res);

    assert.equal(res.statusCode, 204);
  });

  it("passes the id from req.params", async () => {
    const deleteExecute = mock.fn(async () => undefined);
    const controller = makeController({ deleteSubject: { execute: deleteExecute } });
    const res = makeRes();

    await controller.delete({ params: { id: "uuid-42" } }, res);

    assert.equal(deleteExecute.mock.calls[0].arguments[0], "uuid-42");
  });

  it("responds 400 when the usecase throws", async () => {
    const deleteExecute = mock.fn(async () => {
      throw new Error("Subject not found.");
    });
    const controller = makeController({ deleteSubject: { execute: deleteExecute } });
    const res = makeRes();

    await controller.delete({ params: { id: "missing" } }, res);

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: "Subject not found." });
  });
});
