# Implementation Plan: Local AI CV Screener for Recruiters

## Overview

This document provides the complete technical implementation for a local, privacy-focused CV screening tool for recruiters. Built with Python/Flask backend and React/TailwindCSS/Shadcn-ui frontend, using Ollama for local LLM inference.

**Project Objectives:**

| Objective          | Target   | Metric                               |
| ------------------ | -------- | ------------------------------------ |
| Screening Accuracy | >85%     | Match with human recruiter decisions |
| Processing Speed   | <30s/CV  | End-to-end analysis per CV           |
| Batch Processing   | 50+ CVs  | Single batch capacity                |
| User Satisfaction  | ≥4.0/5.0 | Post-screening recruiter survey      |

---

# Part 1: Project Structure

## 1.1 Full Application Layout

```
Local-AI-Resume-Analyzer/
├── backend/
│   ├── app.py                      # Flask application entry point
│   ├── cli.py                      # CLI interface
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Environment config template
│   ├── src/
│   │   ├── __init__.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── pdf_extractor.py    # PDF → Text extraction
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ollama_client.py    # Ollama LLM interface
│   │   │   ├── cv_screener.py      # CV screening engine
│   │   │   ├── batch_processor.py  # Batch processing
│   │   │   ├── score_calculator.py # Score calculation
│   │   │   └── group_manager.py    # Score grouping
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py           # Flask routes
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── candidate.py        # Candidate data model
│   │   │   └── job.py              # Job data model
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── config.py           # Configuration
│   │       └── export.py           # CSV/Excel export
│   ├── storage/
│   │   └── screenings.db           # SQLite storage
│   ├── uploads/                    # Temp files (ignored)
│   └── tests/
│       ├── __init__.py
│       ├── test_batch_processor.py
│       ├── test_screener.py
│       └── test_api.py
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # Shadcn/ui components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   └── toast.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── screening/
│   │   │   │   ├── CVUploader.tsx
│   │   │   │   ├── JobForm.tsx
│   │   │   │   ├── ProgressTracker.tsx
│   │   │   │   └── ResultsSummary.tsx
│   │   │   ├── candidates/
│   │   │   │   ├── CandidateCard.tsx
│   │   │   │   ├── CandidateList.tsx
│   │   │   │   ├── CandidateDetail.tsx
│   │   │   │   └── ScoreGroup.tsx
│   │   │   └── export/
│   │   │       ├── ExportDialog.tsx
│   │   │       └── ShortlistTable.tsx
│   │   ├── hooks/
│   │   │   ├── useScreening.ts
│   │   │   ├── useCandidates.ts
│   │   │   └── useExport.ts
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── utils.ts
│   │   │   └── types.ts
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── NewScreening.tsx
│   │   │   ├── Results.tsx
│   │   │   └── Settings.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── components.json            # Shadcn config
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
└── README.md
```

## 1.2 Technology Stack

### Backend

| Component        | Technology    | Version | Purpose                  |
| ---------------- | ------------- | ------- | ------------------------ |
| API Framework    | Flask         | 3.0.0   | REST API server          |
| CORS             | Flask-CORS    | 4.0.0   | Cross-origin requests    |
| PDF Extraction   | pdfplumber    | 0.10.3  | Text-based PDFs          |
| OCR              | pytesseract   | 0.3.10  | Scanned/image PDFs       |
| Image Processing | Pillow        | 10.1.0  | Image handling for OCR   |
| HTTP Client      | requests      | 2.31.0  | Ollama API calls         |
| LLM Interface    | Ollama        | -       | Local AI inference       |
| CLI              | argparse      | stdlib  | Command-line interface   |
| Data Export      | pandas        | 2.1.0   | CSV/Excel export         |
| Storage          | SQLite        | stdlib  | Results storage          |
| Config           | python-dotenv | 1.0.0   | Environment management   |
| Testing          | pytest        | 7.4.3   | Unit & integration tests |

### Frontend

| Component       | Technology        | Version | Purpose                     |
| --------------- | ----------------- | ------- | --------------------------- |
| Framework       | React             | 18.2.0  | UI component library        |
| Build Tool      | Vite              | 6.x     | Fast development & bundling |
| Language        | TypeScript        | 5.x     | Type safety                 |
| Styling         | TailwindCSS       | 4.x     | Utility-first CSS           |
| Tailwind Plugin | @tailwindcss/vite | 4.x     | Vite integration            |
| UI Components   | Shadcn/ui         | latest  | Accessible component system |
| State           | React Query       | 5.x     | Server state management     |
| Forms           | React Hook Form   | 7.x     | Form handling               |
| Validation      | Zod               | 3.x     | Schema validation           |
| Icons           | Lucide React      | latest  | Beautiful icon set          |
| Router          | React Router DOM  | 7.x     | Client-side routing         |
| File Upload     | react-dropzone    | 14.x    | Drag & drop uploads         |

---

# Part 2: Backend Implementation

## 2.1 Flask Application

**File:** `backend/app.py`

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv

from src.services.batch_processor import BatchProcessor
from src.services.cv_screener import CVScreener
from src.utils.config import Config

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])
app.config.from_object(Config)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Server is running'})

@app.route('/api/status', methods=['GET'])
def status_check():
    """Check Ollama connection"""
    from src.services.ollama_client import OllamaClient
    client = OllamaClient()

    try:
        is_available = client.check_availability()
        return jsonify({
            'status': 'ok' if is_available else 'error',
            'ollama_available': is_available,
            'model': os.getenv('OLLAMA_MODEL', 'llama3')
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/screen', methods=['POST'])
def screen_candidates():
    """Screen batch of CVs against job requirements"""
    try:
        files = request.files.getlist('cv_files')
        job_title = request.form.get('job_title')
        job_description = request.form.get('job_description')
        job_requirements = request.form.getlist('job_requirements')
        company_name = request.form.get('company_name')

        if not all([files, job_title, job_description, company_name]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Save files temporarily
        file_paths = []
        for file in files:
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            file_paths.append(filepath)

        try:
            # Process batch
            processor = BatchProcessor()
            results = processor.process_batch(
                file_paths=file_paths,
                job_title=job_title,
                job_description=job_description,
                job_requirements=job_requirements,
                company_name=company_name
            )

            return jsonify({
                'status': 'success',
                'data': results
            })
        finally:
            # Cleanup temp files
            for fp in file_paths:
                if os.path.exists(fp):
                    os.remove(fp)

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/applications/<job_id>', methods=['GET'])
def get_applications(job_id):
    """Get saved applications for a job"""
    # Implementation for retrieving stored results
    pass

@app.route('/api/export/<job_id>', methods=['GET'])
def export_results(job_id):
    """Export results as CSV/Excel"""
    format_type = request.args.get('format', 'csv')
    # Implementation for export
    pass

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
```

## 2.2 PDF Extraction Service

**File:** `backend/src/core/pdf_extractor.py`

```python
import pdfplumber
import pytesseract
from PIL import Image
import re
from typing import Optional

class PDFExtractor:
    """Extract text from PDF files using pdfplumber and pytesseract (OCR fallback)"""

    def __init__(self, use_ocr: bool = True):
        self.use_ocr = use_ocr

    def extract_text(self, pdf_path: str) -> str:
        """
        Extract text from PDF file

        Args:
            pdf_path: Path to PDF file

        Returns:
            Extracted text as string

        Raises:
            ValueError: If text extraction fails or insufficient text
        """
        try:
            # Try pdfplumber first (for text-based PDFs)
            text = self._extract_with_pdfplumber(pdf_path)

            # If insufficient text and OCR enabled, try OCR
            if len(text.strip()) < 100 and self.use_ocr:
                text = self._extract_with_ocr(pdf_path)

            # Clean and validate
            text = self._clean_text(text)

            if len(text.strip()) < 100:
                raise ValueError(
                    "Insufficient text extracted. PDF may be image-based or empty."
                )

            return text

        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    def _extract_with_pdfplumber(self, pdf_path: str) -> str:
        """Extract text using pdfplumber"""
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        return text

    def _extract_with_ocr(self, pdf_path: str) -> str:
        """Extract text using OCR (pytesseract)"""
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    img = page.to_image()
                    page_text = pytesseract.image_to_string(img.original)
                    if page_text:
                        text += page_text + "\n\n"
        except Exception as e:
            print(f"OCR extraction failed: {e}")
        return text

    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'[^\x20-\x7E\n]', '', text)
        return text.strip()
```

## 2.3 Batch Processor Service

**File:** `backend/src/services/batch_processor.py`

```python
from typing import List, Dict
import time
from src.core.pdf_extractor import PDFExtractor
from src.services.cv_screener import CVScreener
from src.services.group_manager import GroupManager

class BatchProcessor:
    """Process multiple CV files in batch"""

    def __init__(self):
        self.extractor = PDFExtractor()
        self.screener = CVScreener()
        self.grouper = GroupManager()

    def process_batch(
        self,
        file_paths: List[str],
        job_title: str,
        job_description: str,
        job_requirements: List[str],
        company_name: str
    ) -> Dict:
        """Process multiple CVs and return grouped results"""

        start_time = time.time()
        candidates = []

        for filepath in file_paths:
            try:
                # Extract text from CV
                cv_text = self.extractor.extract_text(filepath)

                # Screen candidate against job requirements
                result = self.screener.screen(
                    cv_text=cv_text,
                    job_title=job_title,
                    job_description=job_description,
                    job_requirements=job_requirements,
                    company_name=company_name
                )
                result['file'] = filepath.split('/')[-1]
                result['status'] = 'success'
                candidates.append(result)

            except Exception as e:
                candidates.append({
                    'file': filepath.split('/')[-1],
                    'status': 'error',
                    'error': str(e)
                })

        # Group candidates by score
        grouped = self.grouper.group_candidates(candidates)

        # Generate ranked shortlist
        shortlist = self.grouper.generate_shortlist(candidates)

        # Calculate analytics
        analytics = self._calculate_analytics(candidates, start_time)

        return {
            'job_info': {
                'title': job_title,
                'company': company_name,
                'total_applicants': len(candidates)
            },
            'score_groups': grouped,
            'shortlist': shortlist,
            'analytics': analytics
        }

    def _calculate_analytics(self, candidates: List[Dict], start_time: float) -> Dict:
        """Calculate batch analytics"""
        successful = [c for c in candidates if c.get('status') == 'success']
        scores = [c['score'] for c in successful]

        # Collect all matched/missing keywords
        all_matched = []
        all_missing = []
        for c in successful:
            all_matched.extend(c.get('matched_keywords', []))
            all_missing.extend(c.get('missing_keywords', []))

        # Count keyword frequencies
        from collections import Counter
        matched_counts = Counter(all_matched)
        missing_counts = Counter(all_missing)

        return {
            'average_score': sum(scores) / len(scores) if scores else 0,
            'processed': len(successful),
            'errors': len(candidates) - len(successful),
            'top_matched_skills': [k for k, v in matched_counts.most_common(5)],
            'commonly_missing_skills': [k for k, v in missing_counts.most_common(5)],
            'screening_time_seconds': round(time.time() - start_time, 2)
        }
```

## 2.4 CV Screener Service

**File:** `backend/src/services/cv_screener.py`

```python
import re
from typing import Dict, List
from src.services.ollama_client import OllamaClient

class CVScreener:
    """Screen CVs against job requirements using Ollama LLM"""

    def __init__(self):
        self.ollama = OllamaClient()

    def screen(
        self,
        cv_text: str,
        job_title: str,
        job_description: str,
        job_requirements: List[str],
        company_name: str
    ) -> Dict:
        """Screen a CV against job requirements"""

        prompt = self._build_prompt(
            cv_text, job_title, job_description,
            job_requirements, company_name
        )

        response = self.ollama.generate(
            prompt=prompt,
            temperature=0.3,
            num_predict=2000
        )

        return self._parse_response(response)

    def _build_prompt(self, cv_text, job_title, job_description,
                      job_requirements, company_name) -> str:
        """Build screening prompt for LLM"""
        reqs = "\n".join(f"- {r}" for r in job_requirements)

        return f"""You are an expert HR recruiter screening candidates.
Evaluate this CV for {job_title} at {company_name}.

Job Description:
{job_description}

Required Qualifications:
{reqs}

Candidate CV:
{cv_text}

Provide screening evaluation in EXACTLY this format:
Match Score: [number 0-100]
Candidate Name: [name]
Matched Keywords: [keyword1], [keyword2], [keyword3]
Missing Keywords: [keyword1], [keyword2]
Key Strengths:
• [strength1]
• [strength2]
• [strength3]
Concerns:
• [concern1]
Experience Years: [number]
Recommendation: [SHORTLIST/CONSIDER/PASS]
Summary: [brief assessment]"""

    def _parse_response(self, response: str) -> Dict:
        """Parse LLM response into structured format"""
        score = re.search(r'Match Score:\s*(\d+)', response, re.I)
        name = re.search(r'Candidate Name:\s*(.+)', response, re.I)
        matched = re.search(r'Matched Keywords:\s*(.+)', response, re.I)
        missing = re.search(r'Missing Keywords:\s*(.+)', response, re.I)
        exp = re.search(r'Experience Years:\s*(\d+)', response, re.I)
        rec = re.search(r'Recommendation:\s*(SHORTLIST|CONSIDER|PASS)', response, re.I)
        summary = re.search(r'Summary:\s*(.+?)(?:\n\n|$)', response, re.I | re.DOTALL)

        # Extract strengths
        strengths = []
        strengths_match = re.search(r'Key Strengths:\s*\n((?:•[^\n]+\n?)+)', response, re.I)
        if strengths_match:
            strengths = [s.strip('• ').strip() for s in strengths_match.group(1).split('\n') if s.strip()]

        # Extract concerns
        concerns = []
        concerns_match = re.search(r'Concerns:\s*\n((?:•[^\n]+\n?)+)', response, re.I)
        if concerns_match:
            concerns = [c.strip('• ').strip() for c in concerns_match.group(1).split('\n') if c.strip()]

        return {
            'score': int(score.group(1)) if score else 0,
            'name': name.group(1).strip() if name else 'Unknown',
            'matched_keywords': [k.strip() for k in matched.group(1).split(',')] if matched else [],
            'missing_keywords': [k.strip() for k in missing.group(1).split(',')] if missing else [],
            'strengths': strengths,
            'concerns': concerns,
            'experience_years': int(exp.group(1)) if exp else 0,
            'recommendation': rec.group(1) if rec else 'PASS',
            'summary': summary.group(1).strip() if summary else ''
        }
```

## 2.5 Group Manager Service

**File:** `backend/src/services/group_manager.py`

```python
from typing import List, Dict

class GroupManager:
    """Manage score-based candidate grouping"""

    DEFAULT_THRESHOLDS = {
        'excellent': {'min': 85, 'max': 100},
        'good': {'min': 70, 'max': 84},
        'average': {'min': 50, 'max': 69},
        'below_average': {'min': 0, 'max': 49}
    }

    def __init__(self, thresholds: Dict = None):
        self.thresholds = thresholds or self.DEFAULT_THRESHOLDS

    def group_candidates(self, candidates: List[Dict]) -> Dict:
        """Group candidates by score ranges"""
        groups = {
            k: {
                'range': f"{v['min']}-{v['max']}",
                'count': 0,
                'candidates': []
            }
            for k, v in self.thresholds.items()
        }

        for candidate in candidates:
            if candidate.get('status') != 'success':
                continue
            score = candidate.get('score', 0)
            group = self._get_group(score)
            groups[group]['count'] += 1
            groups[group]['candidates'].append(candidate)

        # Sort candidates within each group by score descending
        for group in groups.values():
            group['candidates'].sort(key=lambda x: x['score'], reverse=True)

        return groups

    def _get_group(self, score: int) -> str:
        """Determine which group a score belongs to"""
        for name, threshold in self.thresholds.items():
            if threshold['min'] <= score <= threshold['max']:
                return name
        return 'below_average'

    def generate_shortlist(self, candidates: List[Dict], min_score: int = 70) -> List[Dict]:
        """Generate ranked shortlist of top candidates"""
        valid = [
            c for c in candidates
            if c.get('status') == 'success' and c.get('score', 0) >= min_score
        ]
        valid.sort(key=lambda x: x['score'], reverse=True)

        return [
            {
                'rank': i + 1,
                'name': c['name'],
                'score': c['score'],
                'recommendation': c['recommendation'],
                'file': c['file'],
                'group': self._get_group(c['score'])
            }
            for i, c in enumerate(valid)
        ]
```

## 2.6 Ollama Client Service

**File:** `backend/src/services/ollama_client.py`

```python
import requests
import os
from typing import Optional

class OllamaClient:
    """Client for interacting with Ollama API"""

    def __init__(self, host: Optional[str] = None, model: Optional[str] = None):
        self.host = host or os.getenv('OLLAMA_HOST', 'http://localhost:11434')
        self.model = model or os.getenv('OLLAMA_MODEL', 'llama3')
        self.generate_url = f"{self.host}/api/generate"
        self.tags_url = f"{self.host}/api/tags"

    def generate(self, prompt: str, **kwargs) -> str:
        """Generate completion from Ollama"""
        payload = {
            'model': self.model,
            'prompt': prompt,
            'stream': False,
            'options': {
                'temperature': kwargs.get('temperature', 0.3),
                'top_p': kwargs.get('top_p', 0.9),
                'num_predict': kwargs.get('num_predict', 2000)
            }
        }

        try:
            response = requests.post(
                self.generate_url,
                json=payload,
                timeout=120
            )
            response.raise_for_status()
            return response.json().get('response', '')
        except requests.exceptions.RequestException as e:
            raise ConnectionError(f"Failed to connect to Ollama: {str(e)}")

    def check_availability(self) -> bool:
        """Check if Ollama is available"""
        try:
            response = requests.get(self.tags_url, timeout=5)
            return response.status_code == 200
        except:
            return False
```

## 2.7 CLI Interface

**File:** `backend/cli.py`

```python
#!/usr/bin/env python3
import argparse
import json
import glob
from src.services.batch_processor import BatchProcessor

def main():
    parser = argparse.ArgumentParser(
        description='Screen CVs for job positions using local AI'
    )
    parser.add_argument(
        '--cvs', required=True,
        help='Path pattern to CV files (e.g., ./cvs/*.pdf)'
    )
    parser.add_argument(
        '--job-title', required=True,
        help='Job title'
    )
    parser.add_argument(
        '--job-desc', required=True,
        help='Path to job description file'
    )
    parser.add_argument(
        '--requirements', required=True,
        help='Path to requirements file (one per line)'
    )
    parser.add_argument(
        '--company', required=True,
        help='Company name'
    )
    parser.add_argument(
        '--output',
        help='Output JSON file path'
    )
    parser.add_argument(
        '--min-score', type=int, default=70,
        help='Minimum score for shortlist (default: 70)'
    )

    args = parser.parse_args()

    # Get CV files
    files = glob.glob(args.cvs)
    if not files:
        print(f"No files found: {args.cvs}")
        return

    # Read job description
    with open(args.job_desc) as f:
        job_description = f.read()

    # Read requirements
    with open(args.requirements) as f:
        requirements = [line.strip() for line in f if line.strip()]

    print(f"🔍 Processing {len(files)} CVs...")
    print(f"📋 Job: {args.job_title} at {args.company}")
    print("-" * 50)

    processor = BatchProcessor()
    results = processor.process_batch(
        file_paths=files,
        job_title=args.job_title,
        job_description=job_description,
        job_requirements=requirements,
        company_name=args.company
    )

    if args.output:
        with open(args.output, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n✅ Results saved to {args.output}")

    # Print summary
    print("\n" + "=" * 60)
    print(f"📊 SCREENING RESULTS")
    print("=" * 60)
    print(f"Job: {results['job_info']['title']} at {results['job_info']['company']}")
    print(f"Total Applicants: {results['job_info']['total_applicants']}")
    print()

    # Score distribution
    print("Score Distribution:")
    for group, data in results['score_groups'].items():
        emoji = {'excellent': '🟢', 'good': '🟡', 'average': '🟠', 'below_average': '🔴'}
        print(f"  {emoji.get(group, '⚪')} {group.replace('_', ' ').title()} ({data['range']}): {data['count']} candidates")

    # Top shortlist
    print("\n" + "-" * 60)
    print("TOP SHORTLIST:")
    for c in results['shortlist'][:10]:
        print(f"  {c['rank']}. {c['name']:<20} | Score: {c['score']:>3} | {c['recommendation']}")

    # Analytics
    analytics = results['analytics']
    print("\n" + "-" * 60)
    print("ANALYTICS:")
    print(f"  • Average Score: {analytics['average_score']:.1f}%")
    print(f"  • Processed: {analytics['processed']} | Errors: {analytics['errors']}")
    print(f"  • Time: {analytics['screening_time_seconds']}s")

if __name__ == '__main__':
    main()
```

## 2.8 Backend Dependencies

**File:** `backend/requirements.txt`

```txt
# Web Framework
Flask==3.0.0
Flask-CORS==4.0.0
Werkzeug==3.0.1

# PDF Processing
pdfplumber==0.10.3
pytesseract==0.3.10
Pillow==10.1.0

# HTTP Client
requests==2.31.0

# Environment Configuration
python-dotenv==1.0.0

# Data Processing & Export
pandas==2.1.0

# Testing
pytest==7.4.3
pytest-cov==4.1.0
```

## 2.9 Environment Configuration

**File:** `backend/.env.example`

```env
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
PORT=5000

# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3

# Upload Settings
MAX_FILE_SIZE=50000000
ALLOWED_EXTENSIONS=pdf
```

---

# Part 3: Frontend Implementation

## 3.1 Package Configuration

**File:** `frontend/package.json`

```json
{
  "name": "cv-screener-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@tanstack/react-query": "^5.17.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.303.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-dropzone": "^14.2.3",
    "react-hook-form": "^7.49.2",
    "react-router-dom": "^6.21.1",
    "tailwind-merge": "^2.2.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

## 3.2 Tailwind Configuration

In Tailwind CSS v4, configuration is handled directly in CSS using the `@theme` directive. No `tailwind.config.js` is required.

See Section 3.9 for the full CSS configuration.

## 3.3 TypeScript Types

**File:** `frontend/src/lib/types.ts`

```typescript
export type ScoreGroupType = "excellent" | "good" | "average" | "below_average";

export interface Candidate {
  id: string;
  name: string;
  score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  concerns: string[];
  experience_years: number;
  recommendation: "SHORTLIST" | "CONSIDER" | "PASS";
  summary: string;
  file: string;
}

export interface ScoreGroup {
  range: string;
  count: number;
  candidates: Candidate[];
}

export interface ShortlistItem {
  rank: number;
  id: string;
  name: string;
  score: number;
  recommendation: string;
  file: string;
  group: ScoreGroupType;
}

export interface Analytics {
  average_score: number;
  processed: number;
  errors: number;
  top_matched_skills: string[];
  commonly_missing_skills: string[];
  screening_time_seconds: number;
}

export interface JobInfo {
  title: string;
  company: string;
  total_applicants: number;
}

export interface ScreeningResult {
  status: string;
  job_info: JobInfo;
  score_groups: Record<ScoreGroupType, ScoreGroup>;
  shortlist: ShortlistItem[];
  analytics: Analytics;
}

export interface ScreeningRequest {
  files: File[];
  jobTitle: string;
  jobDescription: string;
  jobRequirements: string[];
  companyName: string;
}
```

## 3.4 API Client

**File:** `frontend/src/lib/api.ts`

```typescript
import { ScreeningRequest, ScreeningResult } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function screenCandidates(
  data: ScreeningRequest,
): Promise<ScreeningResult> {
  const formData = new FormData();

  data.files.forEach((file) => formData.append("cv_files", file));
  formData.append("job_title", data.jobTitle);
  formData.append("job_description", data.jobDescription);
  data.jobRequirements.forEach((req) =>
    formData.append("job_requirements", req),
  );
  formData.append("company_name", data.companyName);

  const response = await fetch(`${API_BASE}/api/screen`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Screening failed");
  }

  const result = await response.json();
  return result.data;
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/api/health`);
  return response.json();
}

export async function checkStatus(): Promise<{
  status: string;
  ollama_available: boolean;
  model: string;
}> {
  const response = await fetch(`${API_BASE}/api/status`);
  return response.json();
}

export async function exportResults(
  jobId: string,
  format: "csv" | "excel",
): Promise<Blob> {
  const response = await fetch(
    `${API_BASE}/api/export/${jobId}?format=${format}`,
  );
  return response.blob();
}
```

## 3.5 CV Uploader Component

**File:** `frontend/src/components/screening/CVUploader.tsx`

```tsx
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CVUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}

export function CVUploader({
  onFilesSelected,
  maxFiles = 50,
}: CVUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pdfFiles = acceptedFiles.filter(
        (f) => f.type === "application/pdf",
      );
      const newFiles = [...files, ...pdfFiles].slice(0, maxFiles);
      setFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [files, maxFiles, onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const clearAll = () => {
    setFiles([]);
    onFilesSelected([]);
  };

  return (
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">
          {isDragActive ? "Drop CVs here..." : "Drag & drop CV files here"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          or click to select files (PDF only, max {maxFiles} files)
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {files.length} files selected
            </span>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear all
            </Button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
```

## 3.6 Score Group Component

**File:** `frontend/src/components/candidates/ScoreGroup.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CandidateCard } from "./CandidateCard";
import { Candidate, ScoreGroupType } from "@/lib/types";

const groupConfig: Record<
  ScoreGroupType,
  {
    label: string;
    color: string;
    bg: string;
    emoji: string;
  }
> = {
  excellent: {
    label: "Excellent",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950",
    emoji: "🟢",
  },
  good: {
    label: "Good",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    emoji: "🟡",
  },
  average: {
    label: "Average",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950",
    emoji: "🟠",
  },
  below_average: {
    label: "Below Average",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950",
    emoji: "🔴",
  },
};

interface ScoreGroupProps {
  type: ScoreGroupType;
  range: string;
  candidates: Candidate[];
  onSelect: (candidate: Candidate) => void;
}

export function ScoreGroup({
  type,
  range,
  candidates,
  onSelect,
}: ScoreGroupProps) {
  const config = groupConfig[type];

  return (
    <Card className={config.bg}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle
            className={`text-lg ${config.color} flex items-center gap-2`}
          >
            <span>{config.emoji}</span>
            {config.label}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{range}</Badge>
            <Badge>{candidates.length} candidates</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No candidates in this group
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate, index) => (
              <CandidateCard
                key={index}
                candidate={candidate}
                onClick={() => onSelect(candidate)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## 3.7 Frontend Setup Commands

### Option A: Quick Start with Shadcn (Recommended)

Create a new project with shadcn/ui pre-configured:

```bash
# Create new project with shadcn/ui (includes Vite + TailwindCSS v4)
npx shadcn@latest create

# Follow the prompts:
# - Project name: cv-screener-frontend
# - Framework: Vite + React
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes

cd cv-screener-frontend

# Add required components
npx shadcn@latest add button card dialog input progress select table tabs toast badge avatar dropdown-menu

# Install additional dependencies
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod
npm install lucide-react react-dropzone react-router-dom
```

### Option B: Manual Setup

#### Step 1: Create Vite Project

```bash
# Scaffold Vite project
npm create vite@latest cv-screener-frontend

# Select:
# - Framework: React
# - Variant: TypeScript

cd cv-screener-frontend
npm install
```

#### Step 2: Install TailwindCSS v4

Following the official guide: https://tailwindcss.com/docs/installation/using-vite

```bash
# Install TailwindCSS and the Vite plugin
npm install tailwindcss @tailwindcss/vite
```

#### Step 3: Configure Vite Plugin

**File:** `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

#### Step 4: Import Tailwind CSS

**File:** `src/index.css`

```css
@import "tailwindcss";
```

#### Step 5: Install Shadcn/ui

Following the official guide: https://ui.shadcn.com/docs/installation/vite

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Add required components
npx shadcn@latest add button card dialog input progress select table tabs toast badge avatar dropdown-menu
```

#### Step 6: Install Additional Dependencies

```bash
# State management & data fetching
npm install @tanstack/react-query

# Form handling
npm install react-hook-form @hookform/resolvers zod

# Icons
npm install lucide-react

# File upload
npm install react-dropzone

# Routing
npm install react-router-dom
```

## 3.8 Vite Configuration

**File:** `frontend/vite.config.ts`

```typescript
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

## 3.9 CSS Configuration (Tailwind v4)

**File:** `frontend/src/index.css`

```css
@import "tailwindcss";

@plugin "tailwindcss-animate";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));

  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));

  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));

  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));

  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));

  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));

  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));

  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));

  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));

  --color-chart-1: hsl(var(--chart-1));
  --color-chart-2: hsl(var(--chart-2));
  --color-chart-3: hsl(var(--chart-3));
  --color-chart-4: hsl(var(--chart-4));
  --color-chart-5: hsl(var(--chart-5));

  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);

  /* Score group colors */
  --color-excellent: hsl(142 76% 36%);
  --color-good: hsl(217 91% 60%);
  --color-average: hsl(38 92% 50%);
  --color-below: hsl(0 72% 51%);
}

/* Base Shadcn Variables */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;

    --radius: 0.5rem;

    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;

    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

# Part 4: Score Grouping System

## Default Thresholds

| Group         | Score Range | Description                              | Action                |
| ------------- | ----------- | ---------------------------------------- | --------------------- |
| **Excellent** | 85-100      | Strong matches, highly qualified         | Schedule interview    |
| **Good**      | 70-84       | Solid candidates, meet most requirements | Review and consider   |
| **Average**   | 50-69       | Meet basic requirements                  | Hold for future       |
| **Below Avg** | 0-49        | Significant gaps in qualifications       | Rejection or feedback |

## Score Calculation Weights

```python
SCORE_WEIGHTS = {
    'keyword_match': 0.30,      # Required keywords found in CV
    'experience_match': 0.25,   # Years of experience alignment
    'skills_relevance': 0.25,   # Relevance of skills to role
    'education_match': 0.10,    # Education requirements met
    'soft_skills': 0.10         # Communication, leadership, etc.
}
```

---

# Part 5: Deployment

## Quick Start - Full Stack

```bash
# 1. Clone repository
git clone <repo-url>
cd Local-AI-Resume-Analyzer

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# 3. Start Ollama (separate terminal)
ollama serve
ollama pull llama3

# 4. Run backend
python app.py  # Runs on http://localhost:5000

# 5. Frontend setup (new terminal)
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000" > .env
npm run dev  # Runs on http://localhost:5173

# 6. Open browser to http://localhost:5173
```

## CLI Usage

```bash
cd backend
python cli.py \
  --cvs "./cvs/*.pdf" \
  --job-title "Senior Software Engineer" \
  --job-desc ./job_description.txt \
  --requirements ./requirements.txt \
  --company "Tech Corp" \
  --output ./results.json
```

## API Usage

```bash
curl -X POST http://localhost:5000/api/screen \
  -F "cv_files=@cv1.pdf" \
  -F "cv_files=@cv2.pdf" \
  -F "job_title=Software Engineer" \
  -F "job_description=We are looking for..." \
  -F "job_requirements=Python" \
  -F "job_requirements=AWS" \
  -F "job_requirements=5+ years experience" \
  -F "company_name=TechCo"
```

---

# Part 6: Prerequisites

## Backend Requirements

- [ ] Python 3.8+ installed
- [ ] pip installed
- [ ] Ollama installed and running
- [ ] Llama 3 model pulled (`ollama pull llama3`)
- [ ] (Optional) Tesseract OCR for scanned PDFs
- [ ] 8GB RAM minimum
- [ ] 5GB disk space for models

## Frontend Requirements

- [ ] Node.js 18+ installed
- [ ] npm or pnpm installed
- [ ] Modern browser (Chrome, Firefox, Safari, Edge)
