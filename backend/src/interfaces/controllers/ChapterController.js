// src/interfaces/controllers/ChapterController.js
class ChapterController {
  constructor({
    createChapter,
    getChapters,
    getOneChapter,
    getChaptersBySubject,
    updateChapter,
    deleteChapter,
    searchChapter
  }) {
    this.createChapter = createChapter;
    this.getChapters = getChapters;
    this.getOneChapter = getOneChapter;
    this.getChaptersBySubject = getChaptersBySubject;
    this.updateChapter = updateChapter;
    this.deleteChapter = deleteChapter;
    this.searchChapter = searchChapter;
  }

  async create(req, res) {
    try {
      const result = await this.createChapter.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await this.getChapters.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async search(req, res) {
    try {
      const result = await this.searchChapter.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const result = await this.getOneChapter.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getBySubject(req, res) {
    try {
      const result = await this.getChaptersBySubject.execute(req.params.subjectId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await this.updateChapter.execute(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.deleteChapter.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = ChapterController;
