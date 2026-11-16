// src/infrastructure/mappers/ImportFlashcardMapper.js
//
// Turns parsed file rows into { frontText, backText } pairs.
//
// Three input shapes are supported:
//
//   1. Plain text, one card per line, front and back separated by a dash:
//        Bustling - nhộn nhịp (bustling city)
//        overwhelming - áp đảo
//      This is the format in backend/import_example.txt, and the one the
//      downloadable template uses, because it is the easiest to type by hand.
//
//   2. CSV/Excel with headers (case-insensitive):
//        front,back
//        Bustling,nhộn nhịp
//      Recognises: front/back, frontText/backText, term/definition, word/meaning
//
//   3. JSON: [{ "front": "...", "back": "..." }, ...]
//      Also accepts frontText/backText keys.
class ImportFlashcardMapper {
  /** Header names accepted for each column, lowercased. */
  static FRONT_KEYS = ["front", "fronttext", "term", "word", "question"];
  static BACK_KEYS = ["back", "backtext", "definition", "meaning", "answer"];

  /**
   * @param {Array|string} data - rows from a parser, or raw text
   * @param {string} fileType - 'txt' | 'csv' | 'json'
   * @returns {Array<{frontText: string, backText: string, line: number}>}
   */
  mapData(data, fileType) {
    if (fileType === "txt") {
      return this._mapPlainText(data);
    }
    if (fileType === "json") {
      return this._mapJson(data);
    }
    return this._mapTabular(data);
  }

  /**
   * Parse `front - back` lines.
   *
   * The separator is a dash surrounded by spaces, so a dash inside a word
   * ("well-known") does not split the line. Lines starting with # are comments,
   * and blank lines are skipped, so the template can carry instructions.
   */
  _mapPlainText(text) {
    const results = [];

    String(text)
      .split(/\r?\n/)
      .forEach((rawLine, index) => {
        const line = rawLine.trim();

        if (!line || line.startsWith("#")) return;

        // Split on the FIRST " - " only, so a back side may contain dashes.
        const separatorIndex = line.indexOf(" - ");
        if (separatorIndex === -1) return;

        const front = line.slice(0, separatorIndex).trim();
        const back = line.slice(separatorIndex + 3).trim();

        if (!front || !back) return;

        results.push({ frontText: front, backText: back, line: index + 1 });
      });

    return results;
  }

  _mapJson(data) {
    const rows = Array.isArray(data) ? data : [];
    return rows
      .map((row, index) => {
        const front = this._pick(row, ImportFlashcardMapper.FRONT_KEYS);
        const back = this._pick(row, ImportFlashcardMapper.BACK_KEYS);
        if (!front || !back) return null;
        return { frontText: front, backText: back, line: index + 1 };
      })
      .filter(Boolean);
  }

  _mapTabular(rows) {
    if (!Array.isArray(rows)) return [];

    return rows
      .map((row, index) => {
        // Headers may arrive in any case; normalise the keys once per row.
        const normalised = {};
        Object.keys(row || {}).forEach((key) => {
          normalised[String(key).trim().toLowerCase()] = row[key];
        });

        const front = this._pick(normalised, ImportFlashcardMapper.FRONT_KEYS);
        const back = this._pick(normalised, ImportFlashcardMapper.BACK_KEYS);
        if (!front || !back) return null;

        return { frontText: front, backText: back, line: index + 2 }; // +2: header + 1-based
      })
      .filter(Boolean);
  }

  /** Return the first non-empty value among `keys`. */
  _pick(source, keys) {
    if (!source) return "";
    for (const key of keys) {
      const value = source[key];
      if (value !== undefined && value !== null) {
        const text = String(value).trim();
        if (text) return text;
      }
    }
    return "";
  }
}

module.exports = new ImportFlashcardMapper();
