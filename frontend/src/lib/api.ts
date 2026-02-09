import type {
    Job,
    CreateJobRequest,
    Candidate,
    AnalysisProgress,
    UploadResponse,
    JobStats,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            response.status,
            errorData.error || errorData.message || 'Request failed'
        );
    }

    const json = await response.json();

    // Backend wraps responses in {status, data, ...} format
    // Extract the data field if present, otherwise return full response
    if (json && typeof json === 'object' && 'data' in json) {
        return json.data as T;
    }

    return json as T;
}

// Jobs API
export const jobsApi = {
    /**
     * Get all jobs with candidate statistics
     */
    async getAll(): Promise<Job[]> {
        return fetchAPI<Job[]>('/api/jobs');
    },

    /**
     * Get a single job by ID
     */
    async getById(id: number): Promise<Job> {
        return fetchAPI<Job>(`/api/jobs/${id}`);
    },

    /**
     * Create a new job
     */
    async create(data: CreateJobRequest): Promise<Job> {
        return fetchAPI<Job>('/api/jobs', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Update an existing job
     */
    async update(id: number, data: Partial<CreateJobRequest>): Promise<Job> {
        return fetchAPI<Job>(`/api/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * Delete a job
     */
    async delete(id: number): Promise<void> {
        return fetchAPI<void>(`/api/jobs/${id}`, {
            method: 'DELETE',
        });
    },

    /**
     * Get job statistics
     */
    async getStats(id: number): Promise<JobStats> {
        return fetchAPI<JobStats>(`/api/jobs/${id}/stats`);
    },
};

// Candidates API
export const candidatesApi = {
    /**
     * Get all candidates for a job
     */
    async getByJob(jobId: number, category?: string): Promise<Candidate[]> {
        const params = category ? `?category=${category}` : '';
        return fetchAPI<Candidate[]>(`/api/jobs/${jobId}/candidates${params}`);
    },

    /**
     * Get a single candidate by ID
     */
    async getById(id: number): Promise<Candidate> {
        const response = await fetchAPI<{ candidate: Candidate; job?: any }>(`/api/candidates/${id}`);
        return response.candidate;
    },

    /**
     * Upload CVs for a job
     */
    async upload(jobId: number, files: File[]): Promise<UploadResponse> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });

        const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/candidates/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.error || 'Upload failed'
            );
        }

        const json = await response.json();
        // Backend wraps upload response in {status, message, data: {...}}
        return json.data || json;
    },

    /**
     * Paste CV text for a job (name will be extracted by AI)
     */
    async pasteText(jobId: number, cvText: string): Promise<{ id: number; filename: string; status: string }> {
        return fetchAPI(`/api/jobs/${jobId}/candidates/paste`, {
            method: 'POST',
            body: JSON.stringify({
                cv_text: cvText
            }),
        });
    },

    /**
     * Re-analyze a candidate
     */
    async reanalyze(id: number): Promise<Candidate> {
        return fetchAPI(`/api/candidates/${id}/analyze`, {
            method: 'POST',
        });
    },

    /**
     * Delete a candidate
     */
    async delete(id: number): Promise<void> {
        return fetchAPI<void>(`/api/candidates/${id}`, {
            method: 'DELETE',
        });
    },

    /**
     * Bulk delete candidates
     */
    async bulkDelete(jobId: number, candidateIds: number[]): Promise<void> {
        return fetchAPI<void>(`/api/jobs/${jobId}/candidates`, {
            method: 'DELETE',
            body: JSON.stringify({ candidate_ids: candidateIds }),
        });
    },

    /**
     * Export candidates to CSV
     */
    async export(jobId: number, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
        const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/export?format=${format}`);

        if (!response.ok) {
            throw new ApiError(response.status, 'Export failed');
        }

        return response.blob();
    },
};

// Analysis API
export const analysisApi = {
    /**
     * Start or resume analysis for a job
     */
    async startAnalysis(jobId: number): Promise<{ message: string; started: number }> {
        return fetchAPI<{ message: string; started: number }>(`/api/jobs/${jobId}/analyze`, {
            method: 'POST',
        });
    },

    /**
     * Get analysis progress/status
     */
    async getStatus(jobId: number): Promise<AnalysisProgress> {
        return fetchAPI<AnalysisProgress>(`/api/jobs/${jobId}/analyze/status`);
    },
};

// Export all as default
export default {
    jobs: jobsApi,
    candidates: candidatesApi,
    analysis: analysisApi,
};
