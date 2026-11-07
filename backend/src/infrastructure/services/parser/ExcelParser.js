// src/infrastructure/services/parser/ExcelParser.js
const FileParser = require('./FileParser');
const xlsx = require('xlsx');

class ExcelParser extends FileParser {
	/**
	 * Parse Excel file buffer or path
	 * @param {Buffer|string} file
	 * @returns {Promise<any[]>}
	 */
	async parse(file) {
		let workbook;
		if (Buffer.isBuffer(file)) {
			workbook = xlsx.read(file, { type: 'buffer' });
		} else if (typeof file === 'string') {
			workbook = xlsx.readFile(file);
		} else {
			throw new Error('Invalid file input');
		}
		const sheetName = workbook.SheetNames[0];
		const sheet = workbook.Sheets[sheetName];
		const data = xlsx.utils.sheet_to_json(sheet, { defval: null });
		return data;
	}
}

module.exports = new ExcelParser();
