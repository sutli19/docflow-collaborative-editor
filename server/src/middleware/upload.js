const multer = require('multer');
const AppError = require('../utils/AppError');
const mammoth = require('mammoth');
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const name = file.originalname.toLowerCase();
  if (file.mimetype === 'text/plain' || file.mimetype === 'text/markdown' || name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.docx')) {
    cb(null, true);
  } else {
    cb(new AppError('Only .txt, .md, and .docx files are supported', 400));
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 1 * 1024 * 1024 } });

module.exports = upload;