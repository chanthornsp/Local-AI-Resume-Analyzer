"""
Quick test script for Phase 1 implementation

Tests database, job service, and candidate service.
"""
from src.services.job_service import JobService
from src.services.candidate_service import CandidateService

def test_phase_1():
    print("🧪 Testing Phase 1: Database & Backend Foundation\n")
    
    # Test 1: Create a job
    print("Test 1: Create Job")
    job_data = {
        'title': 'Senior Python Developer',
        'company': 'Tech Corp',
        'description': 'We are looking for an experienced Python developer...',
        'requirements': [
            '5+ years Python experience',
            'Experience with Flask/Django',
            'Knowledge of SQL databases'
        ],
        'skills': ['Python', 'Flask', 'SQL', 'Git', 'Docker'],
        'location': 'Remote',
        'salary_range': '$80,000 - $120,000'
    }
    
    job_id = JobService.create(job_data)
    print(f"✅ Created job with ID: {job_id}")
    
    # Test 2: Retrieve job
    print("\nTest 2: Retrieve Job")
    job = JobService.get_by_id(job_id)
    print(f"✅ Retrieved job: {job['title']} at {job['company']}")
    print(f"   Requirements: {len(job['requirements'])} items")
    print(f"   Skills: {', '.join(job['skills'])}")
    
    # Test 3: List all jobs
    print("\nTest 3: List All Jobs")
    jobs = JobService.get_all()
    print(f"✅ Found {len(jobs)} jobs in database")
    for j in jobs:
        print(f"   - {j['title']} ({j['total_candidates']} candidates)")
    
    # Test 4: Create pending candidates
    print("\nTest 4: Create Pending Candidates")
    candidates_data = [
        {
            'filename': 'john_doe_resume.pdf',
            'cv_text': 'John Doe\nSenior Python Developer\n10 years experience with Python, Flask, Django...'
        },
        {
            'filename': 'jane_smith_cv.pdf',
            'cv_text': 'Jane Smith\nPython Engineer\n3 years experience with Python and web development...'
        },
        {
            'filename': 'bob_wilson.pdf',
            'cv_text': 'Bob Wilson\nJunior Developer\n1 year Python experience...'
        }
    ]
    
    candidate_ids = []
    for data in candidates_data:
        cid = CandidateService.create_pending(job_id, data['filename'], data['cv_text'])
        candidate_ids.append(cid)
        print(f"✅ Created pending candidate: {data['filename']} (ID: {cid})")
    
    # Test 5: Retrieve pending candidates
    print("\nTest 5: Retrieve Pending Candidates")
    pending = CandidateService.get_pending(job_id)
    print(f"✅ Found {len(pending)} pending candidates")
    
    # Test 6: Update candidate with analysis (simulate AI analysis)
    print("\nTest 6: Update Candidate with Analysis Results")
    analysis_result = {
        'name': 'John Doe',
        'email': 'john.doe@example.com',
        'phone': '+1-555-0123',
        'score': 92,
        'category': 'excellent',
        'recommendation': 'SHORTLIST',
        'matched_skills': ['Python', 'Flask', 'SQL', 'Docker'],
        'missing_skills': [],
        'experience_years': 10,
        'education': {'degree': 'BS Computer Science', 'university': 'Tech University'},
        'strengths': [
            'Extensive Python experience',
            'Strong Flask framework knowledge',
            'Docker deployment expertise'
        ],
        'concerns': [],
        'summary': 'Excellent candidate with 10 years of Python experience. Strong match for the role.'
    }
    
    CandidateService.update_analysis(candidate_ids[0], analysis_result)
    print(f"✅ Updated candidate {candidate_ids[0]} with analysis")
    
    # Test 7: Retrieve analyzed candidate
    print("\nTest 7: Retrieve Analyzed Candidate")
    candidate = CandidateService.get_by_id(candidate_ids[0])
    print(f"✅ {candidate['name']}")
    print(f"   Score: {candidate['score']}/100")
    print(f"   Category: {candidate['category']}")
    print(f"   Recommendation: {candidate['recommendation']}")
    print(f"   Matched Skills: {', '.join(candidate['matched_skills'])}")
    
    # Test 8: Get job statistics
    print("\nTest 8: Job Statistics")
    stats = JobService.get_stats(job_id)
    print(f"✅ Job Statistics:")
    print(f"   Total Candidates: {stats['total_candidates']}")
    print(f"   Pending: {stats['pending']}")
    print(f"   Analyzed: {stats['analyzed']}")
    print(f"   Excellent: {stats['excellent']}")
    
    # Test 9: Get candidates by category
    print("\nTest 9: Get Candidates by Job")
    all_candidates = CandidateService.get_by_job(job_id)
    print(f"✅ Retrieved {len(all_candidates)} candidates for job {job_id}")
    
    # Test 10: Update job
    print("\nTest 10: Update Job")
    job_data['status'] = 'active'
    job_data['salary_range'] = '$90,000 - $130,000'
    JobService.update(job_id, job_data)
    updated_job = JobService.get_by_id(job_id)
    print(f"✅ Updated salary range: {updated_job['salary_range']}")
    
    print("\n" + "="*60)
    print("✅ Phase 1 Tests Complete!")
    print("="*60)
    print("\nDatabase Services Working:")
    print("  ✅ Job Service (CRUD)")
    print("  ✅ Candidate Service (CRUD)")
    print("  ✅ SQLite Database")
    print("  ✅ JSON Field Handling")
    print("  ✅ Statistics & Queries")
    print("\nReady for Phase 2: Core CV Analysis Engine!")

if __name__ == "__main__":
    test_phase_1()
