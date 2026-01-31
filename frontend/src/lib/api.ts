/**
 * API Client for CV Screening System
 * 
 * Handles all HTTP requests to the backend API.
 */

import type {
  Job,
  CreateJobDto,
  UpdateJobDto,
  JobStats,
  Candidate,
  CandidateWithJob,
  UploadResult,
  AnalysisStatus,
  AnalysisBatchResult,
  SystemStatus,
  HealthCheck,
  ApiResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ============================================
// Helper Functions
// ============================================

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  // Handle file downloads
  if (contentType?.includes('text/csv') || contentType?.includes('spreadsheet')) {
    return response.blob() as Promise<T>;
  }
  
  // Handle JSON
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return data;
}

// ============================================
// Health & Status
// ============================================

export async function checkHealth(): Promise<HealthCheck> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse<HealthCheck>(response);
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const response = await fetch(`${API_BASE_URL}/status`);
  const result = await handleResponse<ApiResponse<SystemStatus>>(response);
  return result.data!;
}

// Backward compatibility - alias for old Dashboard
export async function checkStatus() {
  const response = await fetch(`${API_BASE_URL}/status`);
  const data = await response.json();
  return {
    status: data.status === 'success' ? 'ok' : 'error',
    ollama_available: data.data?.ollama?.available || false,
    model: data.data?.ollama?.model || 'llama3'
  };
}

// Backward compatibility - for old NewScreening page
export async function screenCandidates(params: {
  files: File[];
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  requirements: string;
}) {
  // Step 1: Create job
  const jobData = {
    title: params.jobTitle,
    company: params.companyName,
    description: params.jobDescription,
    requirements: params.requirements.split('\n').filter(Boolean),
    skills: [],
  };
  
  const jobResponse = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  const jobResult = await jobResponse.json();
  const jobId = jobResult.data.id;
  
  // Step 2: Upload CVs
  const formData = new FormData();
  params.files.forEach((file) => formData.append('files', file));
  
  await fetch(`${API_BASE_URL}/jobs/${jobId}/candidates/upload`, {
    method: 'POST',
    body: formData,
  });
  
  // Step 3: Start analysis
  const analysisResponse = await fetch(`${API_BASE_URL}/jobs/${jobId}/analyze`, {
    method: 'POST',
  });
  const analysisResult = await analysisResponse.json();
  
  // Step 4: Get candidates
  const candidatesResponse = await fetch(`${API_BASE_URL}/jobs/${jobId}/candidates`);
  const candidatesResult = await candidatesResponse.json();
  
  // Return in old format for compatibility
  return {
    job_info: {
      title: params.jobTitle,
      company: params.companyName,
      total_applicants: candidatesResult.data?.length || 0,
    },
    candidates: candidatesResult.data || [],
    statistics: analysisResult.data?.stats || {},
  };
}


// ============================================
// Jobs API
// ============================================

export async function getJobs(status?: string): Promise<Job[]> {
  const url = new URL(`${API_BASE_URL}/jobs`);
  if (status) url.searchParams.set('status', status);
  
  const response = await fetch(url.toString());
  const result = await handleResponse<ApiResponse<Job[]>>(response);
  return result.data!;
}

export async function getJob(jobId: number): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
  const result = await handleResponse<ApiResponse<Job>>(response);
  return result.data!;
}

export async function createJob(data: CreateJobDto): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiResponse<Job>>(response);
  return result.data!;
}

export async function updateJob(jobId: number, data: UpdateJobDto): Promise<Job> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiResponse<Job>>(response);
  return result.data!;
}

export async function deleteJob(jobId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'DELETE',
  });
  await handleResponse<ApiResponse<void>>(response);
}

export async function getJobStats(jobId: number): Promise<JobStats> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/stats`);
  const result = await handleResponse<ApiResponse<JobStats>>(response);
  return result.data!;
}

// ============================================
// Candidates API
// ============================================

export async function getCandidates(
  jobId: number,
  filters?: { category?: string; status?: string }
): Promise<Candidate[]> {
  const url = new URL(`${API_BASE_URL}/jobs/${jobId}/candidates`);
  if (filters?.category) url.searchParams.set('category', filters.category);
  if (filters?.status) url.searchParams.set('status', filters.status);
  
  const response = await fetch(url.toString());
  const result = await handleResponse<ApiResponse<Candidate[]>>(response);
  return result.data!;
}

export async function getCandidate(candidateId: number): Promise<CandidateWithJob> {
  const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`);
  const result = await handleResponse<ApiResponse<CandidateWithJob>>(response);
  return result.data!;
}

export async function deleteCandidate(candidateId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
    method: 'DELETE',
  });
  await handleResponse<ApiResponse<void>>(response);
}

export async function getShortlist(jobId: number, minScore: number = 70): Promise<Candidate[]> {
  const url = new URL(`${API_BASE_URL}/jobs/${jobId}/candidates/shortlist`);
  url.searchParams.set('min_score', minScore.toString());
  
  const response = await fetch(url.toString());
  const result = await handleResponse<ApiResponse<Candidate[]>>(response);
  return result.data!;
}

export async function uploadCandidates(jobId: number, files: File[]): Promise<UploadResult> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/candidates/upload`, {
    method: 'POST',
    body: formData,
  });
  const result = await handleResponse<ApiResponse<UploadResult>>(response);
  return result.data!;
}

// ============================================
// Analysis API
// ============================================

export async function startAnalysis(jobId: number): Promise<AnalysisBatchResult> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/analyze`, {
    method: 'POST',
  });
  const result = await handleResponse<ApiResponse<AnalysisBatchResult>>(response);
  return result.data!;
}

export async function getAnalysisStatus(jobId: number): Promise<AnalysisStatus> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/analyze/status`);
  const result = await handleResponse<ApiResponse<AnalysisStatus>>(response);
  return result.data!;
}

export async function retryFailedAnalysis(
  jobId: number,
  candidateIds?: number[]
): Promise<AnalysisBatchResult> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/analyze/retry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate_ids: candidateIds }),
  });
  const result = await handleResponse<ApiResponse<AnalysisBatchResult>>(response);
  return result.data!;
}

// ============================================
// Export API
// ============================================

export async function exportCandidates(
  jobId: number,
  options: {
    format?: 'csv' | 'excel';
    category?: string;
    min_score?: number;
  } = {}
): Promise<Blob> {
  const url = new URL(`${API_BASE_URL}/jobs/${jobId}/export`);
  url.searchParams.set('format', options.format || 'csv');
  if (options.category) url.searchParams.set('category', options.category);
  if (options.min_score) url.searchParams.set('min_score', options.min_score.toString());
  
  const response = await fetch(url.toString());
  return handleResponse<Blob>(response);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
