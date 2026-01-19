export type ScoreGroupType = "excellent" | "good" | "average" | "below_average";

export interface Candidate {
  id: string; // generated client-side if not from backend, or use name/file as key
  name: string;
  score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  concerns: string[];
  experience_years: number;
  recommendation: "SHORTLIST" | "CONSIDER" | "PASS";
  summary: string;
  file: string; // filename
}

export interface ScoreGroup {
  range: string;
  count: number;
  candidates: Candidate[];
}

export interface ShortlistItem {
  rank: number;
  id: string;
  name: string;
  score: number;
  recommendation: string;
  file: string;
  group: ScoreGroupType;
}

export interface Analytics {
  average_score: number;
  processed: number;
  errors: number;
  top_matched_skills: string[];
  commonly_missing_skills: string[];
  screening_time_seconds: number;
}

export interface JobInfo {
  title: string;
  company: string;
  total_applicants: number;
}

export interface ScreeningResult {
  status: string;
  job_info: JobInfo;
  score_groups: Record<ScoreGroupType, ScoreGroup>;
  shortlist: ShortlistItem[];
  analytics: Analytics;
}

export interface ScreeningRequest {
  files: File[];
  jobTitle: string;
  jobDescription: string;
  jobRequirements: string[];
  companyName: string;
}
