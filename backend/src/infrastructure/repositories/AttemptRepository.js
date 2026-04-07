// src/infrastructure/repositories/AttemptRepository.js
const BaseRepository = require('./BaseRepository');
const AttemptModel = require('../database/models/AttemptModel');
const attemptMapper = require('../mappers/AttemptMapper');

class AttemptRepository extends BaseRepository {
    constructor() {
        super(AttemptModel, attemptMapper);
    }

    async findActiveAttempts(userId) {
        const records = await this.model.findAll({
            where: {
                userId,
                status: 'in_progress',
                isDeleted: false
            }
        });
        return records.map(record => this.mapper.toDomain(record));
    }
}

module.exports = new AttemptRepository();