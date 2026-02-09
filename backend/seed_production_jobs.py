"""
Production Testing Job Seeder

Creates 7 specific job listings with NO candidates for production testing.
Location: Cambodia
"""

import json
from datetime import datetime
import sys

# Add parent dir to path for imports
sys.path.insert(0, '.')

from src.database.db import get_db, reset_db

def seed_production_jobs():
    """Seed database with production test jobs (No candidates)"""
    
    # Optional: Reset DB first? The user said "generate job seeder", implies adding to it or fresh.
    # Usually seeders might reset. Let's ask or just append? 
    # Valid seeders usually clear or establish a base state. 
    # Given "production testing", a clean slate is often preferred. 
    # But I'll stick to just adding them to avoid destroying existing data if not intended.
    # Actually, reviewing seed_db.py, it calls reset_db(). 
    # I will NOT call reset_db() by default to be safe, or I can make it an option.
    # However, for "testing", usually you want a known state.
    # Let's just INSERT them. If the user wants a reset, they can run the full seed.
    # I will NOT reset_db() in this script to be safe.
    
    print("\n🏗️ Creating production test jobs (Cambodia Context)...\n")
    
    with get_db() as conn:
        jobs = [
            {
                'title': 'MEP Site Engineer',
                'company': 'Chip Mong Construction',
                'description': 'We are seeking a qualified MEP Site Engineer to oversee mechanical, electrical, and plumbing systems installation on our major residential and commercial projects. You will ensure work complies with standards, timeline, and budget.',
                'requirements': json.dumps([
                    'Bachelor degree in Electrical or Mechanical Engineering',
                    '3+ years experience in construction site supervision',
                    'Strong knowledge of MEP systems and standards',
                    'Proficiency in AutoCAD and MS Office',
                    'Good communication skills in Khmer and English'
                ]),
                'skills': json.dumps(['MEP Engineering', 'Site Supervision', 'AutoCAD', 'Project Management', 'Quality Control', 'Electrical Systems', 'Plumbing']),
                'location': 'Phnom Penh, Cambodia',
                'salary_range': '$800 - $1,500',
                'status': 'active'
            },
            {
                'title': 'Frontend Officer',
                'company': 'Canadia Bank',
                'description': 'Join our digital transformation team to build modern web interfaces for our banking products. You will work closely with designers and backend developers to deliver high-quality user experiences.',
                'requirements': json.dumps([
                    'Bachelor degree in Computer Science or IT',
                    '2+ years experience in frontend development',
                    'Proficiency in HTML5, CSS3, and JavaScript',
                    'Experience with React.js or Vue.js frameworks',
                    'Understanding of responsive design principles'
                ]),
                'skills': json.dumps(['HTML5', 'CSS3', 'JavaScript', 'React.js', 'Vue.js', 'Bootstrap', 'Responsive Design']),
                'location': 'Phnom Penh, Cambodia',
                'salary_range': '$600 - $1,200',
                'status': 'active'
            },
            {
                'title': 'Fullstack Developer',
                'company': 'Codingate',
                'description': 'We are looking for a versatile Fullstack Developer to join our dynamic team. You will handle both client-side and server-side development for various exciting client projects.',
                'requirements': json.dumps([
                    '3+ years of experience in web development',
                    'Strong knowledge of Node.js and React',
                    'Experience with SQL and NoSQL databases',
                    'Knowledge of RESTful APIs',
                    'Ability to work in an Agile environment'
                ]),
                'skills': json.dumps(['Node.js', 'React', 'MongoDB', 'PostgreSQL', 'Express.js', 'REST API', 'Git']),
                'location': 'Phnom Penh, Cambodia',
                'salary_range': '$1,200 - $2,500',
                'status': 'active'
            },
            {
                'title': 'Backend Developer',
                'company': 'ABA Bank',
                'description': 'ABA Bank is hiring a Backend Developer to support our core banking systems and digital platforms. You will design, develop, and maintain high-performance APIs and microservices.',
                'requirements': json.dumps([
                    'Bachelor degree in Computer Science',
                    '4+ years experience in backend development',
                    'Proficiency in Python, Java, or Go',
                    'Strong experience with Relational Databases (PostgreSQL/MySQL)',
                    'Experience with Docker and CI/CD pipelines'
                ]),
                'skills': json.dumps(['Python', 'Java', 'SQL', 'Microservices', 'Docker', 'API Design', 'System Architecture']),
                'location': 'Phnom Penh, Cambodia',
                'salary_range': '$1,000 - $2,000',
                'status': 'active'
            },
            {
                'title': 'AI Engineering',
                'company': 'KMH Technology',
                'description': 'We are seeking an AI Engineer to research and develop machine learning models for educational and industrial applications. You will work on cutting-edge AI solutions.',
                'requirements': json.dumps([
                    'Master degree in Computer Science, AI, or Math',
                    'Strong proficiency in Python and ML libraries (TensorFlow, PyTorch)',
                    'Experience with NLP or Computer Vision',
                    'Solid understanding of algorithms and data structures',
                    'Research publications are a plus'
                ]),
                'skills': json.dumps(['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Deep Learning', 'NLP', 'Computer Vision']),
                'location': 'Phnom Penh, Cambodia',
                'salary_range': '$1,500 - $3,000',
                'status': 'active'
            },
            {
                'title': 'Data Science',
                'company': 'Smart Axiata',
                'description': 'Smart Axiata is looking for a Data Scientist to analyze complex datasets and provide actionable insights. You will build predictive models to improve customer experience and business efficiency.',
                'requirements': json.dumps([
                    'Degree in Data Science, Statistics, or Mathematics',
                    'Proficiency in Python or R for data skills',
                    'Experience with SQL and data visualization tools (Tableau/PowerBI)',
                    'Knowledge of statistical modeling techniques',
                    'Strong business acumen'
                ]),
                'skills': json.dumps(['Python', 'Data Analysis', 'SQL', 'Statistics', 'Tableau', 'Scikit-learn', 'Pandas']),
                'location': 'Phnom Penh, Cambodia',
                'salary_range': '$1,200 - $2,500',
                'status': 'active'
            },
            {
                'title': 'Mobile Development',
                'company': 'Morakot Technology',
                'description': 'We need a Mobile Developer to build and maintain high-quality mobile applications for financial services. You will work with cross-functional teams to define and ship new features.',
                'requirements': json.dumps([
                    'Experience with Flutter or React Native',
                    'Knowledge of iOS and/or Android native development concepts',
                    'Experience with third-party libraries and APIs',
                    'Understanding of mobile design principles',
                    'Published apps on App Store or Play Store'
                ]),
                'skills': json.dumps(['Flutter', 'React Native', 'iOS', 'Android', 'Dart', 'Mobile UI/UX', 'API Integration']),
                'location': 'Phnom Penh, Cambodia',
                'salary_range': '$800 - $1,800',
                'status': 'active'
            }
        ]
        
        created_count = 0
        for job in jobs:
            conn.execute('''
                INSERT INTO jobs (title, company, description, requirements, skills, location, salary_range, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                job['title'], job['company'], job['description'],
                job['requirements'], job['skills'], job['location'],
                job['salary_range'], job['status'], 
                datetime.now().isoformat(), datetime.now().isoformat()
            ))
            created_count += 1
            print(f"✅ Created job: {job['title']}")
            
    print("\n" + "=" * 50)
    print("🎉 Production test jobs seeded successfully!")
    print("=" * 50)
    print(f"📊 Total jobs created: {created_count}")
    print("✨ Ready to test")

if __name__ == "__main__":
    seed_production_jobs()
