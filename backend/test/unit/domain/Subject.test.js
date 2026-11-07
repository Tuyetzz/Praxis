// test/unit/domain/Subject.test.js
//
// Fastest kind of test: the domain entity has no database, no HTTP, no async.
// Just `new Subject(...)` and assert. These are the ones you want first in CI
// because they finish in milliseconds.
//
// Run: npm test  (or: node --test test/unit/domain/Subject.test.js)

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const Subject = require("../../../src/domain/entities/Subject");

describe("Subject entity", () => {
  describe("valid input", () => {
    it("creates a subject with name and slug", () => {
      const subject = new Subject({ name: "Mathematics", slug: "mathematics" });

      assert.equal(subject.name, "Mathematics");
      assert.equal(subject.slug, "mathematics");
    });

    it("defaults order to 0 when omitted", () => {
      const subject = new Subject({ name: "Physics", slug: "physics" });

      assert.equal(subject.order, 0);
    });

    it("keeps an explicit order", () => {
      const subject = new Subject({ name: "Chemistry", slug: "chemistry", order: 3 });

      assert.equal(subject.order, 3);
    });

    it("defaults isDeleted to false", () => {
      const subject = new Subject({ name: "Biology", slug: "biology" });

      assert.equal(subject.isDeleted, false);
    });

    it("accepts a two-character name (boundary)", () => {
      // The rule is "at least 2", so exactly 2 must pass.
      const subject = new Subject({ name: "IT", slug: "it" });

      assert.equal(subject.name, "IT");
    });

    it("accepts digits and hyphens in the slug", () => {
      const subject = new Subject({ name: "Math 2", slug: "math-2-advanced" });

      assert.equal(subject.slug, "math-2-advanced");
    });
  });

  describe("invalid name", () => {
    it("rejects a missing name", () => {
      assert.throws(() => new Subject({ slug: "mathematics" }), /ít nhất 2 ký tự/);
    });

    it("rejects an empty name", () => {
      assert.throws(() => new Subject({ name: "", slug: "mathematics" }), /ít nhất 2 ký tự/);
    });

    it("rejects a one-character name (boundary)", () => {
      // One below the limit - this is where boundary tests earn their keep.
      assert.throws(() => new Subject({ name: "M", slug: "mathematics" }), /ít nhất 2 ký tự/);
    });
  });

  describe("invalid slug", () => {
    it("rejects a missing slug", () => {
      assert.throws(() => new Subject({ name: "Mathematics" }), /Slug không hợp lệ/);
    });

    it("rejects uppercase letters", () => {
      assert.throws(() => new Subject({ name: "Math", slug: "Mathematics" }), /Slug không hợp lệ/);
    });

    it("rejects spaces", () => {
      assert.throws(() => new Subject({ name: "Math", slug: "math ematics" }), /Slug không hợp lệ/);
    });

    it("rejects underscores", () => {
      assert.throws(() => new Subject({ name: "Math", slug: "math_ematics" }), /Slug không hợp lệ/);
    });

    it("rejects unicode/accented characters", () => {
      assert.throws(() => new Subject({ name: "Toán", slug: "toán" }), /Slug không hợp lệ/);
    });
  });

  describe("updateName", () => {
    it("changes the name", () => {
      const subject = new Subject({ name: "Math", slug: "math" });

      subject.updateName("Mathematics");

      assert.equal(subject.name, "Mathematics");
    });

    it("does not re-validate (documents current behaviour)", () => {
      // updateName bypasses validate(), so an invalid name is accepted here.
      // This test pins the existing behaviour so a future change is deliberate.
      const subject = new Subject({ name: "Math", slug: "math" });

      subject.updateName("");

      assert.equal(subject.name, "");
    });
  });
});
