"""
Job Service

Handles all CRUD operations for job listings.
"""
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from src.database.db import get_db


class JobService:
    """Service for managing job listings"""
    
    @staticmethod
    def create(data: Dict[str, Any]) -> int:
        """
        Create a new job listing.
        
        Args:
            data: Dictionary with job fields:
                - title (str, required)
                - company (str, required)
                - description (str, required)
                - requirements (list, optional)
                - skills (list, optional)
                - location (str, optional)
                - salary_range (str, optional)
        
        Returns:
            int: ID of created job
        """
        with get_db() as conn:
            cursor = conn.execute('''
                INSERT INTO jobs (title, company, description, requirements, skills, location, salary_range)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                data['title'],
                data['company'],
                data['description'],
                json.dumps(data.get('requirements', [])),
                json.dumps(data.get('skills', [])),
                data.get('location'),
                data.get('salary_range')
            ))
            return cursor.lastrowid
    
    @staticmethod
    def get_all(status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get all jobs with candidate statistics.
        
        Args:
            status: Optional filter by status (active, closed, draft)
        
        Returns:
            List of job dictionaries with candidate counts
        """
        with get_db() as conn:
            query = '''
                SELECT j.*, 
                    COUNT(c.id) as total_candidates,
                    SUM(CASE WHEN c.category = 'excellent' THEN 1 ELSE 0 END) as excellent_count,
                    SUM(CASE WHEN c.category = 'good' THEN 1 ELSE 0 END) as good_count,
                    SUM(CASE WHEN c.category = 'average' THEN 1 ELSE 0 END) as average_count,
                    SUM(CASE WHEN c.category = 'below_average' THEN 1 ELSE 0 END) as below_average_count,
                    SUM(CASE WHEN c.status = 'pending' THEN 1 ELSE 0 END) as pending_count
                FROM jobs j
                LEFT JOIN candidates c ON j.id = c.job_id
            '''
            
            if status:
                query += ' WHERE j.status = ?'
                rows = conn.execute(query + ' GROUP BY j.id ORDER BY j.created_at DESC', (status,)).fetchall()
            else:
                rows = conn.execute(query + ' GROUP BY j.id ORDER BY j.created_at DESC').fetchall()
            
            return [JobService._row_to_dict(row) for row in rows]
    
    @staticmethod
    def get_by_id(job_id: int) -> Optional[Dict[str, Any]]:
        """
        Get job by ID with full details.
        
        Args:
            job_id: Job ID
        
        Returns:
            Job dictionary or None if not found
        """
        with get_db() as conn:
            row = conn.execute('SELECT * FROM jobs WHERE id = ?', (job_id,)).fetchone()
            return JobService._row_to_dict(row) if row else None
    
    @staticmethod
    def update(job_id: int, data: Dict[str, Any]) -> bool:
        """
        Update job listing.
        
        Args:
            job_id: Job ID
            data: Dictionary with fields to update
        
        Returns:
            bool: True if updated successfully
        """
        with get_db() as conn:
            conn.execute('''
                UPDATE jobs SET 
                    title = ?, 
                    company = ?, 
                    description = ?,
                    requirements = ?, 
                    skills = ?, 
                    location = ?,
                    salary_range = ?, 
                    status = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (
                data['title'], 
                data['company'], 
                data['description'],
                json.dumps(data.get('requirements', [])),
                json.dumps(data.get('skills', [])),
                data.get('location'), 
                data.get('salary_range'),
                data.get('status', 'active'), 
                job_id
            ))
            return True
    
    @staticmethod
    def delete(job_id: int) -> bool:
        """
        Delete job and all associated candidates (CASCADE).
        
        Args:
            job_id: Job ID
        
        Returns:
            bool: True if deleted successfully
        """
        with get_db() as conn:
            conn.execute('DELETE FROM jobs WHERE id = ?', (job_id,))
            return True
    
    @staticmethod
    def get_stats(job_id: int) -> Dict[str, Any]:
        """
        Get detailed statistics for a job.
        
        Args:
            job_id: Job ID
        
        Returns:
            Dictionary with candidate statistics
        """
        with get_db() as conn:
            row = conn.execute('''
                SELECT 
                    COUNT(*) as total_candidates,
                    SUM(CASE WHEN category = 'excellent' THEN 1 ELSE 0 END) as excellent,
                    SUM(CASE WHEN category = 'good' THEN 1 ELSE 0 END) as good,
                    SUM(CASE WHEN category = 'average' THEN 1 ELSE 0 END) as average,
                    SUM(CASE WHEN category = 'below_average' THEN 1 ELSE 0 END) as below_average,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'analyzed' THEN 1 ELSE 0 END) as analyzed,
                    SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors,
                    AVG(CASE WHEN status = 'analyzed' THEN score ELSE NULL END) as avg_score
                FROM candidates
                WHERE job_id = ?
            ''', (job_id,)).fetchone()
            
            return dict(row) if row else {}
    
    @staticmethod
    def _row_to_dict(row: Any) -> Optional[Dict[str, Any]]:
        """
        Convert SQLite row to dictionary with JSON parsing.
        
        Args:
            row: SQLite row object
        
        Returns:
            Dictionary with parsed JSON fields
        """
        if not row:
            return None
        
        d = dict(row)
        
        # Parse JSON fields
        d['requirements'] = json.loads(d.get('requirements') or '[]')
        d['skills'] = json.loads(d.get('skills') or '[]')
        
        # Add default values for computed fields if they don't exist
        d.setdefault('total_candidates', 0)
        d.setdefault('excellent_count', 0)
        d.setdefault('good_count', 0)
        d.setdefault('average_count', 0)
        d.setdefault('below_average_count', 0)
        d.setdefault('pending_count', 0)
        
        return d
