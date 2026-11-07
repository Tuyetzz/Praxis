// src/infrastructure/services/parser/FileParser.js
class FileParser {
	/**
	 * Parse file buffer or path
	 * @param {Buffer|string} file - file buffer hoặc file path
	 * @returns {Promise<any>} dữ liệu đã parse
	 */
	async parse(file) {
		throw new Error("Method 'parse()' must be implemented.");
	}
}

module.exports = FileParser;
