const Document = require('../models/Document');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const mammoth = require('mammoth');
function hasAccess(doc, userId) {
  return doc.owner.toString() === userId || doc.sharedWith.some((id) => id.toString() === userId);
}

const createDocument = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const doc = await Document.create({ title: title || 'Untitled Document', content: content || '', owner: req.user.id });
  res.status(201).json(doc);
});

const listDocuments = asyncHandler(async (req, res) => {
  const docs = await Document.find({
    $or: [
      { owner: req.user.id },
      { sharedWith: req.user.id }
    ]
  })
    .select('title owner sharedWith updatedAt')
    .populate('owner', 'name email')
    .sort({ updatedAt: -1 });

  const formattedDocs = docs.map((doc) => ({
    ...doc.toObject(),
    isShared: doc.owner._id.toString() !== req.user.id,
  }));

  res.json(formattedDocs);
});

const getDocument = asyncHandler(async (req, res, next) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return next(new AppError('Document not found', 404));
  if (!hasAccess(doc, req.user.id)) return next(new AppError('You do not have access to this document', 403));
  res.json(doc);
});

const updateDocument = asyncHandler(async (req, res, next) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return next(new AppError('Document not found', 404));
  if (!hasAccess(doc, req.user.id)) return next(new AppError('You do not have access to this document', 403));

  if (req.body.title !== undefined) doc.title = req.body.title;
  if (req.body.content !== undefined) doc.content = req.body.content;
  await doc.save();
  res.json(doc);
});

const deleteDocument = asyncHandler(async (req, res, next) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return next(new AppError('Document not found', 404));
  if (doc.owner.toString() !== req.user.id) return next(new AppError('Only the owner can delete this document', 403));
  await doc.deleteOne();
  res.status(204).send();
});

const shareDocument = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Email is required', 400));

  const doc = await Document.findById(req.params.id);
  if (!doc) return next(new AppError('Document not found', 404));
  if (doc.owner.toString() !== req.user.id) return next(new AppError('Only the owner can share this document', 403));

  const targetUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (!targetUser) return next(new AppError('No user found with that email', 404));
  if (targetUser._id.toString() === req.user.id) return next(new AppError('You already own this document', 400));

  const alreadyShared = doc.sharedWith.some((id) => id.toString() === targetUser._id.toString());
  if (!alreadyShared) {
    doc.sharedWith.push(targetUser._id);
    await doc.save();
  }
  res.json(doc);
});

const uploadDocument = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  let html = '';

  if (req.file.originalname.toLowerCase().endsWith('.docx')) {
    const result = await mammoth.convertToHtml({
      buffer: req.file.buffer,
    });

    html = result.value;
  } else {
    const text = req.file.buffer.toString('utf-8');

    const escapeHtml = (str) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    html = text
      .split('\n')
      .map((line) => (line.trim() ? `<p>${escapeHtml(line)}</p>` : ''))
      .join('');
  }

  const title =
    req.file.originalname.replace(/\.(txt|md|docx)$/i, '') ||
    'Imported Document';

  const doc = await Document.create({
    title,
    content: html,
    owner: req.user.id,
  });

  res.status(201).json(doc);
});

module.exports = { createDocument, listDocuments, getDocument, updateDocument, deleteDocument, shareDocument, uploadDocument };