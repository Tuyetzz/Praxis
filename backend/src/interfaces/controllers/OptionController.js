// src/interfaces/controllers/OptionController.js
const createOption = require('../../usecases/option/CreateOption');
const getOptions = require('../../usecases/option/GetOptions');
const getOneOption = require('../../usecases/option/GetOneOption');
const updateOption = require('../../usecases/option/UpdateOption');
const deleteOption = require('../../usecases/option/DeleteOption');
const getOptionsByQuestion = require('../../usecases/option/GetOptionsByQuestion');

class OptionController {
  async create(req, res) {
    try {
      const result = await createOption.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await getOptions.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const result = await getOneOption.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getByQuestion(req, res) {
    try {
      const result = await getOptionsByQuestion.execute(req.params.questionId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await updateOption.execute(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await deleteOption.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new OptionController();
