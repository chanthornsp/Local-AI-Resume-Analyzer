"""
Database Seed Script

Creates sample jobs and candidates for testing and demo purposes.
Run: python seed_db.py
"""

import json
from datetime import datetime, timedelta
import random

# Add parent dir to path for imports
import sys
sys.path.insert(0, '.')

from src.database.db import get_db, init_db, reset_db


def seed_database():
    """Seed database with sample data"""
    
    # Reset and initialize
    reset_db()
    
    print("\n🌱 Seeding database with sample data...\n")
    
    with get_db() as conn:
        # ============================================
        # Sample Jobs
        # ============================================
        
        jobs = [
            {
                'title': 'Senior React Developer',
                'company': 'TechVision Inc.',
                'description': 'We are looking for an experienced React developer to join our frontend team. You will be building modern, responsive web applications using React, TypeScript, and related technologies.',
                'requirements': json.dumps([
                    '5+ years of React experience',
                    'Strong TypeScript proficiency',
                    'Experience with state management (Redux, Zustand)',
                    'Unit testing with Jest and React Testing Library',
                    'REST API integration experience',
                    'Git version control'
                ]),
                'skills': json.dumps(['React', 'TypeScript', 'Redux', 'Jest', 'REST API', 'Git', 'CSS', 'HTML']),
                'location': 'San Francisco, CA (Hybrid)',
                'salary_range': '$140,000 - $180,000',
                'status': 'active',
                'created_at': (datetime.now() - timedelta(days=5)).isoformat(),
                'updated_at': datetime.now().isoformat()
            },
            {
                'title': 'Python Backend Engineer',
                'company': 'DataFlow Systems',
                'description': 'Join our backend team to build scalable APIs and data pipelines. We work with Python, FastAPI, PostgreSQL, and cloud services.',
                'requirements': json.dumps([
                    '4+ years Python development',
                    'Experience with FastAPI or Flask',
                    'PostgreSQL and SQL knowledge',
                    'Docker and containerization',
                    'AWS or GCP experience',
                    'Understanding of microservices architecture'
                ]),
                'skills': json.dumps(['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'REST API', 'Redis']),
                'location': 'New York, NY (Remote)',
                'salary_range': '$130,000 - $160,000',
                'status': 'active',
                'created_at': (datetime.now() - timedelta(days=10)).isoformat(),
                'updated_at': datetime.now().isoformat()
            },
            {
                'title': 'Full Stack Developer',
                'company': 'StartupXYZ',
                'description': 'Fast-growing startup looking for a versatile full stack developer who can work on both frontend and backend. We use React, Node.js, and MongoDB.',
                'requirements': json.dumps([
                    '3+ years full stack experience',
                    'React and Node.js proficiency',
                    'MongoDB or similar NoSQL database',
                    'GraphQL experience is a plus',
                    'Startup mentality - move fast and iterate',
                    'Good communication skills'
                ]),
                'skills': json.dumps(['React', 'Node.js', 'MongoDB', 'GraphQL', 'JavaScript', 'Express', 'Tailwind CSS']),
                'location': 'Austin, TX (On-site)',
                'salary_range': '$100,000 - $140,000',
                'status': 'active',
                'created_at': (datetime.now() - timedelta(days=2)).isoformat(),
                'updated_at': datetime.now().isoformat()
            }
        ]
        
        job_ids = []
        for job in jobs:
            cursor = conn.execute('''
                INSERT INTO jobs (title, company, description, requirements, skills, location, salary_range, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                job['title'], job['company'], job['description'],
                job['requirements'], job['skills'], job['location'],
                job['salary_range'], job['status'], job['created_at'], job['updated_at']
            ))
            job_ids.append(cursor.lastrowid)
            print(f"✅ Created job: {job['title']} at {job['company']}")
        
        # ============================================
        # Sample Candidates for Job 1 (React Developer)
        # ============================================
        
        candidates_job1 = [
            {
                'name': 'Alice Johnson',
                'email': 'alice.johnson@email.com',
                'phone': '+1-555-123-4567',
                'score': 92,
                'category': 'excellent',
                'recommendation': 'SHORTLIST',
                'matched_skills': json.dumps(['React', 'TypeScript', 'Redux', 'Jest', 'Git']),
                'missing_skills': json.dumps([]),
                'experience_years': 7,
                'education': json.dumps({'summary': 'BS Computer Science, Stanford University', 'degree': 'Bachelor', 'university': 'Stanford'}),
                'strengths': json.dumps(['Outstanding React expertise with 7 years experience', 'Led frontend team at previous company', 'Strong TypeScript and testing skills']),
                'concerns': json.dumps([]),
                'summary': 'Highly experienced React developer with proven leadership skills. Perfect fit for senior role.',
                'cv_text': 'Alice Johnson - Senior React Developer...',
                'original_filename': 'alice_johnson_cv.pdf',
                'status': 'analyzed'
            },
            {
                'name': 'Bob Williams',
                'email': 'bob.williams@email.com',
                'phone': '+1-555-234-5678',
                'score': 85,
                'category': 'excellent',
                'recommendation': 'SHORTLIST',
                'matched_skills': json.dumps(['React', 'TypeScript', 'Redux', 'REST API']),
                'missing_skills': json.dumps(['Jest']),
                'experience_years': 5,
                'education': json.dumps({'summary': 'MS Software Engineering, MIT', 'degree': 'Master', 'university': 'MIT'}),
                'strengths': json.dumps(['Solid React and TypeScript experience', 'MIT graduate with strong fundamentals', 'Good problem-solving skills']),
                'concerns': json.dumps(['Limited testing experience']),
                'summary': 'Strong candidate with excellent education and good React skills. Minor gap in testing.',
                'cv_text': 'Bob Williams - Frontend Developer...',
                'original_filename': 'bob_williams_resume.pdf',
                'status': 'analyzed'
            },
            {
                'name': 'Carol Martinez',
                'email': 'carol.martinez@email.com',
                'phone': '+1-555-345-6789',
                'score': 76,
                'category': 'good',
                'recommendation': 'CONSIDER',
                'matched_skills': json.dumps(['React', 'JavaScript', 'CSS', 'Git']),
                'missing_skills': json.dumps(['TypeScript', 'Redux']),
                'experience_years': 4,
                'education': json.dumps({'summary': 'BS Information Technology, UCLA', 'degree': 'Bachelor', 'university': 'UCLA'}),
                'strengths': json.dumps(['Good React fundamentals', 'Quick learner based on career progression', 'Team player with good references']),
                'concerns': json.dumps(['No TypeScript experience', 'Needs to learn Redux']),
                'summary': 'Good candidate but needs TypeScript training. Could grow into the role.',
                'cv_text': 'Carol Martinez - Web Developer...',
                'original_filename': 'carol_martinez.pdf',
                'status': 'analyzed'
            },
            {
                'name': 'David Chen',
                'email': 'david.chen@email.com',
                'phone': '+1-555-456-7890',
                'score': 62,
                'category': 'average',
                'recommendation': 'CONSIDER',
                'matched_skills': json.dumps(['JavaScript', 'HTML', 'CSS', 'Git']),
                'missing_skills': json.dumps(['React', 'TypeScript', 'Redux']),
                'experience_years': 3,
                'education': json.dumps({'summary': 'Bootcamp Graduate, General Assembly', 'degree': 'Certificate'}),
                'strengths': json.dumps(['Eager to learn React', 'Strong portfolio projects', 'Good communication']),
                'concerns': json.dumps(['No React experience in production', 'Bootcamp background only']),
                'summary': 'Junior candidate with potential but missing key requirements for senior role.',
                'cv_text': 'David Chen - Junior Developer...',
                'original_filename': 'david_chen_cv.pdf',
                'status': 'analyzed'
            },
            {
                'name': 'Emma Thompson',
                'email': 'emma.thompson@email.com',
                'phone': '+1-555-567-8901',
                'score': 38,
                'category': 'below_average',
                'recommendation': 'PASS',
                'matched_skills': json.dumps(['HTML', 'CSS']),
                'missing_skills': json.dumps(['React', 'TypeScript', 'Redux', 'JavaScript', 'Jest']),
                'experience_years': 1,
                'education': json.dumps({'summary': 'Self-taught', 'degree': 'None'}),
                'strengths': json.dumps(['Enthusiastic about learning']),
                'concerns': json.dumps(['No React experience', 'Very junior - only 1 year experience', 'Missing most required skills']),
                'summary': 'Too junior for senior role. Missing most required technical skills.',
                'cv_text': 'Emma Thompson - Entry Level...',
                'original_filename': 'emma_t_resume.pdf',
                'status': 'analyzed'
            }
        ]
        
        for candidate in candidates_job1:
            conn.execute('''
                INSERT INTO candidates (job_id, name, email, phone, score, category, recommendation,
                    matched_skills, missing_skills, experience_years, education, strengths, concerns,
                    summary, cv_text, original_filename, status, created_at, analyzed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                job_ids[0], candidate['name'], candidate['email'], candidate['phone'],
                candidate['score'], candidate['category'], candidate['recommendation'],
                candidate['matched_skills'], candidate['missing_skills'], candidate['experience_years'],
                candidate['education'], candidate['strengths'], candidate['concerns'],
                candidate['summary'], candidate['cv_text'], candidate['original_filename'],
                candidate['status'], datetime.now().isoformat(), datetime.now().isoformat()
            ))
        print(f"✅ Added {len(candidates_job1)} candidates to '{jobs[0]['title']}'")
        
        # ============================================
        # Sample Candidates for Job 2 (Python Backend)
        # ============================================
        
        candidates_job2 = [
            {
                'name': 'Frank Anderson',
                'email': 'frank.anderson@email.com',
                'phone': '+1-555-678-9012',
                'score': 88,
                'category': 'excellent',
                'recommendation': 'SHORTLIST',
                'matched_skills': json.dumps(['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS']),
                'missing_skills': json.dumps([]),
                'experience_years': 6,
                'education': json.dumps({'summary': 'MS Computer Science, CMU', 'degree': 'Master', 'university': 'Carnegie Mellon'}),
                'strengths': json.dumps(['Expert Python developer', 'AWS certified', 'Microservices architecture experience']),
                'concerns': json.dumps([]),
                'summary': 'Excellent Python backend engineer. Strong AWS and Docker experience.',
                'cv_text': 'Frank Anderson - Senior Backend Engineer...',
                'original_filename': 'frank_anderson.pdf',
                'status': 'analyzed'
            },
            {
                'name': 'Grace Kim',
                'email': 'grace.kim@email.com',
                'phone': '+1-555-789-0123',
                'score': 73,
                'category': 'good',
                'recommendation': 'CONSIDER',
                'matched_skills': json.dumps(['Python', 'Flask', 'PostgreSQL', 'Docker']),
                'missing_skills': json.dumps(['AWS', 'FastAPI']),
                'experience_years': 4,
                'education': json.dumps({'summary': 'BS Computer Engineering, Berkeley', 'degree': 'Bachelor', 'university': 'UC Berkeley'}),
                'strengths': json.dumps(['Strong Python skills', 'Good database knowledge', 'Quick learner']),
                'concerns': json.dumps(['Flask experience, not FastAPI', 'No AWS experience']),
                'summary': 'Good candidate. Needs AWS training but has solid Python fundamentals.',
                'cv_text': 'Grace Kim - Backend Developer...',
                'original_filename': 'grace_kim_cv.pdf',
                'status': 'analyzed'
            }
        ]
        
        for candidate in candidates_job2:
            conn.execute('''
                INSERT INTO candidates (job_id, name, email, phone, score, category, recommendation,
                    matched_skills, missing_skills, experience_years, education, strengths, concerns,
                    summary, cv_text, original_filename, status, created_at, analyzed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                job_ids[1], candidate['name'], candidate['email'], candidate['phone'],
                candidate['score'], candidate['category'], candidate['recommendation'],
                candidate['matched_skills'], candidate['missing_skills'], candidate['experience_years'],
                candidate['education'], candidate['strengths'], candidate['concerns'],
                candidate['summary'], candidate['cv_text'], candidate['original_filename'],
                candidate['status'], datetime.now().isoformat(), datetime.now().isoformat()
            ))
        print(f"✅ Added {len(candidates_job2)} candidates to '{jobs[1]['title']}'")
        
        # ============================================
        # Sample Candidates for Job 3 (Full Stack)
        # ============================================
        
        candidates_job3 = [
            {
                'name': 'Henry Park',
                'email': 'henry.park@email.com',
                'phone': '+1-555-890-1234',
                'score': 81,
                'category': 'good',
                'recommendation': 'SHORTLIST',
                'matched_skills': json.dumps(['React', 'Node.js', 'MongoDB', 'JavaScript', 'Express']),
                'missing_skills': json.dumps(['GraphQL']),
                'experience_years': 4,
                'education': json.dumps({'summary': 'BS Computer Science, Georgia Tech', 'degree': 'Bachelor', 'university': 'Georgia Tech'}),
                'strengths': json.dumps(['Full stack experience with MERN', 'Startup experience', 'Self-motivated']),
                'concerns': json.dumps(['No GraphQL - would need training']),
                'summary': 'Strong full stack developer. Good fit for startup environment.',
                'cv_text': 'Henry Park - Full Stack Developer...',
                'original_filename': 'henry_park.pdf',
                'status': 'analyzed'
            }
        ]
        
        for candidate in candidates_job3:
            conn.execute('''
                INSERT INTO candidates (job_id, name, email, phone, score, category, recommendation,
                    matched_skills, missing_skills, experience_years, education, strengths, concerns,
                    summary, cv_text, original_filename, status, created_at, analyzed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                job_ids[2], candidate['name'], candidate['email'], candidate['phone'],
                candidate['score'], candidate['category'], candidate['recommendation'],
                candidate['matched_skills'], candidate['missing_skills'], candidate['experience_years'],
                candidate['education'], candidate['strengths'], candidate['concerns'],
                candidate['summary'], candidate['cv_text'], candidate['original_filename'],
                candidate['status'], datetime.now().isoformat(), datetime.now().isoformat()
            ))
        print(f"✅ Added {len(candidates_job3)} candidates to '{jobs[2]['title']}'")
        
    # ============================================
    # Summary
    # ============================================
    
    print("\n" + "=" * 50)
    print("🎉 Database seeded successfully!")
    print("=" * 50)
    print("\n📊 Summary:")
    print(f"   • Jobs created: 3")
    print(f"   • Candidates created: 8")
    print("\n📋 Jobs:")
    print(f"   1. Senior React Developer (TechVision Inc.) - 5 candidates")
    print(f"   2. Python Backend Engineer (DataFlow Systems) - 2 candidates")
    print(f"   3. Full Stack Developer (StartupXYZ) - 1 candidate")
    print("\n🏆 Candidate Categories:")
    print(f"   • Excellent (85+): 3 candidates")
    print(f"   • Good (70-84): 3 candidates")
    print(f"   • Average (50-69): 1 candidate")
    print(f"   • Below Average (<50): 1 candidate")
    print("\n✨ Ready to test at http://localhost:5173/")


if __name__ == "__main__":
    seed_database()
