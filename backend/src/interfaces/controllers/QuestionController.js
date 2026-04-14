// src/interfaces/controllers/QuestionController.js
const createQuestion = require('../../usecases/question/CreateQuestion');
const addBatchQuestions = require('../../usecases/question/AddBatchQuestions');
const getQuestions = require('../../usecases/question/GetQuestions');
const getOneQuestion = require('../../usecases/question/GetOneQuestion');
const updateQuestion = require('../../usecases/question/UpdateQuestion');
const deleteQuestion = require('../../usecases/question/DeleteQuestion');
const searchQuestion = require('../../usecases/question/SearchQuestion');
const getQuestionsBySubject = require('../../usecases/question/GetQuestionsBySubject');
const getQuestionsByChapter = require('../../usecases/question/GetQuestionsByChapter');

class QuestionController {
  async create(req, res) {
    try {
      const result = await createQuestion.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await getQuestions.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async search(req, res) {
    try {
      const result = await searchQuestion.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const result = await getOneQuestion.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getBySubject(req, res) {
    try {
      const result = await getQuestionsBySubject.execute(req.params.subjectId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getByChapter(req, res) {
    try {
      const result = await getQuestionsByChapter.execute(req.params.chapterId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await updateQuestion.execute(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await deleteQuestion.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  async addBatch(req, res) {
    try {
      const result = await addBatchQuestions.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new QuestionController();
