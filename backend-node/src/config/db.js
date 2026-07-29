const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('crypto'); // We can use crypto.randomUUID in Node v16+

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const JSON_DB_PATH = path.join(DATA_DIR, 'history.json');

// Mongoose Schema Definition
const AnalysisSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  overallScore: Number,
  atsScore: Number,
  sections: [
    {
      name: String,
      present: Boolean,
      score: Number,
      feedback: String
    }
  ],
  strengths: [String],
  weaknesses: [String],
  missingKeywords: [String],
  recommendations: [
    {
      category: String,
      severity: String,
      message: String
    }
  ],
  fileName: String,
  fileType: String,
  targetRole: String,
  createdAt: { type: Date, default: Date.now }
});

let AnalysisModel;
let isFallbackMode = false;

// Initialize JSON database if needed
const initJsonDb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(JSON_DB_PATH)) {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify([]));
  }
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('your_mongodb')) {
    console.warn('⚠️ No MONGODB_URI found. Switching to JSON file-based database fallback.');
    isFallbackMode = true;
    initJsonDb();
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000 // 3 seconds timeout
    });
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
    AnalysisModel = mongoose.model('Analysis', AnalysisSchema);
    return conn;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection failed: ${error.message}. Switching to JSON file fallback.`);
    isFallbackMode = true;
    initJsonDb();
    return null;
  }
};

// Database storage helper methods (hides MongoDB vs JSON details)
const dbService = {
  saveAnalysis: async (analysisData) => {
    const recordId = require('crypto').randomUUID();
    const newRecord = {
      id: recordId,
      ...analysisData,
      createdAt: new Date().toISOString()
    };

    if (!isFallbackMode && AnalysisModel) {
      try {
        const doc = new AnalysisModel(newRecord);
        await doc.save();
        return newRecord;
      } catch (err) {
        console.error('MongoDB save failed, attempting JSON fallback', err);
      }
    }

    // Fallback JSON operations
    try {
      initJsonDb();
      const rawData = fs.readFileSync(JSON_DB_PATH, 'utf-8');
      const history = JSON.parse(rawData);
      history.push(newRecord);
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(history, null, 2));
      return newRecord;
    } catch (err) {
      console.error('JSON save failed', err);
      throw new Error('Database write operation failed.');
    }
  },

  getAnalysisById: async (id) => {
    if (!isFallbackMode && AnalysisModel) {
      try {
        const doc = await AnalysisModel.findOne({ id }).lean();
        if (doc) return doc;
      } catch (err) {
        console.error('MongoDB find failed, trying JSON', err);
      }
    }

    // Fallback JSON operations
    try {
      initJsonDb();
      const rawData = fs.readFileSync(JSON_DB_PATH, 'utf-8');
      const history = JSON.parse(rawData);
      const match = history.find(item => item.id === id);
      return match || null;
    } catch (err) {
      console.error('JSON read failed', err);
      return null;
    }
  },

  getHistory: async () => {
    if (!isFallbackMode && AnalysisModel) {
      try {
        // Return latest 20 documents
        const docs = await AnalysisModel.find()
          .sort({ createdAt: -1 })
          .limit(20)
          .lean();
        return docs;
      } catch (err) {
        console.error('MongoDB history fetch failed, trying JSON', err);
      }
    }

    // Fallback JSON operations
    try {
      initJsonDb();
      const rawData = fs.readFileSync(JSON_DB_PATH, 'utf-8');
      const history = JSON.parse(rawData);
      // Sort by date descending and limit to 20
      return history
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20);
    } catch (err) {
      console.error('JSON history fetch failed', err);
      return [];
    }
  }
};

module.exports = {
  connectDB,
  dbService,
  isFallback: () => isFallbackMode
};
