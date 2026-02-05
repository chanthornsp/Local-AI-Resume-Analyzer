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
    """Seed database with sample data (Cambodia Context)"""
    
    # Reset and initialize
    reset_db()
    
    print("\n🌱 Seeding database with sample data (Cambodia Context)...\n")
    
    with get_db() as conn:
        # ============================================
        # Sample Jobs
        # ============================================
        
        jobs = [
            {
                'title': 'Senior React Developer',
                'company': 'ABA Bank',
                'description': 'We are looking for an experienced React developer to join our digital banking team in Phnom Penh. You will be building modern, responsive web applications for our internet banking platform using React, TypeScript, and related technologies.',
                'requirements': json.dumps([
                    '5+ years of React experience',
                    'Strong TypeScript proficiency',
                    'Experience with state management (Redux, Zustand)',
                    'Unit testing with Jest and React Testing Library',
                    'REST API integration experience',
                    'Experience in Fintech is a plus'
                ]),
                'skills': json.dumps(['React', 'TypeScript', 'Redux', 'Jest', 'REST API', 'Git', 'CSS', 'HTML', 'Fintech']),
                'location': 'Phnom Penh, Cambodia (On-site)',
                'salary_range': '$2,000 - $3,500',
                'status': 'active',
                'created_at': (datetime.now() - timedelta(days=5)).isoformat(),
                'updated_at': datetime.now().isoformat()
            },
            {
                'title': 'Python Backend Engineer',
                'company': 'Smart Axiata',
                'description': 'Join Smart Axiata backend team to build scalable APIs and data pipelines for our telecom services. We work with Python, FastAPI, PostgreSQL, and cloud services.',
                'requirements': json.dumps([
                    '4+ years Python development',
                    'Experience with FastAPI or Flask',
                    'PostgreSQL and SQL knowledge',
                    'Docker and containerization',
                    'AWS or GCP experience',
                    'Understanding of microservices architecture'
                ]),
                'skills': json.dumps(['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'REST API', 'Redis']),
                'location': 'Phnom Penh, Cambodia (Hybrid)',
                'salary_range': '$1,500 - $2,500',
                'status': 'active',
                'created_at': (datetime.now() - timedelta(days=10)).isoformat(),
                'updated_at': datetime.now().isoformat()
            },
            {
                'title': 'Full Stack Developer',
                'company': 'Bongloy',
                'description': 'Fast-growing fintech startup looking for a versatile full stack developer who can work on both frontend and backend. We use React, Node.js, and MongoDB.',
                'requirements': json.dumps([
                    '3+ years full stack experience',
                    'React and Node.js proficiency',
                    'MongoDB or similar NoSQL database',
                    'GraphQL experience is a plus',
                    'Startup mentality - move fast and iterate',
                    'Good communication skills in Khmer and English'
                ]),
                'skills': json.dumps(['React', 'Node.js', 'MongoDB', 'GraphQL', 'JavaScript', 'Express', 'Tailwind CSS']),
                'location': 'Phnom Penh, Cambodia (Remote)',
                'salary_range': '$1,200 - $2,000',
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
        # Sample Candidates for Job 1 (React Developer - ABA Bank)
        # ============================================
        
        candidates_job1 = [
            {
                'name': 'Sokha Chan',
                'email': 'sokha.chan@email.com',
                'phone': '+855-12-345-678',
                'score': 92,
                'category': 'excellent',
                'recommendation': 'SHORTLIST',
                'matched_skills': json.dumps(['React', 'TypeScript', 'Redux', 'Jest', 'Git']),
                'missing_skills': json.dumps([]),
                'experience_years': 7,
                'education': json.dumps({'summary': 'BS Computer Science, Royal University of Phnom Penh (RUPP)', 'degree': 'Bachelor', 'university': 'RUPP'}),
                'strengths': json.dumps(['Outstanding React expertise with 7 years experience', 'Led frontend team at previous fintech company', 'Strong TypeScript and testing skills']),
                'concerns': json.dumps([]),
                'summary': 'Highly experienced React developer with proven leadership skills. Perfect fit for senior role at ABA.',
                'cv_text': 'Sokha Chan - Senior React Developer...',
                'original_filename': 'sokha_chan_cv.pdf',
                'status': 'analyzed'
            },
            {
                'name': 'Dara Seng',
                'email': 'dara.seng@email.com',
                'phone': '+855-10-234-567',
                'score': 85,
                'category': 'excellent',
                'recommendation': 'SHORTLIST',
                'matched_skills': json.dumps(['React', 'TypeScript', 'Redux', 'REST API']),
                'missing_skills': json.dumps(['Jest']),
                'experience_years': 5,
                'education': json.dumps({'summary': 'MS Software Engineering, Institute of Technology of Cambodia (ITC)', 'degree': 'Master', 'university': 'ITC'}),
                'strengths': json.dumps(['Solid React and TypeScript experience', 'ITC graduate with strong fundamentals', 'Good problem-solving skills']),
                'concerns': json.dumps(['Limited testing experience']),
                'summary': 'Strong candidate with excellent education and good React skills. Minor gap in testing.',
                'cv_text': 'Dara Seng - Frontend Developer...',
                'original_filename': 'dara_seng_resume.pdf',
                'status': 'analyzed'
            },
            {
                'name': 'Bopha Keo',
                'email': 'bopha.keo@email.com',
                'phone': '+855-77-345-678',
                'score': 76,
                'category': 'good',
                'recommendation': 'CONSIDER',
                'matched_skills': json.dumps(['React', 'JavaScript', 'CSS', 'Git']),
                'missing_skills': json.dumps(['TypeScript', 'Redux']),
                'experience_years': 4,
                'education': json.dumps({'summary': 'BS Information Technology, Norton University', 'degree': 'Bachelor', 'university': 'Norton University'}),
                'strengths': json.dumps(['Good React fundamentals', 'Quick learner based on career progression', 'Team player with good references']),
                'concerns': json.dumps(['No TypeScript experience', 'Needs to learn Redux']),
                'summary': 'Good candidate but needs TypeScript training. Could grow into the role.',
                'cv_text': 'Bopha Keo - Web Developer...',
                'original_filename': 'bopha_keo_cv.pdf',
                'status': 'analyzed'
            },
            {
                'name': 'Visal Chea',
                'email': 'visal.chea@email.com',
                'phone': '+855-92-456-789',
                'score': 62,
                'category': 'average',
                'recommendation': 'CONSIDER',
                'matched_skills': json.dumps(['JavaScript', 'HTML', 'CSS', 'Git']),
                'missing_skills': json.dumps(['React', 'TypeScript', 'Redux']),
                'experience_years': 3,
                'education': json.dumps({'summary': 'Web Development Bootcamp, SabaiCode', 'degree': 'Certificate'}),
                'strengths': json.dumps(['Eager to learn React', 'Strong portfolio projects', 'Good communication']),
                'concerns': json.dumps(['No React experience in production', 'Bootcamp background only']),
                'summary': 'Junior candidate with potential but missing key requirements for senior role.',
                'cv_text': 'Visal Chea - Junior Developer...',
                'original_filename': 'visal_chea_cv.pdf',
                'status': 'analyzed'
            },
            {
                'name': 'Sophea Oun',
                'email': 'sophea.oun@email.com',
                'phone': '+855-88-567-890',
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
                'cv_text': 'Sophea Oun - Entry Level...',
                'original_filename': 'sophea_oun_resume.pdf',
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
        # Sample Candidates for Job 2 (Python Backend - Smart Axiata)
        # ============================================
        
        candidates_job2 = [
            {
                'name': 'Piseth Ly',
                'email': 'piseth.ly@email.com',
                'phone': '+855-69-678-901',
                'score': 88,
                'category': 'excellent',
                'recommendation': 'SHORTLIST',
                'matched_skills': json.dumps(['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS']),
                'missing_skills': json.dumps([]),
                'experience_years': 6,
                'education': json.dumps({'summary': 'MS Computer Science, Paragon International University', 'degree': 'Master', 'university': 'Paragon'}),
                'strengths': json.dumps(['Expert Python developer', 'AWS certified', 'Microservices architecture experience']),
                'concerns': json.dumps([]),
                'summary': 'Excellent Python backend engineer. Strong AWS and Docker experience.',
                'cv_text': 'Piseth Ly - Senior Backend Engineer...',
                'original_filename': 'piseth_ly.pdf',
                'status': 'analyzed'
            },
            {
                'name': 'Kalyan Nhem',
                'email': 'kalyan.nhem@email.com',
                'phone': '+855-11-789-012',
                'score': 73,
                'category': 'good',
                'recommendation': 'CONSIDER',
                'matched_skills': json.dumps(['Python', 'Flask', 'PostgreSQL', 'Docker']),
                'missing_skills': json.dumps(['AWS', 'FastAPI']),
                'experience_years': 4,
                'education': json.dumps({'summary': 'BS Computer Science, Setec Institute', 'degree': 'Bachelor', 'university': 'Setec'}),
                'strengths': json.dumps(['Strong Python skills', 'Good database knowledge', 'Quick learner']),
                'concerns': json.dumps(['Flask experience, not FastAPI', 'No AWS experience']),
                'summary': 'Good candidate. Needs AWS training but has solid Python fundamentals.',
                'cv_text': 'Kalyan Nhem - Backend Developer...',
                'original_filename': 'kalyan_nhem_cv.pdf',
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
        # Sample Candidates for Job 3 (Full Stack - Bongloy)
        # ============================================
        
        candidates_job3 = [
            {
                'name': 'Rithy Sam',
                'email': 'rithy.sam@email.com',
                'phone': '+855-93-890-123',
                'score': 81,
                'category': 'good',
                'recommendation': 'SHORTLIST',
                'matched_skills': json.dumps(['React', 'Node.js', 'MongoDB', 'JavaScript', 'Express']),
                'missing_skills': json.dumps(['GraphQL']),
                'experience_years': 4,
                'education': json.dumps({'summary': 'BS Computer Science, Royal University of Phnom Penh (RUPP)', 'degree': 'Bachelor', 'university': 'RUPP'}),
                'strengths': json.dumps(['Full stack experience with MERN', 'Startup experience', 'Self-motivated']),
                'concerns': json.dumps(['No GraphQL - would need training']),
                'summary': 'Strong full stack developer. Good fit for startup environment.',
                'cv_text': 'Rithy Sam - Full Stack Developer...',
                'original_filename': 'rithy_sam.pdf',
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
    print(f"   1. Senior React Developer (ABA Bank) - 5 candidates")
    print(f"   2. Python Backend Engineer (Smart Axiata) - 2 candidates")
    print(f"   3. Full Stack Developer (Bongloy) - 1 candidate")
    print("\n🏆 Candidate Categories:")
    print(f"   • Excellent (85+): 3 candidates")
    print(f"   • Good (70-84): 3 candidates")
    print(f"   • Average (50-69): 1 candidate")
    print(f"   • Below Average (<50): 1 candidate")
    print("\n✨ Ready to test at http://localhost:5173/")


if __name__ == "__main__":
    seed_database()
