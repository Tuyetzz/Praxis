// src/usecases/attempt/GetAttempt.js
class GetAttempt {
  constructor({ attemptRepository }) {
    this.attemptRepository = attemptRepository;
  }

  async execute(attemptId) {
    if (!attemptId) {
      throw new Error("Attempt ID is required.");
    }

    const attempt = await this.attemptRepository.findById(attemptId);
    if (!attempt) {
      throw new Error("Attempt not found.");
    }

    return attempt;
  }
}

module.exports = GetAttempt;
