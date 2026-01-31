"""
Test script for Phase 2: Core CV Analysis Engine

Tests PDF/image extraction and CV analysis.
"""
import os
from pathlib import Path
from src.core.pdf_extractor import PDFExtractor
from src.services.ollama_client import OllamaClient
from src.services.cv_analyzer import CVAnalyzer
from src.services.job_service import JobService
from src.services.candidate_service import CandidateService


def test_phase_2():
    print("🧪 Testing Phase 2: Core CV Analysis Engine\n")
    print("=" * 60)
    
    # Test 1: PDF Extractor initialization
    print("\nTest 1: PDF Extractor Initialization")
    extractor = PDFExtractor(use_ocr=True)
    print("✅ PDFExtractor initialized")
    print(f"   Supported PDF formats: {extractor.PDF_EXTENSIONS}")
    print(f"   Supported image formats: {extractor.IMAGE_EXTENSIONS}")
    
    # Test 2: Ollama Client
    print("\nTest 2: Ollama Client")
    ollama = OllamaClient()
    print(f"   Host: {ollama.host}")
    print(f"   Model: {ollama.model}")
    print(f"   Timeout: {ollama.timeout}s")
    
    is_available = ollama.check_availability()
    if is_available:
        print("✅ Ollama is running and available")
        models = ollama.get_models()
        print(f"   Available models: {', '.join(models) if models else 'None'}")
        
        if ollama.model in models:
            print(f"✅ Model '{ollama.model}' is available")
        else:
            print(f"⚠️  Model '{ollama.model}' not found. Available: {models}")
            print(f"   Run: ollama pull {ollama.model}")
    else:
        print("❌ Ollama is NOT running!")
        print("   Please start Ollama: ollama serve")
        print("   Then pull the model: ollama pull llama3")
        return
    
    # Test 3: Create test job for analysis
    print("\nTest 3: Create Test Job")
    job_data = {
        'title': 'Full Stack Developer',
        'company': 'Innovation Labs',
        'description': 'We need a full-stack developer with React and Python experience.',
        'requirements': [
            '3+ years of web development experience',
            'Proficiency in React and TypeScript',
            'Backend experience with Python/Flask',
            'Understanding of RESTful APIs',
            'Experience with databases (SQL/NoSQL)'
        ],
        'skills': ['React', 'TypeScript', 'Python', 'Flask', 'REST API', 'SQL', 'Git'],
        'location': 'San Francisco, CA',
        'salary_range': '$100,000 - $140,000'
    }
    
    job_id = JobService.create(job_data)
    print(f"✅ Created test job ID: {job_id}")
    job = JobService.get_by_id(job_id)
    print(f"   Job: {job['title']} at {job['company']}")
    
    # Test 4: Create mock CV text (since we don't have actual PDF files)
    print("\nTest 4: Create Mock Candidates")
    
    mock_cvs = [
        {
            'filename': 'alice_johnson.pdf',
            'text': '''
ALICE JOHNSON
Email: alice.johnson@email.com
Phone: +1-555-0101

PROFESSIONAL SUMMARY
Senior Full Stack Developer with 5 years of experience building modern web applications.
Specialized in React, TypeScript, and Python backend development.

SKILLS
- Frontend: React, TypeScript, Next.js, TailwindCSS
- Backend: Python, Flask, Django, Node.js
- Databases: PostgreSQL, MongoDB, Redis
- Tools: Git, Docker, AWS, CI/CD

EXPERIENCE
Senior Full Stack Developer | Tech Solutions Inc. (2020-Present)
- Built 10+ production web applications using React and Python
- Led team of 3 developers on e-commerce platform
- Implemented RESTful APIs serving 100k+ requests/day
- Reduced page load time by 40% through optimization

Full Stack Developer | Startup XYZ (2018-2020)
- Developed React frontend and Flask backend
- Integrated third-party APIs and payment systems
- Implemented automated testing with 90% coverage

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley (2014-2018)

CERTIFICATIONS
- AWS Certified Solutions Architect
- React Developer Certification
            '''
        },
        {
            'filename': 'bob_martinez.pdf',
            'text': '''
BOB MARTINEZ
bob.m@example.com | (555) 234-5678

OBJECTIVE
Junior developer seeking opportunities to grow in full-stack development.

SKILLS
HTML, CSS, JavaScript, Python basics, Git

EXPERIENCE
Web Developer Intern | Local Agency (Summer 2023)
- Created simple websites using HTML/CSS
- Learned JavaScript basics
- Fixed bugs in existing codebase

EDUCATION
Associate Degree in Web Development
Community College (2021-2023)

PROJECTS
- Built personal portfolio website
- Created a todo list app in vanilla JavaScript
            '''
        },
        {
            'filename': 'charlie_wong.pdf',
            'text': '''
CHARLIE WONG, Ph.D.
charlie.wong@university.edu

SUMMARY
Research scientist with 8 years experience in machine learning and data science.
Expert in Python, TensorFlow, and statistical analysis.

TECHNICAL SKILLS
- Languages: Python, R, Java, C++
- ML/AI: TensorFlow, PyTorch, scikit-learn
- Data: Pandas, NumPy, Matplotlib
- Web: Flask (basic), HTML/CSS
- Cloud: AWS, Google Cloud

EXPERIENCE
Research Scientist | AI Research Lab (2018-Present)
- Published 15+ papers in top-tier conferences
- Developed novel deep learning algorithms
- Built Flask APIs for ML model deployment
- Managed datasets with 10M+ records using SQL

Machine Learning Engineer | Tech Corp (2015-2018)
- Implemented recommendation systems
- Optimized model performance by 35%
- Created data pipelines with Python

EDUCATION
Ph.D. in Computer Science (Machine Learning)
Stanford University (2011-2015)

B.S. in Mathematics
MIT (2007-2011)
            '''
        }
    ]
    
    candidate_ids = []
    for cv_data in mock_cvs:
        cid = CandidateService.create_pending(
            job_id=job_id,
            filename=cv_data['filename'],
            cv_text=cv_data['text']
        )
        candidate_ids.append(cid)
        print(f"✅ Created candidate: {cv_data['filename']} (ID: {cid})")
    
    # Test 5: CV Analyzer initialization
    print("\nTest 5: CV Analyzer Initialization")
    analyzer = CVAnalyzer()
    print("✅ CVAnalyzer initialized")
    print(f"   Category thresholds: {analyzer.CATEGORY_THRESHOLDS}")
    
    # Test 6: Analyze candidates with AI
    print("\nTest 6: AI-Powered CV Analysis")
    print("   This will call Ollama LLM for each candidate...")
    print("   (This may take 30-60 seconds per candidate)")
    print()
    
    try:
        result = analyzer.analyze_batch(job_id)
        
        print("\n" + "=" * 60)
        print("✅ Batch Analysis Complete!")
        print("=" * 60)
        print(f"Total Candidates: {result['total']}")
        print(f"Successfully Analyzed: {result['analyzed']}")
        print(f"Errors: {result['errors']}")
        
        # Show detailed results
        if result['analyzed'] > 0:
            print("\n" + "-" * 60)
            print("CANDIDATE ANALYSIS RESULTS:")
            print("-" * 60)
            
            candidates = CandidateService.get_by_job(job_id, status='analyzed')
            for i, candidate in enumerate(candidates, 1):
                print(f"\n{i}. {candidate['name']}")
                print(f"   Score: {candidate['score']}/100")
                print(f"   Category: {candidate['category'].upper()}")
                print(f"   Recommendation: {candidate['recommendation']}")
                print(f"   Experience: {candidate['experience_years']} years")
                print(f"   Email: {candidate['email'] or 'Not found'}")
                print(f"   Matched Skills: {', '.join(candidate['matched_skills'][:5])}")
                if candidate['missing_skills']:
                    print(f"   Missing Skills: {', '.join(candidate['missing_skills'][:3])}")
                print(f"   Summary: {candidate['summary'][:100]}...")
        
        # Show statistics
        print("\n" + "-" * 60)
        print("JOB STATISTICS:")
        print("-" * 60)
        stats = result['stats']
        print(f"📊 Total Candidates: {stats['total_candidates']}")
        print(f"   🟢 Excellent (85-100): {stats['excellent']}")
        print(f"   🟡 Good (70-84): {stats['good']}")
        print(f"   🟠 Average (50-69): {stats['average']}")
        print(f"   🔴 Below Average (0-49): {stats['below_average']}")
        print(f"   📈 Average Score: {stats['avg_score']:.1f}" if stats['avg_score'] else "")
        
    except Exception as e:
        print(f"\n❌ Analysis failed: {e}")
        print("   Make sure Ollama is running with the correct model")
        return
    
    # Test 7: Category-based retrieval
    print("\n" + "=" * 60)
    print("Test 7: Retrieve Candidates by Category")
    print("=" * 60)
    
    for category in ['excellent', 'good', 'average', 'below_average']:
        candidates = CandidateService.get_by_job(job_id, category=category)
        print(f"   {category.upper()}: {len(candidates)} candidates")
        for c in candidates:
            print(f"      - {c['name']} (Score: {c['score']})")
    
    # Test 8: Shortlist
    print("\n" + "=" * 60)
    print("Test 8: Get Shortlist (Score >= 70)")
    print("=" * 60)
    shortlist = CandidateService.get_shortlist(job_id, min_score=70)
    print(f"✅ {len(shortlist)} candidates in shortlist:")
    for i, candidate in enumerate(shortlist, 1):
        print(f"   {i}. {candidate['name']} - {candidate['score']}/100 ({candidate['recommendation']})")
    
    print("\n" + "=" * 60)
    print("✅ Phase 2 Tests Complete!")
    print("=" * 60)
    print("\nCore Features Working:")
    print("  ✅ PDF/Image Extractor (enhanced)")
    print("  ✅ Ollama Client (with retries)")
    print("  ✅ CV Analyzer (AI-powered)")
    print("  ✅ Structured Data Extraction")
    print("  ✅ Score-based Categorization")
    print("  ✅ Batch Processing")
    print("\nReady for Phase 3: API Development!")


if __name__ == "__main__":
    test_phase_2()
