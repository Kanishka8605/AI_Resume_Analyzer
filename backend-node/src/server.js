require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const resumeRoutes = require('./routes/resume');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/resume', resumeRoutes);

// Healthy check route
app.get('/health', (req, res) => {
  const { isFallback } = require('./config/db');
  res.status(200).json({
    status: 'healthy',
    databaseMode: isFallback() ? 'JSON File Fallback' : 'MongoDB Mongoose',
    timestamp: new Date().toISOString()
  });
});

// Catch-all route handler for 404s
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Boot server after connecting to database
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 API Gateway running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Fatal: Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
