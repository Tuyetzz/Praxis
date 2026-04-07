// src/infrastructure/mappers/BaseMapper.js
class BaseMapper {
  constructor(EntityClass) {
    if (this.constructor === BaseMapper) {
      throw new Error("BaseMapper is an abstract class.");
    }
    this.EntityClass = EntityClass;
  }

  toDomain(model) {
    if (!model) return null;
    const data = model instanceof Object && model.get ? model.get({ plain: true }) : model;
    
    return new this.EntityClass(data);
  }

  toPersistence(entity) {
    if (!entity) return null;
    
    const persistentData = { ...entity };
    
    return persistentData;
  }
}

module.exports = BaseMapper;