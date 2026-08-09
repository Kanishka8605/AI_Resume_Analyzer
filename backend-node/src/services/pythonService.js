const axios = require('axios');
const FormData = require('form-data');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

/**
 * Fallback JS-native text extraction for binary buffers (PDF/DOCX/TXT) if Python service is down
 */
const fallbackExtractText = (fileBuffer, filename = '') => {
  const isTxt = filename.toLowerCase().endsWith('.txt');
  if (isTxt) {
    try {
      const text = fileBuffer.toString('utf-8').strip ? fileBuffer.toString('utf-8').trim() : fileBuffer.toString('utf-8');
      if (text.length > 10) return text;
    } catch (e) {
      // ignore
    }
  }

  // Regex string extractor for PDF / DOCX / DOC / TXT binary streams
  const pattern = /[a-zA-Z0-9\s\.,;:!\?\-\@\_\(\)\[\]\{\}\/\\"'\&\+\#\*\=\%\<\>]{4,}/g;
  const rawString = fileBuffer.toString('binary');
  const matches = rawString.match(pattern) || [];
  
  const textRuns = matches
    .map(m => m.trim())
    .filter(m => m.replace(/[\s\.\,\-_]+/g, '').length > 2);

  let extractedText = textRuns.join('\n')
    .replace(/\n+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  if (!extractedText || extractedText.length < 20) {
    throw new Error('Unable to extract text from document. Please ensure the document is a readable file.');
  }

  return extractedText;
};

/**
 * Fallback JS-native ATS rule analyzer if Python service is unavailable
 */
const fallbackAnalyzeText = (resumeText, targetRole = '') => {
  const textLower = resumeText.toLowerCase();
  const words = resumeText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Sections check
  const sectionRules = [
    { name: 'Summary', keywords: ['summary', 'profile', 'objective'] },
    { name: 'Experience', keywords: ['experience', 'employment', 'work history', 'history'] },
    { name: 'Education', keywords: ['education', 'degree', 'academic', 'academics'] },
    { name: 'Skills', keywords: ['skills', 'technologies', 'expertise', 'competencies'] },
    { name: 'Projects', keywords: ['projects', 'portfolio'] },
    { name: 'Certifications', keywords: ['certifications', 'certificates', 'licenses', 'courses'] }
  ];

  const sections = sectionRules.map(sec => {
    const present = sec.keywords.some(kw => textLower.includes(kw));
    return {
      name: sec.name,
      present: present,
      score: present ? 100 : (sec.name === 'Experience' || sec.name === 'Skills' || sec.name === 'Education' ? 0 : 40),
      feedback: present
        ? `Detected standard '${sec.name}' section header.`
        : `Missing '${sec.name}' section. Adding this improves ATS scanning.`
    };
  });

  // 2. Contact details
  const hasEmail = /[\w\.-]+@[\w\.-]+\.\w+/.test(resumeText);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  const hasWeb = /(github\.com|linkedin\.com|portfolio|www\.)/i.test(resumeText);

  let contactScore = (hasEmail ? 7 : 0) + (hasPhone ? 7 : 0) + (hasWeb ? 6 : 0);
  let wordScore = wordCount >= 300 && wordCount <= 900 ? 15 : 8;
  let sectionScore = sections.filter(s => s.present).length * 6;

  // 3. Keywords
  const roleKeywordsMap = {
    web: ['javascript', 'html', 'css', 'react', 'node', 'git', 'responsive', 'api', 'typescript', 'tailwind'],
    frontend: ['react', 'javascript', 'typescript', 'css', 'html', 'tailwind', 'vue', 'webpack', 'ui/ux'],
    backend: ['node', 'express', 'python', 'java', 'sql', 'postgresql', 'mongodb', 'docker', 'api', 'redis'],
    data: ['python', 'sql', 'pandas', 'numpy', 'scikit-learn', 'tableau', 'machine learning', 'data analysis']
  };

  const roleKey = Object.keys(roleKeywordsMap).find(k => (targetRole || '').toLowerCase().includes(k)) || 'web';
  const targetKws = roleKeywordsMap[roleKey];

  const foundKws = targetKws.filter(kw => textLower.includes(kw));
  const missingKws = targetKws.filter(kw => !textLower.includes(kw));

  let keywordScore = Math.round((foundKws.length / targetKws.length) * 30);
  let atsScore = Math.min(100, Math.max(20, contactScore + wordScore + sectionScore + keywordScore));
  let overallScore = Math.min(95, Math.max(30, atsScore + 5));

  const strengths = [];
  if (wordCount >= 300) strengths.push('Good text volume and document length for ATS scanning.');
  if (hasEmail && hasPhone) strengths.push('Contains essential contact information (Email & Phone).');
  if (foundKws.length > 0) strengths.push(`Incorporate key industry terms: ${foundKws.join(', ')}.`);
  if (strengths.length === 0) strengths.push('Readable text structure detected.');

  const weaknesses = [];
  if (missingKws.length > 0) weaknesses.push(`Missing role-specific keywords like: ${missingKws.slice(0, 4).join(', ')}.`);
  if (!hasWeb) weaknesses.push('Missing portfolio/GitHub/LinkedIn web link.');
  if (wordCount < 300) weaknesses.push('Resume content is relatively short; elaborate on accomplishments.');
  if (weaknesses.length === 0) weaknesses.push('Could include more quantitative bullet points (% or $ figures).');

  const recommendations = [];
  if (missingKws.length > 0) {
    recommendations.push({
      category: 'Technical Skills',
      severity: 'critical',
      message: `Incorporate key missing industry terms into your experience or skills section: ${missingKws.join(', ')}.`
    });
  }
  recommendations.push({
    category: 'Formatting/ATS',
    severity: 'warning',
    message: 'Use standard bold headings for sections (Experience, Education, Skills) to optimize machine readability.'
  });

  return {
    overallScore,
    atsScore,
    sections,
    strengths,
    weaknesses,
    missingKeywords: missingKws,
    recommendations
  };
};

const pythonService = {
  /**
   * Forwards resume file to Python FastAPI service for text extraction, with JS fallback.
   */
  parseFile: async (fileBuffer, originalname, mimetype) => {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: originalname,
        contentType: mimetype
      });

      const response = await axios.post(`${PYTHON_SERVICE_URL}/parse`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 10000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      return response.data;
    } catch (error) {
      console.warn(`⚠️ Python parsing service unavailable (${error.message}). Executing Node fallback text parser.`);
      try {
        const text = fallbackExtractText(fileBuffer, originalname);
        const words = text.split(/\s+/).filter(Boolean);
        return {
          text,
          file_type: originalname.split('.').pop() || 'txt',
          char_count: text.length,
          word_count: words.length
        };
      } catch (fallbackErr) {
        const errMsg = error.response?.data?.detail || fallbackErr.message || error.message;
        const customError = new Error(errMsg);
        customError.status = error.response?.status || 400;
        throw customError;
      }
    }
  },

  /**
   * Forwards raw text and target job role to Python FastAPI service for grading, with JS fallback.
   */
  analyzeText: async (resumeText, targetRole) => {
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/analyze`, {
        resumeText,
        targetRole
      }, { timeout: 30000 });

      return response.data;
    } catch (error) {
      console.warn(`⚠️ Python analysis service unavailable (${error.message}). Executing Node rule-based fallback analyzer.`);
      try {
        return fallbackAnalyzeText(resumeText, targetRole);
      } catch (fallbackErr) {
        const errMsg = error.response?.data?.detail || fallbackErr.message || error.message;
        const customError = new Error(errMsg);
        customError.status = error.response?.status || 500;
        throw customError;
      }
    }
  },

  /**
   * Forwards user chat query & resume context to Python service for AI assistant response.
   */
  chatWithResume: async (resumeText, targetRole, messages, userMessage) => {
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/chat`, {
        resumeText,
        targetRole: targetRole || '',
        messages: messages || [],
        userMessage
      }, { timeout: 20000 });

      return response.data;
    } catch (error) {
      console.warn(`⚠️ Python chat service unavailable (${error.message}). Executing Node dynamic fallback chat assistant.`);
      const roleTitle = targetRole || 'your target position';
      const isBulletReq = /rewrite|bullet|metric|quantify/i.test(userMessage);
      const isInterviewReq = /interview|question|prepare/i.test(userMessage);
      const isCoverLetterReq = /cover letter|intro/i.test(userMessage);

      let reply = '';
      if (isBulletReq) {
        reply = `### ✍️ Optimized Bullet Point for **${roleTitle}**\n\n` +
          `**Enhanced Google X-Y-Z Bullet Formula:**\n` +
          `-> **"Architected and deployed high-concurrency module for ${roleTitle}, reducing response latency by 35% across 10,000+ active user sessions."**\n\n` +
          `*Tip:* Ensure every bullet point blends an Action Verb + Tech Tool + Quantifiable Output (% or $).`;
      } else if (isInterviewReq) {
        reply = `### 🎙️ Tailored Technical & Behavioral Interview Questions for **${roleTitle}**\n\n` +
          `1. **System Design & Tech:** *What architectural trade-offs did you evaluate in your main project listed on your resume?*\n` +
          `2. **Debugging:** *Describe a complex production bottleneck you resolved while building for ${roleTitle}. How did you measure performance improvement?*\n` +
          `3. **Collaboration:** *How do you handle feature prioritization and technical debt when working under tight deadlines?*`;
      } else if (isCoverLetterReq) {
        reply = `### ✉️ Tailored Cover Letter Intro for **${roleTitle}**\n\n` +
          `Dear Hiring Team,\n\n` +
          `I am writing to express my enthusiasm for the **${roleTitle}** role. Having engineered scalable software solutions and delivered impact across the technologies detailed on my resume, I am confident in bringing immediate technical value to your team.`;
      } else {
        reply = `Hello! I am your **AI Resume & Career Assistant**. I've analyzed your resume specifically for **${roleTitle}**.\n\n` +
          `Ask me to:\n` +
          `- ✍️ **Rewrite bullet points** with numbers & metrics.\n` +
          `- 🎯 **Find missing role-specific keywords**.\n` +
          `- 🎙️ **Generate tailored interview questions**.\n` +
          `- ✉️ **Draft a cover letter intro**!`;
      }

      return {
        reply,
        suggestedFollowups: [
          `How can I improve my resume for ${roleTitle}?`,
          `Rewrite my bullet points using quant metrics`,
          `Generate interview questions for ${roleTitle}`
        ]
      };
    }
  }
};

module.exports = pythonService;


