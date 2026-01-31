# Implementation Plan: Job-Centric CV Screening System

**Based on:** IMPLEMENTATION_V2.md  
**Created:** 2026-01-31  
**Target Timeline:** 3-4 weeks (for MVP)

---

## 📋 Table of Contents

1. [Project Phases](#project-phases)
2. [Phase 1: Database & Backend Foundation](#phase-1-database--backend-foundation)
3. [Phase 2: Core CV Analysis Engine](#phase-2-core-cv-analysis-engine)
4. [Phase 3: API Development](#phase-3-api-development)
5. [Phase 4: Frontend Implementation](#phase-4-frontend-implementation)
6. [Phase 5: Integration & Testing](#phase-5-integration--testing)
7. [Phase 6: Polish & Deployment](#phase-6-polish--deployment)
8. [Risk Mitigation](#risk-mitigation)
9. [Success Metrics](#success-metrics)

---

## Project Phases

| Phase | Focus | Duration | Dependencies |
|-------|-------|----------|--------------|
| **Phase 1** | Database & Backend Foundation | 3-4 days | None |
| **Phase 2** | Core CV Analysis Engine | 4-5 days | Phase 1 |
| **Phase 3** | API Development | 3-4 days | Phase 1, 2 |
| **Phase 4** | Frontend Implementation | 5-6 days | Phase 3 |
| **Phase 5** | Integration & Testing | 3-4 days | All previous |
| **Phase 6** | Polish & Deployment | 2-3 days | Phase 5 |

**Total Estimated Time:** 20-26 days

---

## Phase 1: Database & Backend Foundation

**Goal:** Set up SQLite database, create models, and implement CRUD services.

### 1.1 Database Setup

- [ ] **Task 1.1.1:** Create database connection manager
  - **File:** `backend/src/database/db.py`
  - **Actions:**
    - Implement `init_db()` function
    - Create `get_db()` context manager
    - Add connection pooling if needed
  - **Tests:** Test database creation and connection
  - **Estimated Time:** 2 hours

- [ ] **Task 1.1.2:** Define database schema
  - **Actions:**
    - Create `jobs` table schema
    - Create `candidates` table schema
    - Add foreign key constraints
    - Create indexes for performance
  - **Tests:** Verify schema with sample data
  - **Estimated Time:** 2 hours

- [ ] **Task 1.1.3:** Create migration script
  - **File:** `backend/src/database/migrations.py`
  - **Actions:**
    - Write schema creation script
    - Add version tracking
    - Handle schema updates
  - **Estimated Time:** 1 hour

### 1.2 Data Models

- [ ] **Task 1.2.1:** Implement Job model/service
  - **File:** `backend/src/services/job_service.py`
  - **Actions:**
    - `create(data)` - Create new job
    - `get_all()` - List all jobs with stats
    - `get_by_id(job_id)` - Get single job
    - `update(job_id, data)` - Update job
    - `delete(job_id)` - Delete job
  - **Tests:** Unit tests for each method
  - **Estimated Time:** 4 hours

- [ ] **Task 1.2.2:** Implement Candidate model/service
  - **File:** `backend/src/services/candidate_service.py`
  - **Actions:**
    - `create_pending(job_id, filename, cv_text)` - Create pending candidate
    - `update_analysis(candidate_id, analysis)` - Save analysis results
    - `get_by_job(job_id, category)` - Get candidates for job
    - `get_by_id(candidate_id)` - Get single candidate
    - `get_pending(job_id)` - Get unanalyzed candidates
    - `delete(candidate_id)` - Delete candidate
  - **Tests:** Unit tests for each method
  - **Estimated Time:** 4 hours

### 1.3 Configuration

- [ ] **Task 1.3.1:** Update backend configuration
  - **File:** `backend/src/utils/config.py`
  - **Actions:**
    - Add database path configuration
    - Add upload folder settings
    - Add Ollama configuration
  - **Estimated Time:** 1 hour

- [ ] **Task 1.3.2:** Update environment variables
  - **File:** `backend/.env.example`
  - **Actions:**
    - Add database settings
    - Document all environment variables
  - **Estimated Time:** 30 minutes

**Phase 1 Total Time:** ~15 hours (2 days)

---

## Phase 2: Core CV Analysis Engine

**Goal:** Implement PDF/image extraction and AI analysis logic.

### 2.1 PDF/Image Extraction

- [ ] **Task 2.1.1:** Enhance PDF extractor
  - **File:** `backend/src/core/pdf_extractor.py`
  - **Actions:**
    - Keep existing pdfplumber logic
    - Enhance OCR fallback for images
    - Add support for image files (PNG, JPG)
    - Improve text cleaning
  - **Tests:** Test with various PDF formats and images
  - **Estimated Time:** 3 hours

- [ ] **Task 2.1.2:** Add image preprocessing
  - **Actions:**
    - Image enhancement before OCR
    - Handle rotated images
    - Optimize OCR accuracy
  - **Tests:** Test with scanned documents
  - **Estimated Time:** 2 hours

### 2.2 CV Analyzer

- [ ] **Task 2.2.1:** Implement CV Analyzer service
  - **File:** `backend/src/services/cv_analyzer.py`
  - **Actions:**
    - `analyze_candidate(candidate_id, cv_text, job)` - Main analysis function
    - `_build_prompt(cv_text, job)` - Create LLM prompt
    - `_parse_response(response)` - Extract structured data
    - `_get_category(score)` - Categorize by score
  - **Tests:** Test with sample CVs and jobs
  - **Estimated Time:** 5 hours

- [ ] **Task 2.2.2:** Refine LLM prompt engineering
  - **Actions:**
    - Test different prompt formats
    - Improve extraction accuracy
    - Handle edge cases (missing info)
  - **Tests:** Test with 10+ diverse CVs
  - **Estimated Time:** 3 hours

### 2.3 Ollama Client

- [ ] **Task 2.3.1:** Verify Ollama client
  - **File:** `backend/src/services/ollama_client.py`
  - **Actions:**
    - Ensure existing client works
    - Add retry logic for failures
    - Add timeout handling
  - **Tests:** Integration tests with Ollama
  - **Estimated Time:** 2 hours

**Phase 2 Total Time:** ~15 hours (2 days)

---

## Phase 3: API Development

**Goal:** Create REST API endpoints for jobs, candidates, and analysis.

### 3.1 Flask App Structure

- [ ] **Task 3.1.1:** Restructure Flask application
  - **File:** `backend/app.py`
  - **Actions:**
    - Import and register blueprints
    - Configure CORS
    - Add error handlers
    - Initialize database on startup
  - **Estimated Time:** 2 hours

### 3.2 Jobs API

- [ ] **Task 3.2.1:** Implement Jobs endpoints
  - **File:** `backend/src/api/jobs.py`
  - **Endpoints:**
    - `GET /api/jobs` - List all jobs
    - `POST /api/jobs` - Create new job
    - `GET /api/jobs/:id` - Get job details
    - `PUT /api/jobs/:id` - Update job
    - `DELETE /api/jobs/:id` - Delete job
    - `GET /api/jobs/:id/stats` - Get job statistics
  - **Tests:** API integration tests
  - **Estimated Time:** 4 hours

### 3.3 Candidates API

- [ ] **Task 3.3.1:** Implement Candidates endpoints
  - **File:** `backend/src/api/candidates.py`
  - **Endpoints:**
    - `GET /api/jobs/:id/candidates` - List candidates for job
    - `POST /api/jobs/:id/candidates/upload` - Upload CVs
    - `GET /api/candidates/:id` - Get candidate details
    - `DELETE /api/candidates/:id` - Delete candidate
  - **Tests:** Test file upload and retrieval
  - **Estimated Time:** 4 hours

### 3.4 Analysis API

- [ ] **Task 3.4.1:** Implement Analysis endpoints
  - **File:** `backend/src/api/analysis.py`
  - **Endpoints:**
    - `POST /api/jobs/:id/analyze` - Start/resume analysis
    - `GET /api/jobs/:id/analyze/status` - Get analysis progress
  - **Actions:**
    - Implement background job processing (or sync for MVP)
    - Add progress tracking
    - Handle errors gracefully
  - **Tests:** Test with multiple pending candidates
  - **Estimated Time:** 4 hours

### 3.5 Export API

- [ ] **Task 3.5.1:** Implement export functionality
  - **File:** `backend/src/utils/export.py`
  - **Actions:**
    - Create CSV export function
    - Create Excel export function (optional)
    - Add endpoint `GET /api/jobs/:id/export?format=csv`
  - **Tests:** Verify exported file format
  - **Estimated Time:** 3 hours

**Phase 3 Total Time:** ~17 hours (2-3 days)

---

## Phase 4: Frontend Implementation

**Goal:** Build React UI for job management and candidate viewing.

### 4.1 Project Setup

- [ ] **Task 4.1.1:** Update dependencies
  - **File:** `frontend/package.json`
  - **Actions:**
    - Verify all dependencies are installed
    - Add any missing packages (react-router-dom v7, etc.)
  - **Estimated Time:** 1 hour

### 4.2 API Client & Types

- [ ] **Task 4.2.1:** Update TypeScript types
  - **File:** `frontend/src/lib/types.ts`
  - **Actions:**
    - Define `Job` interface
    - Define `Candidate` interface
    - Define `AnalysisProgress` interface
    - Add all necessary enums
  - **Estimated Time:** 1 hour

- [ ] **Task 4.2.2:** Implement API client
  - **File:** `frontend/src/lib/api.ts`
  - **Actions:**
    - Jobs API functions (create, read, update, delete)
    - Candidates API functions (upload, list, get)
    - Analysis API functions (start, check status)
    - Export function
  - **Tests:** Manual API testing
  - **Estimated Time:** 3 hours

### 4.3 UI Components

- [ ] **Task 4.3.1:** Create Job components
  - **Files:**
    - `frontend/src/components/jobs/JobCard.tsx`
    - `frontend/src/components/jobs/JobForm.tsx`
    - `frontend/src/components/jobs/JobList.tsx`
  - **Actions:**
    - JobCard - Display job with stats
    - JobForm - Create/edit job form
    - JobList - Grid of job cards
  - **Estimated Time:** 4 hours

- [ ] **Task 4.3.2:** Create Candidate components
  - **Files:**
    - `frontend/src/components/candidates/CandidateCard.tsx`
    - `frontend/src/components/candidates/CandidateList.tsx`
    - `frontend/src/components/candidates/CandidateDetail.tsx`
    - `frontend/src/components/candidates/CategoryGroup.tsx`
  - **Actions:**
    - CandidateCard - Display candidate summary
    - CandidateList - List of candidates
    - CandidateDetail - Full candidate details
    - CategoryGroup - Candidates grouped by category
  - **Estimated Time:** 5 hours

- [ ] **Task 4.3.3:** Create Upload components
  - **Files:**
    - `frontend/src/components/upload/CVUploader.tsx`
    - `frontend/src/components/upload/UploadProgress.tsx`
  - **Actions:**
    - CVUploader - Drag & drop file upload
    - UploadProgress - Show upload progress
  - **Estimated Time:** 3 hours

### 4.4 Pages

- [ ] **Task 4.4.1:** Implement Dashboard page
  - **File:** `frontend/src/pages/Dashboard.tsx`
  - **Features:**
    - Display all jobs in grid/list
    - Search and filter jobs
    - Create new job button
    - Quick stats overview
  - **Estimated Time:** 4 hours

- [ ] **Task 4.4.2:** Implement Job Create/Edit page
  - **File:** `frontend/src/pages/JobCreate.tsx`
  - **Features:**
    - Form with validation (react-hook-form + zod)
    - Skills and requirements input
    - Submit to API
    - Redirect to job detail on success
  - **Estimated Time:** 3 hours

- [ ] **Task 4.4.3:** Implement Job Detail page
  - **File:** `frontend/src/pages/JobDetail.tsx`
  - **Features:**
    - Display job information
    - CV upload section
    - Start analysis button
    - Candidate list grouped by category
    - Export button
  - **Estimated Time:** 5 hours

- [ ] **Task 4.4.4:** Implement Candidate View page
  - **File:** `frontend/src/pages/CandidateView.tsx`
  - **Features:**
    - Full candidate details
    - Back to job button
    - Download/view original CV (optional)
  - **Estimated Time:** 2 hours

### 4.5 Routing

- [ ] **Task 4.5.1:** Set up React Router
  - **File:** `frontend/src/App.tsx`
  - **Routes:**
    - `/` - Dashboard
    - `/jobs/new` - Create job
    - `/jobs/:id/edit` - Edit job
    - `/jobs/:id` - Job detail
    - `/candidates/:id` - Candidate view
  - **Estimated Time:** 2 hours

### 4.6 State Management

- [ ] **Task 4.6.1:** Set up React Query
  - **File:** `frontend/src/main.tsx`
  - **Actions:**
    - Configure QueryClient
    - Add QueryClientProvider
  - **Estimated Time:** 1 hour

- [ ] **Task 4.6.2:** Create custom hooks
  - **Files:**
    - `frontend/src/hooks/useJobs.ts`
    - `frontend/src/hooks/useCandidates.ts`
    - `frontend/src/hooks/useAnalysis.ts`
  - **Actions:**
    - useJobs - Manage job data
    - useCandidates - Manage candidate data
    - useAnalysis - Handle analysis status
  - **Estimated Time:** 3 hours

**Phase 4 Total Time:** ~37 hours (5-6 days)

---

## Phase 5: Integration & Testing

**Goal:** Connect frontend and backend, test end-to-end workflows.

### 5.1 End-to-End Testing

- [ ] **Task 5.1.1:** Test job creation workflow
  - **Actions:**
    - Create job from frontend
    - Verify database entry
    - View job on dashboard
  - **Estimated Time:** 1 hour

- [ ] **Task 5.1.2:** Test CV upload and analysis
  - **Actions:**
    - Upload multiple PDFs
    - Trigger analysis
    - Monitor progress
    - View categorized results
  - **Estimated Time:** 2 hours

- [ ] **Task 5.1.3:** Test candidate viewing
  - **Actions:**
    - Click on candidates
    - Verify all data displays correctly
    - Test filtering and sorting
  - **Estimated Time:** 1 hour

- [ ] **Task 5.1.4:** Test export functionality
  - **Actions:**
    - Export candidates to CSV
    - Verify file format
    - Check data completeness
  - **Estimated Time:** 1 hour

### 5.2 Bug Fixes

- [ ] **Task 5.2.1:** Fix identified bugs
  - **Actions:**
    - Document all bugs found
    - Prioritize by severity
    - Fix critical bugs first
  - **Estimated Time:** 4-8 hours

### 5.3 Performance Testing

- [ ] **Task 5.3.1:** Test with large datasets
  - **Actions:**
    - Upload 50+ CVs at once
    - Monitor analysis time
    - Check UI responsiveness
  - **Estimated Time:** 2 hours

### 5.4 Error Handling

- [ ] **Task 5.4.1:** Improve error handling
  - **Actions:**
    - Add user-friendly error messages
    - Handle network failures gracefully
    - Add loading states everywhere
  - **Estimated Time:** 3 hours

**Phase 5 Total Time:** ~14-18 hours (2-3 days)

---

## Phase 6: Polish & Deployment

**Goal:** Final touches, documentation, and deployment preparation.

### 6.1 UI/UX Polish

- [ ] **Task 6.1.1:** Improve UI design
  - **Actions:**
    - Consistent spacing and typography
    - Add animations and transitions
    - Improve mobile responsiveness
    - Add empty states
  - **Estimated Time:** 4 hours

- [ ] **Task 6.1.2:** Add loading and success states
  - **Actions:**
    - Skeleton loaders
    - Toast notifications
    - Progress indicators
  - **Estimated Time:** 2 hours

### 6.2 Documentation

- [ ] **Task 6.2.1:** Update README.md
  - **Actions:**
    - Installation instructions
    - Setup guide
    - Usage examples
    - Screenshots
  - **Estimated Time:** 2 hours

- [ ] **Task 6.2.2:** Create user guide
  - **Actions:**
    - How to create a job
    - How to upload CVs
    - How to view results
    - How to export data
  - **Estimated Time:** 2 hours

### 6.3 Deployment Preparation

- [ ] **Task 6.3.1:** Create deployment scripts
  - **Actions:**
    - Database initialization script
    - Environment setup script
    - Docker support (optional)
  - **Estimated Time:** 3 hours

- [ ] **Task 6.3.2:** Security review
  - **Actions:**
    - Check for SQL injection vulnerabilities
    - Validate file uploads
    - Sanitize user inputs
    - Add rate limiting (if needed)
  - **Estimated Time:** 2 hours

**Phase 6 Total Time:** ~15 hours (2-3 days)

---

## Risk Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Ollama API slow/unreliable | Medium | High | Add retry logic, implement queuing system |
| OCR accuracy issues | Medium | Medium | Use high-quality preprocessing, allow manual review |
| Large file uploads timeout | Low | Medium | Implement chunked uploads, add progress tracking |
| Database performance with many candidates | Low | Medium | Add proper indexes, implement pagination |

### Process Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scope creep | Medium | High | Stick to MVP features, track nice-to-haves separately |
| Unclear requirements | Low | Medium | Regular check-ins, validate with sample data |
| Integration issues | Medium | Medium | Test frequently, mock APIs during development |

---

## Success Metrics

### Functional Requirements

- [ ] Recruiters can create and manage job listings
- [ ] Recruiters can upload bulk CVs (PDF and images)
- [ ] System analyzes CVs and categorizes candidates
- [ ] All data persists in SQLite database
- [ ] Recruiters can view candidate details
- [ ] Export functionality works correctly

### Performance Requirements

- [ ] CV analysis completes within 30 seconds per CV
- [ ] UI responds within 100ms for interactions
- [ ] Can handle 50+ CVs in a single upload
- [ ] Database queries complete within 500ms

### Quality Requirements

- [ ] 95%+ CV text extraction accuracy
- [ ] 85%+ LLM categorization accuracy
- [ ] Zero data loss (all uploads saved)
- [ ] Graceful error handling (no crashes)

---

## Daily Development Schedule (Sample)

### Week 1: Backend Foundation
- **Day 1-2:** Phase 1 - Database & services
- **Day 3-4:** Phase 2 - CV analysis engine
- **Day 5:** Phase 3 - Start API development

### Week 2: API & Frontend Setup
- **Day 6-7:** Phase 3 - Complete API
- **Day 8-10:** Phase 4 - Frontend components & pages

### Week 3: Frontend & Integration
- **Day 11-13:** Phase 4 - Complete frontend
- **Day 14-15:** Phase 5 - Integration & testing

### Week 4: Polish & Launch
- **Day 16-18:** Phase 5 - Bug fixes & testing
- **Day 19-20:** Phase 6 - Polish & deployment

---

## Next Steps

To begin implementation:

1. **Review this plan** and adjust timeline as needed
2. **Set up development environment** (Python venv, Node.js, Ollama)
3. **Initialize database** (run migrations)
4. **Start with Phase 1, Task 1.1.1** (Database connection manager)
5. **Commit frequently** to version control
6. **Test as you go** (don't wait until the end)

**Ready to start?** Begin with Phase 1! 🚀
