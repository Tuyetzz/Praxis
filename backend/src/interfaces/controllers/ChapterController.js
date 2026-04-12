// src/interfaces/controllers/ChapterController.js
const createChapter = require('../../usecases/chapter/CreateChapter');
const getChapters = require('../../usecases/chapter/GetChapters');
const getOneChapter = require('../../usecases/chapter/GetOneChapter');
const getChaptersBySubject = require('../../usecases/chapter/GetChaptersBySubject');
const updateChapter = require('../../usecases/chapter/UpdateChapter');
const deleteChapter = require('../../usecases/chapter/DeleteChapter');

class ChapterController {
  async create(req, res) {
    try {
      const result = await createChapter.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await getChapters.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const result = await getOneChapter.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getBySubject(req, res) {
    try {
      const result = await getChaptersBySubject.execute(req.params.subjectId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await updateChapter.execute(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await deleteChapter.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new ChapterController();
