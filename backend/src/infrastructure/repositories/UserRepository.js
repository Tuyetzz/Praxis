// src/infrastructure/repositories/UserRepository.js
const BaseRepository = require("./BaseRepository");
const UserModel = require("../database/models/UserModel");
const RoleModel = require("../database/models/RoleModel");
const PermissionModel = require("../database/models/PermissionModel");
const userMapper = require("../mappers/UserMapper");
const { SUPERADMIN_ROLE_NAME, ALL_PERMISSIONS_FLAG } = require("../../domain/constants/permissions");

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

  async getPermissionSlugs(userId) {
    // JOIN flow: users -> user_roles -> roles -> role_permissions -> permissions
    const roles = await RoleModel.findAll({
      attributes: ["name"],
      include: [
        {
          model: UserModel,
          attributes: [],
          where: { id: userId, isDeleted: false },
          through: { attributes: [] },
          required: true
        },
        {
          model: PermissionModel,
          attributes: ["slug"],
          through: { attributes: [] },
          required: false
        }
      ],
      where: { isDeleted: false }
    });

    if (!roles.length) return [];

    const hasSuperAdminRole = roles.some((role) =>
      String(role.name || "").toLowerCase() === SUPERADMIN_ROLE_NAME
    );

    if (hasSuperAdminRole) {
      return [ALL_PERMISSIONS_FLAG];
    }

    const slugSet = new Set();

    for (const role of roles) {
      const permissions = role.PermissionModels || role.Permissions || [];
      for (const permission of permissions) {
        if (permission.slug) slugSet.add(permission.slug);
      }
    }

    return [...slugSet];
  }
}

module.exports = UserRepository;
