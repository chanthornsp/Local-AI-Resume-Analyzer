# 🚀 How to Run the Local AI Resume Analyzer

**Job-Centric CV Screening System**  
A privacy-focused, local AI-powered recruitment tool with persistent job management and SQLite storage.

---

## 📋 System Overview

This application consists of **three parts** that must run simultaneously:

1. **Ollama** - Local AI/LLM provider (llama3 model)
2. **Backend** - Python Flask REST API (Port 5000)
3. **Frontend** - React + TypeScript UI (Port 5173) *(In Progress)*

---

## ✅ Prerequisites

Before you begin, ensure you have:

- **Python 3.10+** installed
- **Node.js 18+** and `npm` installed
- **Ollama** installed from [ollama.com](https://ollama.com)
- **Tesseract OCR** (for image-based CVs): [Installation Guide](https://github.com/tesseract-ocr/tesseract)

---

## 🚀 Fast Track: Unified Start

Instead of running backend and frontend separately, you can use the unified starter script:

1. **Install Dependencies** (First run only):
   - Backend: `cd backend` (setup venv) and `pip install -r requirements.txt`
   - Frontend: `cd frontend && npm install`

2. **Run the App**:
   ```bash
   python start.py
   ```

*If you prefer running services manually, follow the detailed steps below.*

---

## 🟢 Step 1: Start Ollama (AI Engine)

Open a terminal and start the Ollama service:

```bash
ollama serve
```

*Keep this terminal open.*

### 💡 First Run Only - Pull the Model

Download the llama3 model (required for AI analysis):

```bash
ollama pull llama3
```

**Verify it's working:**
```bash
curl http://localhost:11434/api/tags
```

You should see `llama3` in the list of models.

---

## 🐍 Step 2: Start Backend (Flask API)

Open a **new terminal** and follow these steps:

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
.\venv\Scripts\Activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

This installs:
- Flask & Flask-CORS
- pdfplumber (PDF extraction)
- pytesseract & Pillow (OCR & image processing)
- pandas & openpyxl (Excel export)
- requests (Ollama client)

### 4. Configure Environment (Optional)

Create a `.env` file in the `backend/` directory (optional - defaults work):

```env
# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
OLLAMA_TIMEOUT=120

# Server Configuration
PORT=5000
FLASK_ENV=development

# File Upload
MAX_FILE_SIZE=52428800  # 50MB in bytes
```

### 5. Initialize Database

The database will auto-initialize on first run, but you can manually test:

```bash
python -c "from src.database.db import init_db; init_db()"
```

You should see: `✅ Database initialized at: backend/storage/app.db`

### 6. Start the Backend Server

```bash
python app.py
```

**Expected Output:**
```
✅ Database initialized at: C:\...\backend\storage\app.db
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://0.0.0.0:5000
```

### 7. Verify Backend is Running

In a new terminal:

```bash
# Health check
curl http://localhost:5000/api/health

# System status
curl http://localhost:5000/api/status
```

You should see JSON responses with status information.

---

## ⚛️ Step 3: Start Frontend (React UI)

**✅ Note:** Frontend is fully implemented and ready to use.

Open a **new terminal**:

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment (Optional)

Create `.env` file in `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🌐 Step 4: Use the Application

### Access the UI
Open your browser and go to: **[http://localhost:5173](http://localhost:5173)**

*(Frontend is fully functional)*

### Test the API Directly

You can test the backend API using curl or Postman:

#### Create a Job
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior React Developer",
    "company": "Tech Corp",
    "description": "Looking for an experienced React developer...",
    "requirements": ["5+ years React", "TypeScript", "Redux"],
    "skills": ["React", "TypeScript", "Redux", "REST API"],
    "location": "New York, NY",
    "salary_range": "$120k-$160k"
  }'
```

#### List Jobs
```bash
curl http://localhost:5000/api/jobs
```

#### Upload CVs (requires multipart/form-data)
```bash
curl -X POST http://localhost:5000/api/jobs/1/candidates/upload \
  -F "files=@path/to/cv1.pdf" \
  -F "files=@path/to/cv2.pdf"
```

#### Start AI Analysis
```bash
curl -X POST http://localhost:5000/api/jobs/1/analyze
```

#### Export Results
```bash
curl "http://localhost:5000/api/jobs/1/export?format=csv" -o candidates.csv
```

---

## 🧪 Running Tests

### Backend Tests

```bash
cd backend

# Phase 1: Database & Services
python test_phase1.py

# Phase 2: CV Analysis Engine
python test_phase2.py

# Phase 3: API Endpoints (requires server running)
python test_phase3.py
```

### Frontend Tests
*(Completed in Phase 5)*

---

## 📊 Implementation Status

| Component | Status | Progress |
|-----------|--------|----------|
| **Backend Database** | ✅ Complete | 100% |
| **CV Analysis Engine** | ✅ Complete | 100% |
| **REST API (17 endpoints)** | ✅ Complete | 100% |
| **Frontend Types & API Client** | ✅ Complete | 100% |
| **Frontend Components** | 🚧 In Progress | 30% |
| **Frontend Pages** | 📋 Not Started | 0% |
| **Full Integration** | 📋 Pending | 0% |

| Component | Status | Progress |
|-----------|--------|----------|
| **Backend Database** | ✅ Complete | 100% |
| **CV Analysis Engine** | ✅ Complete | 100% |
| **REST API (17 endpoints)** | ✅ Complete | 100% |
| **Frontend Types & API Client** | ✅ Complete | 100% |
| **Frontend Components** | ✅ Complete | 100% |
| **Frontend Pages** | ✅ Complete | 100% |
| **Full Integration** | ✅ Complete | 100% |

**Overall Progress:** 100% Complete

---

## 🛠 Troubleshooting

### Backend Issues

**Error: "ModuleNotFoundError: No module named 'pdfplumber'"**
- Solution: Install dependencies: `pip install -r requirements.txt`

**Error: "Database is locked" or permission errors**
- Solution: Close any SQLite viewers, restart backend
- Or reset database: `python -c "from src.database.db import reset_db; reset_db()"`

**Error: "Cannot connect to Ollama"**
- Solution: Ensure `ollama serve` is running
- Verify: `curl http://localhost:11434/api/tags`

**Error: Port 5000 already in use**
- Solution: Change port in `.env`: `PORT=5001`
- Update frontend `.env`: `VITE_API_URL=http://localhost:5001/api`

### Frontend Issues

**Error: "Failed to fetch" or "Network request failed"**
- Ensure backend is running on port 5000
- Check CORS is enabled (already configured)
- Verify `VITE_API_URL` in frontend `.env`

**Error: OCR not working (image CVs fail)**
- Install Tesseract OCR
- Windows: Download installer from GitHub
- Mac: `brew install tesseract`
- Linux: `sudo apt-get install tesseract-ocr`

---

## 🔧 Advanced Configuration

### Using a Different LLM Model

```bash
# Pull different model
ollama pull mistral

# Update backend/.env
OLLAMA_MODEL=mistral
```

### Adjusting Score Thresholds

Edit `backend/src/utils/config.py`:

```python
CATEGORY_THRESHOLDS = {
    'excellent': 90,      # Changed from 85
    'good': 75,           # Changed from 70
    'average': 60,        # Changed from 50
    'below_average': 0
}
```

### Increasing File Upload Size

Edit `backend/.env`:

```env
MAX_FILE_SIZE=104857600  # 100MB
```

---

## 📁 Project Structure

```
Local-AI-Resume-Analyzer/
├── backend/
│   ├── app.py                 # Flask application
│   ├── src/
│   │   ├── api/              # REST API blueprints
│   │   ├── services/         # Business logic
│   │   ├── core/             # PDF/image extraction
│   │   ├── database/         # SQLite manager
│   │   └── utils/            # Configuration
│   ├── storage/
│   │   └── app.db            # SQLite database
│   └── uploads/              # Temporary file storage
│
├── frontend/
│   ├── src/
│   │   ├── lib/              # Types, API client, utils
│   │   ├── components/       # React components
│   │   └── pages/            # Page components
│   └── ...
│
└── Documentation/
    ├── GUIDE.md              # This file
    ├── IMPLEMENTATION_V2.md  # Architecture & diagrams
    ├── SESSION_SUMMARY.md    # Implementation progress
    └── PHASE[1-3]_COMPLETE.md # Phase reports
```

---

## 🎯 What Works Right Now

### ✅ Fully Functional
- Create and manage job listings
- Upload CV files (PDF, PNG, JPG)
- Extract text with OCR
- AI-powered candidate analysis
- Score-based categorization
- Export to CSV/Excel
- REST API with 17 endpoints
- **Complete Frontend UI Dashboard**
- **Real-time analysis progress**
- **Advanced filtering and sorting**

---

## 📚 API Documentation

Full API documentation available at:
- Local: `http://localhost:5000/api/` (when running)
- See: `PHASE3_COMPLETE.md` for endpoint details

**Available Endpoints:**
- Jobs: List, Create, Update, Delete, Stats (6 endpoints)
- Candidates: Upload, List, View, Delete, Shortlist (5 endpoints)
- Analysis: Start, Status, Retry (3 endpoints)
- Export: CSV/Excel (1 endpoint)
- System: Health, Status (2 endpoints)

---



## 🚀 Project Status
The application is **Complete (Phase 6 Finished)**.

1. **Phase 4 (Frontend)**: ✅ Completed
2. **Phase 5 (Integration)**: ✅ Completed
3. **Phase 6 (Polish)**: ✅ Completed

Ready for deployment and production use.

---

## 💡 Tips

- **Performance**: Analysis speed depends on your CPU and Ollama model
- **Accuracy**: Text-based PDFs work best; scanned documents need good quality
- **Privacy**: All data stays local - no external API calls
- **Storage**: Database grows with candidates; clean up old jobs periodically

---

## 🆘 Getting Help

1. Check `SESSION_SUMMARY.md` for implementation details
2. Review test files (`test_phase*.py`) for usage examples
3. See `IMPLEMENTATION_V2.md` for architecture diagrams
4. Check phase completion reports for specific features

---

**Last Updated:** 2026-02-05
**Version:** 3.0 (Complete Feature-Complete)
