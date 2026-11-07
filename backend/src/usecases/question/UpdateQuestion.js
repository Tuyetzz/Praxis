// src/usecases/question/UpdateQuestion.js
const Question = require('../../domain/entities/Question');

class UpdateQuestion {
  constructor({ questionRepository, subjectRepository, chapterRepository }) {
    this.questionRepository = questionRepository;
    this.subjectRepository = subjectRepository;
    this.chapterRepository = chapterRepository;
  }

  async execute(id, updateData) {
    const question = await this.questionRepository.findById(id);
    if (!question) throw new Error("Could not find question with the provided id.");

    const hasSubject = Object.prototype.hasOwnProperty.call(updateData, 'subjectId');
    const hasChapter = Object.prototype.hasOwnProperty.call(updateData, 'chapterId');

    if (hasSubject && !updateData.subjectId) throw new Error("Subject ID cannot be empty.");
    if (hasChapter && !updateData.chapterId) throw new Error("Chapter ID cannot be empty.");

    if (hasSubject) {
      const subject = await this.subjectRepository.findById(updateData.subjectId);
      if (!subject) throw new Error("Subject not found.");
    }

    if (hasChapter) {
      const chapter = await this.chapterRepository.findById(updateData.chapterId);
      if (!chapter) throw new Error("Chapter not found.");
    }

    const realSubjectId = updateData.subjectId ?? question.subjectId;
    const realChapterId = updateData.chapterId ?? question.chapterId;

    const chapterBelongsToSubject = await this.chapterRepository.existsBySubjectAndId(realSubjectId, realChapterId);
    if (!chapterBelongsToSubject) {
      throw new Error("Chapter does not belong to the specified subject.");
    }

    if (Object.prototype.hasOwnProperty.call(updateData, 'text')) {
      if (typeof updateData.text !== 'string' || updateData.text.trim() === '') {
        throw new Error('Question text cannot be empty or whitespace.');
      }
    }

    const validationData = {
      subjectId: realSubjectId,
      chapterId: realChapterId,
      type: updateData.type ?? question.type,
      text: updateData.text ?? question.text,
      explanation: updateData.explanation ?? question.explanation,
      difficulty: updateData.difficulty ?? question.difficulty,
      points: updateData.points ?? question.points,
      media: updateData.media ?? question.media,
      tags: updateData.tags ?? question.tags
    };

    new Question(validationData);

    return await this.questionRepository.update(id, updateData);
  }
}

module.exports = UpdateQuestion;