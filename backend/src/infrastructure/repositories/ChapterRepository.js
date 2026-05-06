// src/infrastructure/repositories/ChapterRepository.js
const BaseRepository = require("./BaseRepository");
const ChapterModel = require("../database/models/ChapterModel");
const QuestionModel = require("../database/models/QuestionModel");
const chapterMapper = require("../mappers/ChapterMapper");

class ChapterRepository extends BaseRepository {
  constructor() {
    super(ChapterModel, chapterMapper);
  }

  async findBySubject(subjectId) {
    const records = await this.model.findAll({
      where: { subjectId, isDeleted: false },
      order: [["order", "ASC"]]
    });
    return records.map(record => this.mapper.toDomain(record));
  }

  async findBySubjectAndOrder(subjectId, order) {
    const record = await this.model.findOne({
      where: { subjectId, order, isDeleted: false }
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async existsBySubjectAndId(subjectId, id) {
    const count = await this.model.count({
      where: { subjectId, id, isDeleted: false }
    });
    return count > 0;
  }

  async countQuestionsByChapterId(chapterId) {
    try {
      const count = await QuestionModel.count({
        where: { 
          chapterId: chapterId,
          isDeleted: false 
        }
      });
      return count;
    } catch (error) {
      throw new Error(`Error counting questions for chapter ${chapterId}: ${error.message}`);
    }
  }
}

module.exports = ChapterRepository;
