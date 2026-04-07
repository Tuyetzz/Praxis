// src/domain/entities/AuditLog.js
class AuditLog {
  constructor({
    id, actorUserId, action, entityType, entityId, payload, ip, createdAt
  }) {
    this.id = id;
    this.actorUserId = actorUserId; 
    this.action = action; 
    this.entityType = entityType; 
    this.entityId = entityId; 
    this.payload = payload || {}; 
    this.ip = ip;
    this.createdAt = createdAt || new Date();
  }

  getLogSummary() {
    return `User ${this.actorUserId} performed ${this.action} on ${this.entityType}:${this.entityId}`;
  }
}

module.exports = AuditLog;