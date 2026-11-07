// src/interfaces/controllers/SubjectController.js
class SubjectController {
  constructor({
    createSubject,
    getSubjects,
    getOneSubject,
    updateSubject,
    deleteSubject,
    searchSubject,
    restoreSubject
  }) {
    this.createSubject = createSubject;
    this.getSubjects = getSubjects;
    this.getOneSubject = getOneSubject;
    this.updateSubject = updateSubject;
    this.deleteSubject = deleteSubject;
    this.searchSubject = searchSubject;
    this.restoreSubject = restoreSubject;
  }
  async create(req, res) {
    try {
      const result = await this.createSubject.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await this.getSubjects.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async search(req, res) {
    try {
      const result = await this.searchSubject.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const result = await this.getOneSubject.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await this.updateSubject.execute(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.deleteSubject.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async restore(req, res) {
    try {
      const result = await this.restoreSubject.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = SubjectController;
