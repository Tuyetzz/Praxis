const TypingText = require('../../domain/entities/TypingText');
const { toBoolean } = require('../../infrastructure/utils/typeConverters');
class UpdateTypingText {
  constructor({ typingTextRepository }) {
    this.typingTextRepository = typingTextRepository;
  }

  async execute(payload = {}) {
    const { textId, authorId, updateData = {} } = payload;

    if (!textId) {
      throw new Error('Typing text ID is required.');
    }
    if (!authorId) {
      throw new Error('Author is required.');
    }

    const text = await this.typingTextRepository.findById(textId);
    if (!text) {
      throw new Error('Typing text not found.');
    }

    if (text.authorId !== authorId) {
      throw new Error('Forbidden: You cannot update this typing text.');
    }

    const nextPayload = {
      authorId: text.authorId,
      title: Object.prototype.hasOwnProperty.call(updateData, 'title') ? updateData.title : text.title,
      content: Object.prototype.hasOwnProperty.call(updateData, 'content') ? updateData.content : text.content,
      language: Object.prototype.hasOwnProperty.call(updateData, 'language') ? updateData.language : text.language,
      isPublic: Object.prototype.hasOwnProperty.call(updateData, 'isPublic') ? toBoolean(updateData.isPublic) : text.isPublic,
      isDefault: Object.prototype.hasOwnProperty.call(updateData, 'isDefault') ? toBoolean(updateData.isDefault) : text.isDefault,
      difficulty: Object.prototype.hasOwnProperty.call(updateData, 'difficulty') ? updateData.difficulty : text.difficulty,
      sourceType: Object.prototype.hasOwnProperty.call(updateData, 'sourceType') ? updateData.sourceType : text.sourceType
    };

    new TypingText(nextPayload);

    return this.typingTextRepository.update(
      textId,
      {
        ...(Object.prototype.hasOwnProperty.call(updateData, 'title') ? { title: nextPayload.title } : {}),
        ...(Object.prototype.hasOwnProperty.call(updateData, 'content') ? { content: nextPayload.content } : {}),
        ...(Object.prototype.hasOwnProperty.call(updateData, 'language') ? { language: nextPayload.language } : {}),
        ...(Object.prototype.hasOwnProperty.call(updateData, 'isPublic') ? { isPublic: nextPayload.isPublic } : {}),
        ...(Object.prototype.hasOwnProperty.call(updateData, 'isDefault') ? { isDefault: nextPayload.isDefault } : {}),
        ...(Object.prototype.hasOwnProperty.call(updateData, 'difficulty') ? { difficulty: nextPayload.difficulty } : {}),
        ...(Object.prototype.hasOwnProperty.call(updateData, 'sourceType') ? { sourceType: nextPayload.sourceType } : {})
      },
      authorId
    );
  }
}

module.exports = UpdateTypingText;
