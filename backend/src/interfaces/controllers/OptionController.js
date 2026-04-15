// src/interfaces/controllers/OptionController.js
class OptionController {
  constructor({
    createOption,
    getOptions,
    getOneOption,
    updateOption,
    deleteOption,
    getOptionsByQuestion
  }) {
    this.createOption = createOption;
    this.getOptions = getOptions;
    this.getOneOption = getOneOption;
    this.updateOption = updateOption;
    this.deleteOption = deleteOption;
    this.getOptionsByQuestion = getOptionsByQuestion;
  }

  async create(req, res) {
    try {
      const result = await this.createOption.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await this.getOptions.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const result = await this.getOneOption.execute(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getByQuestion(req, res) {
    try {
      const result = await this.getOptionsByQuestion.execute(req.params.questionId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await this.updateOption.execute(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.deleteOption.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = OptionController;
