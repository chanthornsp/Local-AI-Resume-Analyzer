import type { ScreeningRequest, ScreeningResult } from "./types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function screenCandidates(
  data: ScreeningRequest,
): Promise<ScreeningResult> {
  const formData = new FormData();

  data.files.forEach((file) => formData.append("cv_files", file));
  formData.append("job_title", data.jobTitle);
  formData.append("job_description", data.jobDescription);
  data.jobRequirements.forEach((req) =>
    formData.append("job_requirements", req),
  );
  formData.append("company_name", data.companyName);

  const response = await fetch(`${API_BASE}/api/screen`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Screening failed");
  }

  const result = await response.json();
  return result.data;
}

export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/api/health`);
  return response.json();
}

export async function checkStatus(): Promise<{
  status: string;
  ollama_available: boolean;
  model: string;
}> {
  const response = await fetch(`${API_BASE}/api/status`);
  return response.json();
}

export async function exportResults(
  jobId: string,
  format: "csv" | "excel",
): Promise<Blob> {
  const response = await fetch(
    `${API_BASE}/api/export/${jobId}?format=${format}`,
  );
  return response.blob();
}
