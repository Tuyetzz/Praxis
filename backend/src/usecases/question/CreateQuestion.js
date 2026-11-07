// src/usecases/question/CreateQuestion.js
const Question = require('../../domain/entities/Question');

class CreateQuestion {
  constructor({ questionRepository, subjectRepository, chapterRepository }) {
    this.questionRepository = questionRepository;
    this.subjectRepository = subjectRepository;
    this.chapterRepository = chapterRepository;
  }

  async execute(questionData) {
    const { subjectId, chapterId, type, text, explanation, difficulty, points, media, tags } = questionData;

    // Validate subject and chapter exist
    const subject = await this.subjectRepository.findById(subjectId);
    if (!subject) throw new Error("Subject not found.");

    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) throw new Error("Chapter not found.");
    
    const chapterBelongsToSubject = await this.chapterRepository.existsBySubjectAndId(subjectId, chapterId);
    if (!chapterBelongsToSubject) {
      throw new Error("Chapter does not belong to the specified subject.");
    }

    // Create and validate question entity
    const question = new Question({
      subjectId,
      chapterId,
      type,
      text,
      explanation,
      difficulty: difficulty || 1,
      points: points || 1,
      media: media || [],
      tags: tags || []
    });

    return await this.questionRepository.create(question);
  }
}

module.exports = CreateQuestion;
