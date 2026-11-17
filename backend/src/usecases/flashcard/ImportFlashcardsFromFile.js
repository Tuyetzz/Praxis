// src/usecases/flashcard/ImportFlashcardsFromFile.js
const ImportFlashcardMapper = require("../../infrastructure/mappers/ImportFlashcardMapper");
const CsvParser = require("../../infrastructure/services/parser/CsvParser");
const ExcelParser = require("../../infrastructure/services/parser/ExcelParser");
const Flashcard = require("../../domain/entities/Flashcard");

const MAX_CARDS = 500;

class ImportFlashcardsFromFile {
  constructor({ flashcardRepository, flashcardDeckRepository }) {
    this.flashcardRepository = flashcardRepository;
    this.flashcardDeckRepository = flashcardDeckRepository;
  }

  /**
   * @param {Object} params
   * @param {Buffer} params.file - uploaded file contents
   * @param {string} params.fileName - used to detect the format
   * @param {string} params.deckId
   * @param {string} params.userId - the requesting user, for the ownership check
   */
  async execute({ file, fileName, deckId, userId }) {
    if (!file) throw new Error("File is required.");
    if (!deckId) throw new Error("Deck ID is required.");
    if (!userId) throw new Error("User is required.");

    const deck = await this.flashcardDeckRepository.findById(deckId);
    if (!deck) throw new Error("Flashcard deck not found.");

    // Importing writes to the deck, so it needs the same ownership rule as
    // CreateFlashcard - viewing a public deck is not enough.
    if (deck.userId !== userId) {
      throw new Error("Forbidden: You cannot add cards to this deck.");
    }

    const extension = (fileName || "").split(".").pop().toLowerCase();
    const { rows, fileType } = await this._parse(file, extension);

    const mapped = ImportFlashcardMapper.mapData(rows, fileType);

    if (mapped.length === 0) {
      throw new Error(
        fileType === "txt"
          ? 'No cards found. Each line must look like "front - back".'
          : "No cards found. Check the file has front and back columns."
      );
    }

    if (mapped.length > MAX_CARDS) {
      throw new Error(`Too many cards (${mapped.length}). The limit is ${MAX_CARDS} per import.`);
    }

    // Continue past the highest existing order so imported cards land at the
    // end of the deck instead of interleaving with what is already there.
    const existing = await this.flashcardRepository.findByDeck(deckId);
    const startOrder = existing.reduce((max, card) => Math.max(max, card.order ?? 0), 0);

    const created = [];
    const errors = [];

    for (let i = 0; i < mapped.length; i += 1) {
      const { frontText, backText, line } = mapped[i];

      try {
        // Constructing the entity runs validation, so an empty side is caught
        // here rather than reaching the database.
        const flashcard = new Flashcard({
          deckId,
          frontText,
          backText,
          order: startOrder + i + 1,
        });

        const saved = await this.flashcardRepository.create(flashcard, userId);
        created.push(saved);
      } catch (error) {
        errors.push({ line, error: error.message });
      }
    }

    return {
      totalCards: mapped.length,
      imported: created.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async _parse(file, extension) {
    switch (extension) {
      case "txt":
        return { rows: file.toString("utf8"), fileType: "txt" };
      case "json": {
        const text = file.toString("utf8");
        return { rows: JSON.parse(text), fileType: "json" };
      }
      case "csv":
        return { rows: await CsvParser.parse(file), fileType: "csv" };
      case "xlsx":
      case "xls":
        return { rows: await ExcelParser.parse(file), fileType: "csv" };
      default:
        throw new Error(`Unsupported file format: .${extension}. Use .txt, .csv, .xlsx or .json.`);
    }
  }
}

module.exports = ImportFlashcardsFromFile;
