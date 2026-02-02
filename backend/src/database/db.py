"""
SQLite Database Manager

Handles database connections, initialization, and schema management.
"""
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

# Database path - creates storage directory if it doesn't exist
DATABASE_PATH = Path(__file__).parent.parent.parent / 'storage' / 'app.db'


def init_db():
    """
    Initialize database with schema.
    Creates tables if they don't exist.
    Safe to call multiple times (idempotent).
    """
    DATABASE_PATH.parent.mkdir(exist_ok=True)
    
    with get_db() as conn:
        conn.executescript('''
            -- Jobs Table
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                company TEXT NOT NULL,
                description TEXT NOT NULL,
                requirements TEXT NOT NULL,  -- JSON array
                skills TEXT NOT NULL,        -- JSON array
                location TEXT,
                salary_range TEXT,
                status TEXT DEFAULT 'active', -- active, closed, draft
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Candidates Table
            CREATE TABLE IF NOT EXISTS candidates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER NOT NULL,
                
                -- Extracted Info (standardized format)
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                
                -- AI Analysis Results
                score INTEGER NOT NULL DEFAULT 0,        -- 0-100
                category TEXT NOT NULL DEFAULT 'pending', -- excellent, good, average, below_average, pending
                recommendation TEXT DEFAULT 'PENDING',    -- SHORTLIST, CONSIDER, PASS, PENDING
                
                -- Detailed Analysis (JSON)
                matched_skills TEXT,              -- JSON array
                missing_skills TEXT,              -- JSON array
                experience_years INTEGER DEFAULT 0,
                education TEXT,                   -- JSON object
                strengths TEXT,                   -- JSON array
                concerns TEXT,                    -- JSON array
                summary TEXT,
                
                -- Raw Data
                cv_text TEXT,                     -- Extracted text from CV
                original_filename TEXT,
                
                -- Metadata
                status TEXT DEFAULT 'pending',    -- pending, analyzed, error
                error_message TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                analyzed_at DATETIME,
                
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
            );
            
            -- Indexes for performance
            CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON candidates(job_id);
            CREATE INDEX IF NOT EXISTS idx_candidates_category ON candidates(category);
            CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
            CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
            CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);
        ''')
        
        # Migration: Add file_path column if not exists
        try:
            conn.execute('ALTER TABLE candidates ADD COLUMN file_path TEXT')
            print("  ✨ Added file_path column to candidates table")
        except sqlite3.OperationalError:
            pass # Column already exists
    
    print(f"✅ Database initialized at: {DATABASE_PATH}")


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """
    Get database connection with automatic commit/rollback.
    
    Usage:
        with get_db() as conn:
            conn.execute("SELECT * FROM jobs")
            
    Yields:
        sqlite3.Connection with row_factory set to Row
    """
    conn = sqlite3.connect(str(DATABASE_PATH))
    conn.row_factory = sqlite3.Row  # Allow column access by name
    conn.execute('PRAGMA foreign_keys = ON')  # Enable foreign key constraints
    
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def reset_db():
    """
    DANGER: Delete and recreate database.
    Only use in development!
    """
    if DATABASE_PATH.exists():
        DATABASE_PATH.unlink()
        print(f"🗑️  Deleted database: {DATABASE_PATH}")
    init_db()


if __name__ == "__main__":
    # Allow running this file directly to init DB
    init_db()
