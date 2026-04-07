// src/interfaces/controllers/UserController.js
const createUser = require('../../usecases/user/CreateUser');
const getUsers = require('../../usecases/user/GetUsers');
const updateUser = require('../../usecases/user/UpdateUser');
const deleteUser = require('../../usecases/user/DeleteUser');
const getOneUser = require('../../usecases/user/GetOneUser');

class UserController {
  async create(req, res) {
    try {
      const result = await createUser.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await getUsers.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getMe(req, res) {
    try {
      const userId = req.user.id;
      const result = await getOneUser.execute(userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }


  async update(req, res) {
    try {
      const result = await updateUser.execute(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await deleteUser.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new UserController();