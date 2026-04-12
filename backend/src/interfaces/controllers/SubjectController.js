// src/interfaces/controllers/SubjectController.js
const createSubject = require('../../usecases/subject/CreateSubject');
const getSubjects = require('../../usecases/subject/GetSubjects');
const getOneSubject = require('../../usecases/subject/GetOneSubject');
const updateSubject = require('../../usecases/subject/UpdateSubject');
const deleteSubject = require('../../usecases/subject/DeleteSubject');

class SubjectController {
  async create(req, res) {
    try {
      const result = await createSubject.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await getSubjects.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const result = await getOneSubject.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await updateSubject.execute(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await deleteSubject.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new SubjectController();
