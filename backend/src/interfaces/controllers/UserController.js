
class UserController {
  constructor({ createUser, getUsers, updateUser, deleteUser, getOneUser }) {
    this.createUser = createUser;
    this.getUsers = getUsers;
    this.updateUser = updateUser;
    this.deleteUser = deleteUser;
    this.getOneUser = getOneUser;
  }

  async create(req, res) {
    try {
      const result = await this.createUser.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const result = await this.getUsers.execute(req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getMe(req, res) {
    try {
      const userId = req.user.id;
      const result = await this.getOneUser.execute(userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const result = await this.updateUser.execute(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.deleteUser.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = UserController;