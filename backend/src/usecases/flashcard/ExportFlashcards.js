// src/usecases/flashcard/ExportFlashcards.js

/**
 * Serialise a deck's cards for download.
 *
 * `format=txt` produces the same `front - back` layout the import expects, so
 * an exported deck can be edited and re-imported without conversion. `csv` is
 * for spreadsheets.
 */
class ExportFlashcards {
  constructor({ flashcardRepository, flashcardDeckRepository }) {
    this.flashcardRepository = flashcardRepository;
    this.flashcardDeckRepository = flashcardDeckRepository;
  }

  async execute({ deckId, requestUserId, format = "txt" }) {
    if (!deckId) throw new Error("Deck ID is required.");

    const deck = await this.flashcardDeckRepository.findById(deckId);
    if (!deck) throw new Error("Flashcard deck not found.");

    if (!deck.canBeViewedBy(requestUserId)) {
      throw new Error("Forbidden: You cannot export cards from this deck.");
    }

    const cards = await this.flashcardRepository.findByDeck(deckId);
    const baseName = this._toSafeFileName(deck.title);

    if (format === "csv") {
      return {
        content: this._toCsv(cards),
        contentType: "text/csv; charset=utf-8",
        fileName: `${baseName}.csv`,
      };
    }

    return {
      content: this._toPlainText(cards, deck.title),
      contentType: "text/plain; charset=utf-8",
      fileName: `${baseName}.txt`,
    };
  }

  _toPlainText(cards, deckTitle) {
    const lines = [
      `# ${deckTitle}`,
      "# One card per line: front - back",
      "# Lines starting with # are ignored when importing.",
      "",
    ];

    cards.forEach((card) => {
      // Collapse newlines so a multi-line side cannot break the one-line format.
      const front = this._singleLine(card.frontText);
      const back = this._singleLine(card.backText);
      lines.push(`${front} - ${back}`);
    });

    return lines.join("\n");
  }

  _toCsv(cards) {
    const escape = (value) => {
      const text = this._singleLine(value);
      // Quote when the value contains a comma or quote; escape inner quotes.
      return /[",]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const rows = ["front,back"];
    cards.forEach((card) => {
      rows.push(`${escape(card.frontText)},${escape(card.backText)}`);
    });

    return rows.join("\n");
  }

  _singleLine(value) {
    return String(value ?? "")
      .replace(/\r?\n/g, " ")
      .trim();
  }

  /** Deck titles are user input, so strip anything unsafe for a filename. */
  _toSafeFileName(title) {
    const safe = String(title || "flashcards")
      .replace(/[^a-zA-Z0-9À-ɏḀ-ỿ _-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return safe || "flashcards";
  }
}

module.exports = ExportFlashcards;
