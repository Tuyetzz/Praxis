// src/interfaces/middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.memoryStorage(); // Store file in memory buffer

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'text/csv',
    'text/plain', // .txt - used by the flashcard importer
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only TXT, CSV, Excel, and JSON files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
