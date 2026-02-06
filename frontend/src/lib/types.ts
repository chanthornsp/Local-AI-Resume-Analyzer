// Job types
export interface Job {
    id: number;
    title: string;
    company: string;
    description: string;
    requirements: string[];
    skills: string[];
    location?: string;
    salary_range?: string;
    status: JobStatus;
    created_at: string;
    updated_at: string;
    // Stats from the API
    total_candidates?: number;
    excellent_count?: number;
    good_count?: number;
    average_count?: number;
    below_average_count?: number;
}

export type JobStatus = 'active' | 'closed' | 'draft';

export interface CreateJobRequest {
    title: string;
    company: string;
    description: string;
    requirements: string[];
    skills: string[];
    location?: string;
    salary_range?: string;
}

// Candidate types
export interface Candidate {
    id: number;
    job_id: number;
    name: string;
    email?: string;
    phone?: string;
    score: number;
    category: CandidateCategory;
    recommendation: RecommendationType;
    matched_skills: string[];
    missing_skills: string[];
    experience_years: number;
    education: Education;
    strengths: string[];
    concerns: string[];
    summary: string;
    salary_estimate?: string;
    cv_text: string;
    original_filename: string;
    file_path?: string;
    status: CandidateStatus;
    error_message?: string;
    created_at: string;
    analyzed_at?: string;
}

export type CandidateCategory = 'excellent' | 'good' | 'average' | 'below_average' | 'pending';

export type CandidateStatus = 'pending' | 'analyzed' | 'error';

export type RecommendationType = 'SHORTLIST' | 'CONSIDER' | 'PASS' | 'PENDING';

export interface Education {
    degree?: string;
    field?: string;
    institution?: string;
    year?: string;
}

// Analysis types
export interface AnalysisProgress {
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
    average_score?: number;
    // Legacy aliases for backward compatibility
    total?: number;
    is_complete?: boolean;
    by_category?: {
        excellent: number;
        good: number;
        average: number;
        below_average: number;
    };
}

// Upload types
export interface UploadResponse {
    uploaded: number;
    failed: number;
    candidates: Array<{
        id: number;
        filename: string;
        status: string;
    }>;
    errors: Array<{
        filename: string;
        error: string;
    }>;
}

// API response types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

// Stats types
export interface JobStats {
    total_candidates: number;
    analyzed: number;
    pending: number;
    categories: {
        excellent: number;
        good: number;
        average: number;
        below_average: number;
    };
}
