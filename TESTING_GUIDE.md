# 🧪 Testing Guide - Backend & Frontend

**Last Updated:** 2026-01-31  
**Purpose:** Verify all implemented features work correctly

---

## 📋 Pre-Test Checklist

Before testing, ensure you have:
- ✅ Python 3.10+ installed
- ✅ Node.js 18+ installed
- ✅ Ollama installed and running
- ✅ Tesseract OCR installed (for image CVs)

---

## 🐍 Part 1: Backend Testing

### Step 1: Start Ollama

Open a terminal:
```bash
ollama serve
```

Pull the model (first time only):
```bash
ollama pull llama3
```

Verify it's running:
```bash
curl http://localhost:11434/api/tags
```

### Step 2: Set Up Backend

Open a new terminal:

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Reset Database (Clean Start)

```bash
python -c "from src.database.db import reset_db; reset_db()"
```

Expected output:
```
🗑️  Deleted database: ...backend\storage\app.db
✅ Database initialized at: ...backend\storage\app.db
```

### Step 4: Run Backend Tests

**Test Phase 1 (Database & Services):**
```bash
python test_phase1.py
```

Expected: All 10 tests should pass ✅

**Test Phase 2 (CV Analysis Engine):**
```bash
python test_phase2.py
```

Expected:
- PDF Extractor: ✅ PASS
- Ollama Client: ✅ PASS (if Ollama is running)
- CV Analysis: ⏸️ PENDING (requires Ollama + model)

**Test Phase 3 (API Endpoints):**

First, start the server in a new terminal:
```bash
cd backend
python app.py
```

Then in another terminal:
```bash
python test_phase3.py
```

Press Enter when prompted (server must be running).

Expected: All API endpoints should respond correctly ✅

### Step 5: Manual API Testing

With the server running (`python app.py`), test these endpoints:

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

Expected:
```json
{
  "status": "healthy",
  "services": {
    "api": "running",
    "database": "connected",
    "ollama": "available"
  }
}
```

**System Status:**
```bash
curl http://localhost:5000/api/status
```

**Create a Job:**
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"QA Engineer\",\"company\":\"Test Corp\",\"description\":\"Testing role\",\"requirements\":[\"Testing\",\"Automation\"],\"skills\":[\"Selenium\",\"Python\"]}"
```

Expected: Returns job with `id: 1` ✅

**List Jobs:**
```bash
curl http://localhost:5000/api/jobs
```

Expected: Array with your created job ✅

**Upload a CV (requires a PDF file):**

Create a test file or use an existing PDF:
```bash
# Windows PowerShell
curl.exe -X POST http://localhost:5000/api/jobs/1/candidates/upload -F "files=@C:\path\to\your\cv.pdf"

# Mac/Linux
curl -X POST http://localhost:5000/api/jobs/1/candidates/upload -F "files=@/path/to/your/cv.pdf"
```

Expected: Upload success with candidate ID ✅

**Start Analysis:**
```bash
curl -X POST http://localhost:5000/api/jobs/1/analyze
```

Expected: Analysis starts (may take 30-60s per CV) ✅

**Check Analysis Status:**
```bash
curl http://localhost:5000/api/jobs/1/analyze/status
```

**List Candidates:**
```bash
curl http://localhost:5000/api/jobs/1/candidates
```

**Export Results:**
```bash
curl "http://localhost:5000/api/jobs/1/export?format=csv" -o candidates.csv
```

### Backend Test Summary

✅ **What Should Work:**
- Database initialization
- Job CRUD operations
- CV file upload (PDF, PNG, JPG)
- Text extraction (PDF + OCR)
- AI analysis (with Ollama)
- Candidate retrieval
- CSV/Excel export

---

## ⚛️ Part 2: Frontend Testing

**Note:** Frontend is 50% complete - components exist but pages are not fully built yet.

### Step 1: Set Up Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install
```

### Step 2: Configure Environment

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Check Frontend Build

```bash
# Check for TypeScript errors
npm run build
```

Expected: Should compile successfully ✅

### Step 4: Start Dev Server

```bash
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 5: Test Components (Via Storybook or Manual)

Since pages aren't complete, you can verify components exist:

**Check component files:**
```bash
# List components (Windows PowerShell)
Get-ChildItem -Recurse frontend\src\components\*.tsx

# Mac/Linux
find frontend/src/components -name "*.tsx"
```

Expected components:
```
✅ jobs/JobCard.tsx
✅ jobs/JobForm.tsx
✅ candidates/CandidateCard.tsx
✅ candidates/CandidateList.tsx
✅ upload/CVUploader.tsx
✅ common/StatsCard.tsx
✅ common/LoadingSpinner.tsx
✅ common/EmptyState.tsx
```

### Step 6: Test API Client

You can test the API client in browser console:

1. Open browser to `http://localhost:5173`
2. Open DevTools (F12)
3. Go to Console
4. Import and test API functions:

```javascript
// Test health check
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log);

// Test getting jobs
fetch('http://localhost:5000/api/jobs')
  .then(r => r.json())
  .then(console.log);
```

### Frontend Test Summary

✅ **What Should Work:**
- TypeScript compilation
- Component definitions
- API client functions
- Dev server running

❌ **What's Not Ready:**
- Full pages (Dashboard, JobDetail, etc.)
- React Router navigation
- React Query integration
- Complete user workflows

---

## 🎯 Integration Test (Backend + Frontend)

### Full Workflow Test:

1. **Backend running** on `http://localhost:5000`
2. **Ollama running** on `http://localhost:11434`
3. **Frontend running** on `http://localhost:5173`

**Test this workflow via API (curl):**

```bash
# 1. Create a job
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"title":"Full Stack Dev","company":"Tech Inc","description":"Build apps","requirements":["React","Node.js"],"skills":["JavaScript","TypeScript"]}'

# 2. Upload CVs
curl -X POST http://localhost:5000/api/jobs/1/candidates/upload \
  -F "files=@resume1.pdf" \
  -F "files=@resume2.pdf"

# 3. Start analysis
curl -X POST http://localhost:5000/api/jobs/1/analyze

# 4. Wait 30-60 seconds...

# 5. Check results
curl http://localhost:5000/api/jobs/1/candidates

# 6. Export
curl "http://localhost:5000/api/jobs/1/export?format=csv" -o results.csv
```

---

## 📊 Test Checklist

### Backend ✅
- [ ] Ollama server running
- [ ] Database initialized
- [ ] Backend server running (port 5000)
- [ ] Health check returns "healthy"
- [ ] Can create job
- [ ] Can upload CV files
- [ ] Can start analysis
- [ ] Analysis completes successfully
- [ ] Can list candidates
- [ ] Can export to CSV/Excel

### Frontend 🚧
- [ ] Dependencies installed
- [ ] TypeScript compiles without errors
- [ ] Dev server runs (port 5173)
- [ ] Components exist and are valid
- [ ] API client functions defined
- [ ] Can fetch data from backend API

### Integration ⏸️
- [ ] Frontend can call backend API
- [ ] CORS configured correctly
- [ ] Data flows from upload → analysis → display
- [ ] **Full UI workflow** (⏸️ Pending - pages not complete)

---

## 🐛 Troubleshooting

### Backend Issues

**"Database is locked"**
```bash
python -c "from src.database.db import reset_db; reset_db()"
```

**"Cannot connect to Ollama"**
```bash
# Check Ollama
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

**"Port 5000 already in use"**
```bash
# Change port in backend/.env
PORT=5001
```

### Frontend Issues

**"Failed to fetch"**
- Ensure backend is running
- Check CORS (already configured)
- Verify `VITE_API_URL` in `.env`

**TypeScript errors**
```bash
npm install
npm run build
```

---

## 📝 Test Results Template

Use this to track your testing:

```
=== Backend Tests ===
[ ] Phase 1: Database & Services
[ ] Phase 2: CV Analysis
[ ] Phase 3: API Endpoints
[ ] Manual API Tests
[ ] File Upload Works
[ ] AI Analysis Works
[ ] Export Works

=== Frontend Tests ===
[ ] Dependencies Installed
[ ] Build Compiles
[ ] Dev Server Runs
[ ] Components Exist
[ ] API Client Works

=== Integration ===
[ ] Backend → Frontend Communication
[ ] CORS Working
[ ] End-to-End Test (via API)

Notes:
_________________________________
```

---

## 🎉 Expected Results

After testing, you should have:

✅ **Backend:** Fully functional API with 17 endpoints  
✅ **Frontend:** Component library ready (50% of Phase 4)  
⏸️ **UI:** Pages pending (remaining 50% of Phase 4)

**Next Steps After Testing:**
1. Fix any issues found
2. Continue Phase 4 (build pages)
3. Complete React Router & Query setup
4. Full integration testing

---

**Happy Testing!** 🚀

If you find any issues, document them and we'll fix them before continuing with Phase 4.
