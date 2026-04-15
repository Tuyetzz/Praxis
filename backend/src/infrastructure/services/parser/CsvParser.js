// src/infrastructure/services/parser/CsvParser.js
const FileParser = require('./FileParser');
const csv = require('csv-parse/sync');

class CsvParser extends FileParser {
	/**
	 * Parse CSV file buffer or string
	 * @param {Buffer|string} file
	 * @returns {Promise<any[]>}
	 */
	async parse(file) {
		let content = file;
		if (Buffer.isBuffer(file)) {
			content = file.toString('utf8');
		}
		// parse CSV
		const records = csv.parse(content, {
			columns: true,
			skip_empty_lines: true
		});
		return records;
	}
}

module.exports = new CsvParser();
