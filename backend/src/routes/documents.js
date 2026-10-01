import express from 'express';
import multer from 'multer';
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  purgeAllDocuments,
  seedSampleDocuments,
  getExtractedQa,
  getExtractedQuestions,
} from '../controllers/documentController.js';

const router = express.Router();

// Memory storage for fast PDF & document processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max file size
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'text/plain' ||
      file.originalname.match(/\.(pdf|txt|md)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, or MD documents are supported.'), false);
    }
  },
});

// POST /api/documents/upload
router.post('/upload', upload.single('file'), uploadDocument);

// GET /api/documents
router.get('/', getDocuments);

// GET /api/documents/qa
router.get('/qa', getExtractedQa);

// GET /api/documents/questions
router.get('/questions', getExtractedQuestions);

// DELETE /api/documents/purge/all
router.delete('/purge/all', purgeAllDocuments);

// DELETE /api/documents/:id
router.delete('/:id', deleteDocument);

// POST /api/documents/seed-sample
router.post('/seed-sample', seedSampleDocuments);

export default router;
