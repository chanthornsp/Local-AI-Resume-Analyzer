# Implementation Plan: Local AI Resume Analyzer

## Overview

This document outlines the step-by-step implementation plan for building a fully local, privacy-focused resume analyzer using React, Node.js, pdf-parse, IndexedDB, and Ollama.

---

## Phase 1: Project Setup

### 1.1 Initialize Monorepo Structure

```
Local-AI-Resume-Analyzer/
├── client/                 # Vite + React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Node.js + Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   └── package.json
├── README.md
├── IMPLEMENTATION.md
└── package.json            # Root workspace config
```

### 1.2 Technology Stack

| Layer    | Technology       | Purpose                  |
| -------- | ---------------- | ------------------------ |
| Frontend | Vite + React 18  | UI framework             |
| State    | Zustand          | Global state management  |
| Storage  | IndexedDB (idb)  | Persistent local storage |
| Styling  | Tailwind CSS     | Utility-first styling    |
| Backend  | Express.js       | REST API server          |
| PDF      | pdf-parse        | Text extraction          |
| AI       | Ollama (Llama 3) | Local LLM inference      |
| Types    | TypeScript       | Type safety              |

### 1.3 Tasks

- [ ] Create root `package.json` with workspaces
- [ ] Initialize Vite React project in `client/`
- [ ] Initialize Express project in `server/`
- [ ] Configure TypeScript for both projects
- [ ] Set up Tailwind CSS in client
- [ ] Create shared types package (optional)

---

## Phase 2: Backend Implementation

### 2.1 Express Server Setup

**File:** `server/src/index.ts`

```typescript
import express from "express";
import cors from "cors";
import multer from "multer";
import { extractText } from "./services/pdfService";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// PDF text extraction endpoint
app.post("/api/extract", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const text = await extractText(req.file.buffer);
    res.json({ text, pages: text.split("\n\n").length });
  } catch (error) {
    res.status(500).json({ error: "Failed to extract text from PDF" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### 2.2 PDF Service

**File:** `server/src/services/pdfService.ts`

```typescript
import pdfParse from "pdf-parse";

export async function extractText(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}
```

### 2.3 Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "pdf-parse": "^1.1.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/multer": "^1.4.11",
    "typescript": "^5.3.0",
    "tsx": "^4.7.0"
  }
}
```

### 2.4 Tasks

- [ ] Set up Express with TypeScript
- [ ] Implement `/api/extract` endpoint with multer
- [ ] Add pdf-parse text extraction service
- [ ] Configure CORS for frontend origin
- [ ] Add error handling middleware
- [ ] Test with sample PDF files

---

## Phase 3: Frontend Implementation

### 3.1 Project Structure

```
client/src/
├── components/
│   ├── FileUpload.tsx        # PDF drag-and-drop upload
│   ├── JobForm.tsx           # Job title/description input
│   ├── AnalysisResult.tsx    # Score display and feedback
│   ├── ScoreCard.tsx         # Individual score component
│   ├── HistoryList.tsx       # Previous analyses
│   └── Layout.tsx            # App shell
├── hooks/
│   ├── useAnalysis.ts        # Analysis logic hook
│   └── useHistory.ts         # IndexedDB history hook
├── stores/
│   └── analysisStore.ts      # Zustand store
├── services/
│   ├── pdfService.ts         # Backend API calls
│   ├── ollamaService.ts      # Ollama API integration
│   └── storageService.ts     # IndexedDB operations
├── types/
│   └── index.ts              # TypeScript interfaces
├── App.tsx
└── main.tsx
```

### 3.2 Type Definitions

**File:** `client/src/types/index.ts`

```typescript
export interface AnalysisResult {
  id: string;
  timestamp: Date;
  jobTitle: string;
  company: string;
  overallScore: number;
  atsScore: number;
  toneAndStyle: CategoryScore;
  content: CategoryScore;
  structure: CategoryScore;
  skills: CategoryScore;
  tips: string[];
}

export interface CategoryScore {
  score: number;
  feedback: string;
}

export interface JobContext {
  title: string;
  company: string;
  description: string;
}

export interface AppState {
  resumeText: string | null;
  jobContext: JobContext | null;
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}
```

### 3.3 Zustand Store

**File:** `client/src/stores/analysisStore.ts`

```typescript
import { create } from "zustand";
import type { AppState, JobContext, AnalysisResult } from "../types";

interface AnalysisStore extends AppState {
  setResumeText: (text: string) => void;
  setJobContext: (context: JobContext) => void;
  setAnalysis: (result: AnalysisResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AppState = {
  resumeText: null,
  jobContext: null,
  analysis: null,
  isLoading: false,
  error: null,
};

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  ...initialState,
  setResumeText: (text) => set({ resumeText: text }),
  setJobContext: (context) => set({ jobContext: context }),
  setAnalysis: (result) => set({ analysis: result }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
```

### 3.4 IndexedDB Storage Service

**File:** `client/src/services/storageService.ts`

```typescript
import { openDB, DBSchema } from "idb";
import type { AnalysisResult } from "../types";

interface ResumeDB extends DBSchema {
  history: {
    key: string;
    value: AnalysisResult;
    indexes: { "by-date": Date };
  };
}

const DB_NAME = "resume-analyzer";
const DB_VERSION = 1;

async function getDB() {
  return openDB<ResumeDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore("history", { keyPath: "id" });
      store.createIndex("by-date", "timestamp");
    },
  });
}

export async function saveAnalysis(result: AnalysisResult): Promise<void> {
  const db = await getDB();
  await db.put("history", result);
}

export async function getHistory(): Promise<AnalysisResult[]> {
  const db = await getDB();
  return db.getAllFromIndex("history", "by-date");
}

export async function deleteAnalysis(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("history", id);
}

export async function clearHistory(): Promise<void> {
  const db = await getDB();
  await db.clear("history");
}
```

### 3.5 Ollama Service

**File:** `client/src/services/ollamaService.ts`

```typescript
import type { AnalysisResult, JobContext } from "../types";

const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "llama3";

const ANALYSIS_SCHEMA = `{
  "overallScore": number (0-100),
  "atsScore": number (0-100),
  "toneAndStyle": { "score": number, "feedback": string },
  "content": { "score": number, "feedback": string },
  "structure": { "score": number, "feedback": string },
  "skills": { "score": number, "feedback": string },
  "tips": ["string", "string", ...]
}`;

export async function analyzeResume(
  resumeText: string,
  jobContext: JobContext
): Promise<Omit<AnalysisResult, "id" | "timestamp" | "jobTitle" | "company">> {
  const prompt = `You are an expert ATS (Applicant Tracking System) consultant and resume reviewer.

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanations.

Output Schema:
${ANALYSIS_SCHEMA}

Context:
- Target Position: ${jobContext.title}
- Company: ${jobContext.company}
- Job Description: ${jobContext.description}

Task: Analyze the following resume for ATS compatibility and provide detailed feedback.

RESUME CONTENT:
${resumeText}

Remember: Return ONLY the JSON object, nothing else.`;

  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      format: "json",
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return JSON.parse(data.response);
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:11434/api/tags");
    return response.ok;
  } catch {
    return false;
  }
}
```

### 3.6 Tasks

- [ ] Set up Vite + React + TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Create type definitions
- [ ] Implement Zustand store
- [ ] Build IndexedDB storage service with `idb`
- [ ] Build Ollama API service
- [ ] Create FileUpload component with drag-and-drop
- [ ] Create JobForm component
- [ ] Create AnalysisResult display component
- [ ] Create HistoryList component
- [ ] Wire up all components in App.tsx
- [ ] Add loading states and error handling

---

## Phase 4: Integration

### 4.1 Analysis Flow

```
1. User uploads PDF
   └─► FileUpload sends to POST /api/extract
       └─► Server extracts text with pdf-parse
           └─► Returns text to frontend
               └─► Store in Zustand

2. User enters job details
   └─► JobForm updates Zustand store

3. User clicks "Analyze"
   └─► ollamaService.analyzeResume()
       └─► Ollama processes and returns JSON
           └─► Parse response
               └─► Display in AnalysisResult
                   └─► Save to IndexedDB
```

### 4.2 API Endpoints Summary

| Method | Endpoint       | Purpose               |
| ------ | -------------- | --------------------- |
| GET    | `/api/health`  | Server health check   |
| POST   | `/api/extract` | Extract text from PDF |

### 4.3 Tasks

- [ ] Connect FileUpload to backend API
- [ ] Connect JobForm to Zustand store
- [ ] Implement analyze button handler
- [ ] Handle Ollama connection errors gracefully
- [ ] Auto-save results to IndexedDB
- [ ] Load history on app start

---

## Phase 5: UI/UX Polish

### 5.1 Components Breakdown

| Component      | Features                                  |
| -------------- | ----------------------------------------- |
| FileUpload     | Drag-drop zone, file preview, validation  |
| JobForm        | Title, company, description fields        |
| AnalysisResult | Score gauges, tabbed feedback sections    |
| ScoreCard      | Circular progress, color-coded scores     |
| HistoryList    | Cards with date, job title, score summary |
| OllamaStatus   | Connection indicator badge                |

### 5.2 UI States

- **Empty:** Welcome message, upload prompt
- **Uploading:** Progress indicator
- **Ready:** Resume loaded, awaiting job details
- **Analyzing:** Spinner with "Analyzing with AI..."
- **Complete:** Full results display
- **Error:** Error message with retry option

### 5.3 Tasks

- [ ] Design responsive layout (mobile-friendly)
- [ ] Add score visualization (circular gauges)
- [ ] Implement tabbed feedback sections
- [ ] Add Ollama connection status indicator
- [ ] Add loading skeletons
- [ ] Add toast notifications for actions
- [ ] Dark mode support (optional)

---

## Phase 6: Testing

### 6.1 Test Strategy

| Type      | Tool                  | Coverage                |
| --------- | --------------------- | ----------------------- |
| Unit      | Vitest                | Services, stores, utils |
| Component | React Testing Library | UI components           |
| E2E       | Playwright            | Full user flows         |
| API       | Supertest             | Backend endpoints       |

### 6.2 Test Cases

**Backend:**

- [ ] PDF extraction returns text
- [ ] Empty file returns error
- [ ] Invalid file type rejected
- [ ] Large file handling

**Frontend:**

- [ ] File upload triggers extraction
- [ ] Form validation works
- [ ] Analysis results render correctly
- [ ] History persists across sessions
- [ ] Ollama offline shows error state

### 6.3 Tasks

- [ ] Set up Vitest for frontend
- [ ] Set up Jest for backend
- [ ] Write unit tests for services
- [ ] Write component tests
- [ ] Write E2E tests for main flow
- [ ] Add CI pipeline (optional)

---

## Phase 7: Documentation & Deployment

### 7.1 Documentation

- [ ] Update README with setup instructions
- [ ] Add API documentation
- [ ] Create user guide with screenshots
- [ ] Document Ollama setup requirements

### 7.2 Local Deployment

```bash
# Terminal 1: Start Ollama
ollama serve
# Ensure OLLAMA_ORIGINS="*" is set

# Terminal 2: Start backend
cd server && npm run dev

# Terminal 3: Start frontend
cd client && npm run dev
```

### 7.3 Docker Setup (Optional)

```yaml
# docker-compose.yml
version: "3.8"
services:
  backend:
    build: ./server
    ports:
      - "3001:3001"

  frontend:
    build: ./client
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

### 7.4 Tasks

- [ ] Write comprehensive README
- [ ] Create .env.example files
- [ ] Add Docker configuration
- [ ] Create startup scripts
- [ ] Test fresh installation process

---

## Timeline Estimate

| Phase                | Duration | Dependencies |
| -------------------- | -------- | ------------ |
| Phase 1: Setup       | 1 day    | None         |
| Phase 2: Backend     | 1 day    | Phase 1      |
| Phase 3: Frontend    | 3-4 days | Phase 1      |
| Phase 4: Integration | 1-2 days | Phase 2, 3   |
| Phase 5: UI Polish   | 2 days   | Phase 4      |
| Phase 6: Testing     | 2 days   | Phase 4      |
| Phase 7: Docs        | 1 day    | Phase 5, 6   |

**Total Estimate:** 11-13 days

---

## Quick Start Commands

```bash
# Clone and setup
git clone <repo>
cd Local-AI-Resume-Analyzer

# Install dependencies
npm install

# Start development (all services)
npm run dev

# Or start individually:
npm run dev:server   # http://localhost:3001
npm run dev:client   # http://localhost:5173

# Ensure Ollama is running
ollama serve
```

---

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or pnpm installed
- [ ] Ollama installed and running
- [ ] Llama 3 model pulled (`ollama pull llama3`)
- [ ] OLLAMA_ORIGINS environment variable set to `*`
