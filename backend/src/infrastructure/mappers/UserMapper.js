// src/infrastructure/mappers/UserMapper.js
const BaseMapper = require("./BaseMapper");
const UserEntity = require("../../domain/entities/User");

class UserMapper extends BaseMapper {
  constructor() {
    super(UserEntity);
  }

  toDomain(model) {
    const entity = super.toDomain(model);
    return entity;
  }
}

module.exports = new UserMapper();
