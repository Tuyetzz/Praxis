// src/interfaces/controllers/QuestionController.js
class QuestionController {
  constructor({
    createQuestion,
    createQuestionWithOptions,
    addBatchQuestions,
    getQuestions,
    getOneQuestion,
    updateQuestion,
    deleteQuestion,
    searchQuestion,
    getQuestionsBySubject,
    getQuestionsByChapter,
    importQuestionsFromFile
  }) {
    this.createQuestion = createQuestion;
    this.createQuestionWithOptions = createQuestionWithOptions;
    this.addBatchQuestions = addBatchQuestions;
    this.getQuestions = getQuestions;
    this.getOneQuestion = getOneQuestion;
    this.updateQuestion = updateQuestion;
    this.deleteQuestion = deleteQuestion;
    this.searchQuestion = searchQuestion;
    this.getQuestionsBySubject = getQuestionsBySubject;
    this.getQuestionsByChapter = getQuestionsByChapter;
    this.importQuestionsFromFile = importQuestionsFromFile;
  }
  async create(req, res) {
    try {
      const result = await this.createQuestion.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async createWithOptions(req, res) {
    try {
      const result = await this.createQuestionWithOptions.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await this.getQuestions.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async search(req, res) {
    try {
      const result = await this.searchQuestion.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const result = await this.getOneQuestion.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getBySubject(req, res) {
    try {
      const result = await this.getQuestionsBySubject.execute(req.params.subjectId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getByChapter(req, res) {
    try {
      const result = await this.getQuestionsByChapter.execute(req.params.chapterId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await this.updateQuestion.execute(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.deleteQuestion.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async addBatch(req, res) {
    try {
      const result = await this.addBatchQuestions.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async importFromFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'File is required' });
      }

      const { subjectId, chapterId, fileType } = req.body;

      const result = await this.importQuestionsFromFile.execute({
        file: req.file.buffer,
        fileName: req.file.originalname,
        subjectId,
        chapterId,
        fileType,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = QuestionController;
