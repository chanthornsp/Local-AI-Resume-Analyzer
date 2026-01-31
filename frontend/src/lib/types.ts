"""
TypeScript Types for Job-Centric CV Screening System

Defines all types used across the application.
"""

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  count?: number;
}

// ============================================
// Job Types
// ============================================

export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  skills: string[];
  location?: string;
  salary_range?: string;
  status: 'active' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
  
  // Statistics (from joins)
  total_candidates: number;
  excellent_count: number;
  good_count: number;
  average_count: number;
  below_average_count: number;
  pending_count: number;
}

export interface CreateJobDto {
  title: string;
  company: string;
  description: string;
  requirements?: string[];
  skills?: string[];
  location?: string;
  salary_range?: string;
}

export interface UpdateJobDto extends CreateJobDto {
  status?: 'active' | 'closed' | 'draft';
}

export interface JobStats {
  job_id: number;
  job_title: string;
  statistics: {
    total_candidates: number;
    excellent: number;
    good: number;
    average: number;
    below_average: number;
    pending: number;
    analyzed: number;
    errors: number;
    avg_score: number | null;
  };
}

// ============================================
// Candidate Types
// ============================================

export type CandidateCategory = 'excellent' | 'good' | 'average' | 'below_average' | 'pending';
export type CandidateStatus = 'pending' | 'analyzed' | 'error';
export type Recommendation = 'SHORTLIST' | 'CONSIDER' | 'PASS' | 'PENDING';

export interface Candidate {
  id: number;
  job_id: number;
  
  // Basic info
  name: string;
  email: string | null;
  phone: string | null;
  
  // Analysis results
  score: number;
  category: CandidateCategory;
  recommendation: Recommendation;
  
  // Detailed analysis
  matched_skills: string[];
  missing_skills: string[];
  experience_years: number;
  education: {
    summary?: string;
    degree?: string;
    university?: string;
  };
  strengths: string[];
  concerns: string[];
  summary: string;
  
  // Raw data
  cv_text: string;
  original_filename: string;
  
  // Metadata
  status: CandidateStatus;
  error_message: string | null;
  created_at: string;
  analyzed_at: string | null;
}

export interface CandidateListItem {
  id: number;
  job_id: number;
  name: string;
  email: string | null;
  score: number;
  category: CandidateCategory;
  recommendation: Recommendation;
  matched_skills: string[];
  experience_years: number;
  status: CandidateStatus;
  original_filename: string;
}

export interface CandidateWithJob {
  candidate: Candidate;
  job: {
    id: number;
    title: string;
    company: string;
  } | null;
}

// ============================================
// Upload Types
// ============================================

export interface UploadResult {
  uploaded: number;
  failed: number;
  candidates: {
    id: number;
    filename: string;
    status: string;
  }[];
  errors: {
    filename: string;
    error: string;
  }[];
}

// ============================================
// Analysis Types
// ============================================

export interface AnalysisStatus {
  job_id: number;
  job_title: string;
  analysis_status: 'no_candidates' | 'pending' | 'in_progress' | 'complete';
  progress_percentage: number;
  total_candidates: number;
  analyzed: number;
  pending: number;
  errors: number;
  categories: {
    excellent: number;
    good: number;
    average: number;
    below_average: number;
  };
  average_score: number | null;
}

export interface AnalysisBatchResult {
  job_id: number;
  total: number;
  analyzed: number;
  errors: number;
  stats: JobStats['statistics'];
}

// ============================================
// System Types
// ============================================

export interface SystemStatus {
  total_jobs: number;
  total_candidates: number;
  total_analyzed: number;
  ollama: {
    available: boolean;
    host: string;
    model: string;
  };
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  services: {
    api: 'running' | 'down';
    database: 'connected' | 'disconnected';
    ollama: 'available' | 'unavailable';
  };
}

// ============================================
// UI Helper Types
// ============================================

export interface CategoryGroup {
  category: CandidateCategory;
  label: string;
  color: string;
  icon: string;
  candidates: Candidate[];
  count: number;
}

export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  category: CandidateCategory;
}

// ============================================
// Form Types
// ============================================

export interface JobFormData {
  title: string;
  company: string;
  description: string;
  requirements: string;  // Newline-separated
  skills: string;        // Comma-separated
  location: string;
  salary_range: string;
}

// ============================================
// Filter & Sort Types
// ============================================

export interface CandidateFilters {
  category?: CandidateCategory;
  status?: CandidateStatus;
  min_score?: number;
  search?: string;
}

export type SortField = 'score' | 'name' | 'created_at' | 'experience_years';
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}
