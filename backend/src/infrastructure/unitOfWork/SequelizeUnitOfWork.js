// src/infrastructure/unitOfWork/SequelizeUnitOfWork.js
const { sequelize } = require('../database/models');

class SequelizeUnitOfWork {
  constructor() {
    this.transaction = null;
  }

  async start() {
    if (this.transaction) {
      throw new Error('Transaction already started. Call commit() or rollback() first.');
    }
    this.transaction = await sequelize.transaction();
    return this.transaction;
  }

  async commit() {
    if (!this.transaction) {
      throw new Error('No active transaction to commit.');
    }
    try {
      await this.transaction.commit();
    } finally {
      this.transaction = null;
    }
  }

  async rollback() {
    if (!this.transaction) {
      throw new Error('No active transaction to rollback.');
    }
    try {
      await this.transaction.rollback();
    } finally {
      this.transaction = null;
    }
  }

  getTx() {
    return { transaction: this.transaction };
  }
}

module.exports = SequelizeUnitOfWork;