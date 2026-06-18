const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createDocument, listDocuments, getDocument, updateDocument, deleteDocument, shareDocument, uploadDocument,
} = require('../controllers/document.controller');

const router = express.Router();
router.use(auth);

router.post('/upload', upload.single('file'), uploadDocument);
router.post('/', createDocument);
router.get('/', listDocuments);
router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);
router.post('/:id/share', shareDocument);

module.exports = router;