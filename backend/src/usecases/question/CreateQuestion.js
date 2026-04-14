// src/usecases/question/CreateQuestion.js
const questionRepository = require('../../infrastructure/repositories/QuestionRepository');
const subjectRepository = require('../../infrastructure/repositories/SubjectRepository');
const chapterRepository = require('../../infrastructure/repositories/ChapterRepository');
const Question = require('../../domain/entities/Question');

class CreateQuestion {
  async execute(questionData) {
    const { subjectId, chapterId, type, text, explanation, difficulty, points, media, tags } = questionData;

    // Validate subject and chapter exist
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) throw new Error("Subject not found.");

    const chapter = await chapterRepository.findById(chapterId);
    if (!chapter) throw new Error("Chapter not found.");
    
    const chapterBelongsToSubject = await chapterRepository.existsBySubjectAndId(subjectId, chapterId);
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

    return await questionRepository.create(question);
  }
}

module.exports = new CreateQuestion();
