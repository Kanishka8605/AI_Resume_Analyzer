const pythonService = require('../services/pythonService');
const { dbService } = require('../config/db');

/**
 * Controller to handle resume upload, parsing proxy, AI analysis, and saving database records.
 */
const resumeController = {
  
  uploadAndParseResume: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
      }

      const targetRole = req.body.targetRole || '';
      console.log(`📂 Processing upload: ${req.file.originalname} (${req.file.size} bytes) for role: "${targetRole}"`);

      // 1. Send file buffer to Python FastAPI service for text extraction
      const parseResult = await pythonService.parseFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      const extractedText = parseResult.text;
      const fileType = parseResult.file_type || 'pdf';

      console.log(`📄 Parsing complete. Extracted ${parseResult.word_count} words. Running AI analysis...`);

      // 2. Perform AI analysis
      const analysisResult = await pythonService.analyzeText(extractedText, targetRole);

      // 3. Save details to database
      const dbRecord = await dbService.saveAnalysis({
        ...analysisResult,
        fileName: req.file.originalname,
        fileType: fileType,
        targetRole: targetRole
      });

      console.log(`✅ Analysis completed successfully. Record ID: ${dbRecord.id}`);

      res.status(200).json({
        success: true,
        data: dbRecord
      });

    } catch (error) {
      console.error('❌ Upload and analysis failed:', error.message);
      next(error);
    }
  },

  analyzeRawText: async (req, res, next) => {
    try {
      const { text, targetRole } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ success: false, error: 'No text provided for analysis.' });
      }

      console.log(`📝 Analyzing raw text input for role: "${targetRole || 'General'}"`);

      // 1. Perform AI analysis
      const analysisResult = await pythonService.analyzeText(text, targetRole || '');

      // 2. Save details to database
      const dbRecord = await dbService.saveAnalysis({
        ...analysisResult,
        fileName: 'Raw Text Input',
        fileType: 'txt',
        targetRole: targetRole || ''
      });

      console.log(`✅ Raw text analysis completed. Record ID: ${dbRecord.id}`);

      res.status(200).json({
        success: true,
        data: dbRecord
      });

    } catch (error) {
      console.error('❌ Raw text analysis failed:', error.message);
      next(error);
    }
  },

  getAnalysisById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const record = await dbService.getAnalysisById(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          error: `Analysis record not found for ID: ${id}`
        });
      }

      res.status(200).json({
        success: true,
        data: record
      });
    } catch (error) {
      next(error);
    }
  },

  getHistory: async (req, res, next) => {
    try {
      const history = await dbService.getHistory();
      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  },

  chatWithBot: async (req, res, next) => {
    try {
      const { resumeText, targetRole, messages, userMessage } = req.body;
      if (!resumeText || !resumeText.trim()) {
        return res.status(400).json({ success: false, error: 'Resume text is required.' });
      }
      if (!userMessage || !userMessage.trim()) {
        return res.status(400).json({ success: false, error: 'User message is required.' });
      }

      console.log(`💬 Processing AI Bot chat query: "${userMessage}" for target role: "${targetRole || 'General'}"`);

      const chatResponse = await pythonService.chatWithResume(resumeText, targetRole, messages, userMessage);

      res.status(200).json({
        success: true,
        data: chatResponse
      });

    } catch (error) {
      console.error('❌ Chat handler failed:', error.message);
      next(error);
    }
  }
};

module.exports = resumeController;

