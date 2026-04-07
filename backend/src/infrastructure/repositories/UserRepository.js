// src/infrastructure/repositories/UserRepository.js
const BaseRepository = require("./BaseRepository");
const UserModel = require("../database/models/UserModel");
const userMapper = require("../mappers/UserMapper");

class UserRepository extends BaseRepository {
  constructor() {
    super(UserModel, userMapper);
  }

  async findByEmail(email) {
    const record = await this.model.scope(null).findOne({
      where: { email, isDeleted: false }
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}

module.exports = new UserRepository();
