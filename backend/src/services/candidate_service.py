"""
Candidate Service

Handles all CRUD operations for candidates.
"""
import json
from typing import List, Optional, Dict, Any
from src.database.db import get_db


class CandidateService:
    """Service for managing candidates"""
    
    @staticmethod
    def create_pending(job_id: int, filename: str, cv_text: str) -> int:
        """
        Create a pending candidate record (before analysis).
        
        Args:
            job_id: ID of the job this candidate is applying for
            filename: Original filename of the CV
            cv_text: Extracted text from CV
        
        Returns:
            int: ID of created candidate
        """
        with get_db() as conn:
            cursor = conn.execute('''
                INSERT INTO candidates (
                    job_id, 
                    name, 
                    original_filename, 
                    cv_text, 
                    status,
                    category
                )
                VALUES (?, ?, ?, ?, 'pending', 'pending')
            ''', (job_id, 'Pending Analysis', filename, cv_text))
            return cursor.lastrowid
    
    @staticmethod
    def update_analysis(candidate_id: int, analysis: Dict[str, Any]) -> bool:
        """
        Update candidate with AI analysis results.
        
        Args:
            candidate_id: Candidate ID
            analysis: Dictionary with analysis results:
                - name (str)
                - email (str, optional)
                - phone (str, optional)
                - score (int, 0-100)
                - category (str)
                - recommendation (str)
                - matched_skills (list)
                - missing_skills (list)
                - experience_years (int)
                - education (dict)
                - strengths (list)
                - concerns (list)
                - summary (str)
        
        Returns:
            bool: True if updated successfully
        """
        with get_db() as conn:
            conn.execute('''
                UPDATE candidates SET
                    name = ?,
                    email = ?,
                    phone = ?,
                    score = ?,
                    category = ?,
                    recommendation = ?,
                    matched_skills = ?,
                    missing_skills = ?,
                    experience_years = ?,
                    education = ?,
                    strengths = ?,
                    concerns = ?,
                    summary = ?,
                    status = 'analyzed',
                    analyzed_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (
                analysis.get('name', 'Unknown'),
                analysis.get('email'),
                analysis.get('phone'),
                analysis.get('score', 0),
                analysis.get('category', 'below_average'),
                analysis.get('recommendation', 'PASS'),
                json.dumps(analysis.get('matched_skills', [])),
                json.dumps(analysis.get('missing_skills', [])),
                analysis.get('experience_years', 0),
                json.dumps(analysis.get('education', {})),
                json.dumps(analysis.get('strengths', [])),
                json.dumps(analysis.get('concerns', [])),
                analysis.get('summary', ''),
                candidate_id
            ))
            return True
    
    @staticmethod
    def mark_error(candidate_id: int, error_message: str) -> bool:
        """
        Mark candidate as error during analysis.
        
        Args:
            candidate_id: Candidate ID
            error_message: Error description
        
        Returns:
            bool: True if updated successfully
        """
        with get_db() as conn:
            conn.execute('''
                UPDATE candidates 
                SET status = 'error', error_message = ?
                WHERE id = ?
            ''', (error_message, candidate_id))
            return True
    
    @staticmethod
    def get_by_job(job_id: int, category: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get all candidates for a job.
        
        Args:
            job_id: Job ID
            category: Optional filter by category (excellent, good, average, below_average)
            status: Optional filter by status (pending, analyzed, error)
        
        Returns:
            List of candidate dictionaries
        """
        with get_db() as conn:
            query = 'SELECT * FROM candidates WHERE job_id = ?'
            params = [job_id]
            
            if category:
                query += ' AND category = ?'
                params.append(category)
            
            if status:
                query += ' AND status = ?'
                params.append(status)
            
            query += ' ORDER BY score DESC, created_at DESC'
            
            rows = conn.execute(query, params).fetchall()
            return [CandidateService._row_to_dict(row) for row in rows]
    
    @staticmethod
    def get_by_id(candidate_id: int) -> Optional[Dict[str, Any]]:
        """
        Get candidate by ID with full details.
        
        Args:
            candidate_id: Candidate ID
        
        Returns:
            Candidate dictionary or None if not found
        """
        with get_db() as conn:
            row = conn.execute(
                'SELECT * FROM candidates WHERE id = ?', 
                (candidate_id,)
            ).fetchone()
            return CandidateService._row_to_dict(row) if row else None
    
    @staticmethod
    def get_pending(job_id: int) -> List[Dict[str, Any]]:
        """
        Get all pending candidates for analysis.
        
        Args:
            job_id: Job ID
        
        Returns:
            List of pending candidates with minimal data
        """
        with get_db() as conn:
            rows = conn.execute('''
                SELECT id, cv_text, original_filename, job_id
                FROM candidates 
                WHERE job_id = ? AND status = 'pending'
                ORDER BY created_at ASC
            ''', (job_id,)).fetchall()
            return [dict(row) for row in rows]
    
    @staticmethod
    def delete(candidate_id: int) -> bool:
        """
        Delete a candidate.
        
        Args:
            candidate_id: Candidate ID
        
        Returns:
            bool: True if deleted successfully
        """
        with get_db() as conn:
            conn.execute('DELETE FROM candidates WHERE id = ?', (candidate_id,))
            return True
    
    @staticmethod
    def get_shortlist(job_id: int, min_score: int = 70) -> List[Dict[str, Any]]:
        """
        Get shortlisted candidates (score >= min_score).
        
        Args:
            job_id: Job ID
            min_score: Minimum score threshold (default: 70)
        
        Returns:
            List of candidate dictionaries ranked by score
        """
        with get_db() as conn:
            rows = conn.execute('''
                SELECT * FROM candidates 
                WHERE job_id = ? AND status = 'analyzed' AND score >= ?
                ORDER BY score DESC, created_at ASC
            ''', (job_id, min_score)).fetchall()
            return [CandidateService._row_to_dict(row) for row in rows]
    
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
        for field in ['matched_skills', 'missing_skills', 'strengths', 'concerns']:
            d[field] = json.loads(d.get(field) or '[]')
        
        d['education'] = json.loads(d.get('education') or '{}')
        
        return d
