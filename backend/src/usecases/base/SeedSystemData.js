// src/usecases/base/SeedSystemData.js
const { sequelize, PermissionModel, RoleModel, RolePermissionModel, UserModel, UserRoleModel } = require("../../infrastructure/database/models");
const {
  PERMISSIONS,
  SUPERADMIN_ROLE_NAME
} = require("../../domain/constants/permissions");
const { hashPassword } = require("../../infrastructure/utils/auth_helper");

class SeedSystemData {
  async execute() {
    const transaction = await sequelize.transaction();

    try {
      const permissionSlugs = Object.values(PERMISSIONS);

      // Step 1: Upsert all permissions from enum into permissions table.
      for (const slug of permissionSlugs) {
        const [resource, action] = slug.split(":");
        const resourceName = this.toTitleCase(resource);
        const actionName = this.toTitleCase(action);

        await PermissionModel.upsert(
          {
            slug,
            name: `${resourceName} ${actionName}`,
            description: `Allow ${action} on ${resource}`
          },
          { transaction }
        );
      }

      const allPermissions = await PermissionModel.findAll({
        attributes: ["id", "slug"],
        transaction
      });

      // Step 2: Ensure superadmin role exists (or restore if soft-deleted).
      let superadminRole = await RoleModel.findOne({
        where: { name: SUPERADMIN_ROLE_NAME },
        transaction
      });

      if (!superadminRole) {
        superadminRole = await RoleModel.create(
          {
            name: SUPERADMIN_ROLE_NAME,
            description: "System super administrator",
            isDeleted: false
          },
          { transaction }
        );
      } else if (superadminRole.isDeleted) {
        await superadminRole.update({ isDeleted: false }, { transaction });
      }

      // Step 3: Bind all permissions to superadmin in role_permissions table.
      const rolePermissions = allPermissions.map((permission) => ({
        roleId: superadminRole.id,
        permissionId: permission.id
      }));

      if (rolePermissions.length > 0) {
        await RolePermissionModel.bulkCreate(rolePermissions, {
          ignoreDuplicates: true,
          transaction
        });
      }

      // Step 4: Seed superadmin user if not exists
      const superAdminEmail = process.env.SUPERADMIN_EMAIL;
      const superAdminPassword = process.env.SUPERADMIN_PASSWORD;

      let superAdminUser = await UserModel.findOne({
        where: { email: superAdminEmail },
        transaction
      });
      if (!superAdminUser) {
        const passwordHash = await hashPassword(superAdminPassword);
        superAdminUser = await UserModel.create({
          name: "Super Admin",
          email: superAdminEmail,
          passwordHash,
          status: "active",
          isDeleted: false
        }, { transaction });
      } else if (superAdminUser.isDeleted) {
        await superAdminUser.update({ isDeleted: false }, { transaction });
      }

      // Step 5: Ensure user_roles has mapping
      const userRole = await UserRoleModel.findOne({
        where: { userId: superAdminUser.id, roleId: superadminRole.id },
        transaction
      });
      if (!userRole) {
        await UserRoleModel.create({
          userId: superAdminUser.id,
          roleId: superadminRole.id
        }, { transaction });
      }

      await transaction.commit();

      return {
        permissionsUpserted: permissionSlugs.length,
        superadminRoleId: superadminRole.id,
        rolePermissionsAssigned: rolePermissions.length,
        superadminUserId: superAdminUser.id,
        superadminUserEmail: superAdminUser.email
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  toTitleCase(value) {
    return String(value || "")
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
}

module.exports = new SeedSystemData();

if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      const result = await module.exports.execute();
      console.log("System data seeded successfully", result);
      process.exit(0);
    } catch (error) {
      console.error("Failed to seed system data", error);
      process.exit(1);
    }
  })();
}
