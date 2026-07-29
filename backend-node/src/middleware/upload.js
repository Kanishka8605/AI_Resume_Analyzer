const multer = require('multer');
const path = require('path');

// Multer in-memory storage configurations
const storage = multer.memoryStorage();

// Allowed file extension and MIME-type validators
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain'
];

const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  const fileMime = file.mimetype;

  // 1. Verify extension
  const isExtValid = ALLOWED_EXTENSIONS.includes(fileExt);
  
  // 2. Verify MIME type (allow text/plain or doc/docx or pdf)
  const isMimeValid = ALLOWED_MIME_TYPES.includes(fileMime) || 
                      (fileExt === '.txt' && fileMime.startsWith('text/')) ||
                      // Fallback for some windows environments that send octet-stream for docs
                      fileMime === 'application/octet-stream';

  if (isExtValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed formats: PDF, DOCX, DOC, TXT (detected ext: ${fileExt}, mime: ${fileMime})`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
