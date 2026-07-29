const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const resumeController = require('../controllers/resumeController');

// 1. Upload resume (multipart upload)
router.post('/upload', upload.single('file'), resumeController.uploadAndParseResume);

// 2. Analyze raw resume text (JSON submission)
router.post('/analyze', resumeController.analyzeRawText);

// 3. Get all session/user history
router.get('/history', resumeController.getHistory);

// 4. Get specific analysis record details
router.get('/analysis/:id', resumeController.getAnalysisById);

module.exports = router;
