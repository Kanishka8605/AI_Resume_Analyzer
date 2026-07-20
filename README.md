# AI Resume Analyzer Bot 🤖📄

A production-ready, full-stack web application that allows users to upload their resumes (PDF, DOCX, DOC, TXT) and receive comprehensive AI-generated feedback, ATS compatibility scores, and tailored keyword/improvement suggestions based on target roles.

---

## Architecture and Services

The project is structured into three main services:
1. **`frontend`**: A React single page app built using Vite, styled with Tailwind CSS, and using Recharts for dynamic visual dashboards.
2. **`backend-node`**: An Express.js backend that handles routing, files upload via Multer, proxies request payload to the Python parser/AI service, and handles history caching with MongoDB or a fallback local database.
3. **`ai-service-python`**: A FastAPI service that performs PDF/DOCX parsing, rule-based scoring (file size, structures, formatting), keyword density check, and queries Anthropic's Claude API for qualitative review.

For communication details, view the [docs/architecture.md](file:///c:/Users/kishore%20kumar/OneDrive/Desktop/AI_Resume_Analyzer/docs/architecture.md) file.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React (Vite), React Router, Tailwind CSS, Recharts, Axios, Lucide Icons |
| **Backend API Gateway** | Node.js, Express, Multer, Axios, Mongoose/MongoDB (JSON fallback) |
| **Parser / NLP** | Python, FastAPI, Uvicorn, pdfplumber, python-docx, docx2txt |
| **AI LLM Engine** | Anthropic Claude API (flexible provider interface) |

---

## Project Structure

```
AI_Resume_Analyzer/
├── frontend/                  # React.js app
│   ├── src/
│   │   ├── components/        # UI widgets (Navbar, ProgressBar, ScoreChart, UploadBox, etc.)
│   │   ├── pages/             # Dashboard, Upload, History, About
│   │   ├── services/          # Axios HTTP client
│   │   ├── context/           # Global context state (analyses/history)
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
│
├── backend-node/               # Express API gateway
│   ├── src/
│   │   ├── routes/            # /api/resume, /api/analyze, /api/history
│   │   ├── controllers/       # Controller handling DB save/load
│   │   ├── middleware/        # Upload config, error handlers
│   │   ├── services/          # Calls to python server
│   │   └── server.js          # Entry point
│   ├── .env.example
│   └── package.json
│
├── ai-service-python/          # FastAPI parser & LLM engine
│   ├── app/
│   │   ├── main.py            # Entry point
│   │   ├── parsers/           # pdf_parser.py, docx_parser.py, txt_parser.py
│   │   ├── analysis/          # ats_scorer.py, keyword_matcher.py, section_analyzer.py
│   │   └── ai/                # llm_client.py, prompt_templates.py
│   ├── requirements.txt
│   └── .env.example
```

---

## Installation & Setup

### Prerequisites
- **Node.js**: v18.x or above (v22 recommended)
- **Python**: v3.9 or above (v3.12 recommended)
- **MongoDB**: Optional (runs in JSON file-database mode if MongoDB is absent or not configured)

---

### Step 1: Set Up & Run `ai-service-python`
1. Navigate to the directory:
   ```bash
   cd ai-service-python
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On MacOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment:
   Create a `.env` file copied from `.env.example` and insert your API key:
   ```env
   ANTHROPIC_API_KEY=your-api-key-here
   MODEL_NAME=claude-3-5-sonnet-20241022
   MAX_TOKENS=2000
   ```
5. Run the service:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The internal API will be live on `http://localhost:8000`.

---

### Step 2: Set Up & Run `backend-node`
1. Navigate to the directory:
   ```bash
   cd backend-node
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Configure environment:
   Create a `.env` file copied from `.env.example`:
   ```env
   PORT=5000
   PYTHON_SERVICE_URL=http://localhost:8000
   MONGODB_URI=mongodb://localhost:27017/resume_analyzer
   NODE_ENV=development
   ```
   *Note: If MongoDB is not running, the application auto-falls back to storage inside the local file `backend-node/data/history.json`.*
4. Start the server:
   ```bash
   npm run dev
   ```
   The API will be live on `http://localhost:5000`.

---

### Step 3: Set Up & Run `frontend`
1. Navigate to the directory:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Configure environment:
   Create a `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Launch the Dev Server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## API Endpoints

### 1. Node.js API Gateway (Port 5000)

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| **POST** | `/api/resume/upload` | Upload resume file and parse it | Multipart Form (`file`, optional `targetRole`) |
| **POST** | `/api/resume/analyze` | Submit raw resume text and role | JSON `{ text: string, targetRole: string }` |
| **GET** | `/api/resume/history` | Fetch analysis history list | None |
| **GET** | `/api/resume/analysis/:id` | Fetch specific resume analysis | URL Parameter `id` |

### 2. Python FastAPI Service (Port 8000)

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| **POST** | `/parse` | Extract plain text from file | Multipart Form (`file`) |
| **POST** | `/analyze` | Score text & generate LLM feedback | JSON `{ resumeText: string, targetRole: string }` |

---

## License

Distributed under the MIT License. See [LICENSE](file:///c:/Users/kishore%20kumar/OneDrive/Desktop/AI_Resume_Analyzer/LICENSE) for more details.
