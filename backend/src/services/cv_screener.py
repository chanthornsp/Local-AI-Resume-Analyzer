import re
from typing import Dict, List
from src.services.ollama_client import OllamaClient

class CVScreener:
    """Screen CVs against job requirements using Ollama LLM"""

    def __init__(self):
        self.ollama = OllamaClient()

    def screen(
        self,
        cv_text: str,
        job_title: str,
        job_description: str,
        job_requirements: List[str],
        company_name: str
    ) -> Dict:
        """Screen a CV against job requirements"""

        prompt = self._build_prompt(
            cv_text, job_title, job_description,
            job_requirements, company_name
        )

        response = self.ollama.generate(
            prompt=prompt,
            temperature=0.3,
            num_predict=2000
        )

        return self._parse_response(response)

    def _build_prompt(self, cv_text, job_title, job_description,
                      job_requirements, company_name) -> str:
        """Build screening prompt for LLM"""
        reqs = "\n".join(f"- {r}" for r in job_requirements)

        return f"""You are an expert HR recruiter screening candidates.
Evaluate this CV for {job_title} at {company_name}.

Job Description:
{job_description}

Required Qualifications:
{reqs}

Candidate CV:
{cv_text}

Provide screening evaluation in EXACTLY this format:
Match Score: [number 0-100]
Candidate Name: [name]
Matched Keywords: [keyword1], [keyword2], [keyword3]
Missing Keywords: [keyword1], [keyword2]
Key Strengths:
• [strength1]
• [strength2]
• [strength3]
Concerns:
• [concern1]
Experience Years: [number]
Recommendation: [SHORTLIST/CONSIDER/PASS]
Summary: [brief assessment]"""

    def _parse_response(self, response: str) -> Dict:
        """Parse LLM response into structured format"""
        score = re.search(r'Match Score:\s*(\d+)', response, re.I)
        name = re.search(r'Candidate Name:\s*(.+)', response, re.I)
        matched = re.search(r'Matched Keywords:\s*(.+)', response, re.I)
        missing = re.search(r'Missing Keywords:\s*(.+)', response, re.I)
        exp = re.search(r'Experience Years:\s*(\d+)', response, re.I)
        rec = re.search(r'Recommendation:\s*(SHORTLIST|CONSIDER|PASS)', response, re.I)
        summary = re.search(r'Summary:\s*(.+?)(?:\n\n|$)', response, re.I | re.DOTALL)

        # Extract strengths
        strengths = []
        strengths_match = re.search(r'Key Strengths:\s*\n((?:•[^\n]+\n?)+)', response, re.I)
        if strengths_match:
            strengths = [s.strip('• ').strip() for s in strengths_match.group(1).split('\n') if s.strip()]

        # Extract concerns
        concerns = []
        concerns_match = re.search(r'Concerns:\s*\n((?:•[^\n]+\n?)+)', response, re.I)
        if concerns_match:
            concerns = [c.strip('• ').strip() for c in concerns_match.group(1).split('\n') if c.strip()]

        return {
            'score': int(score.group(1)) if score else 0,
            'name': name.group(1).strip() if name else 'Unknown',
            'matched_keywords': [k.strip() for k in matched.group(1).split(',')] if matched else [],
            'missing_keywords': [k.strip() for k in missing.group(1).split(',')] if missing else [],
            'strengths': strengths,
            'concerns': concerns,
            'experience_years': int(exp.group(1)) if exp else 0,
            'recommendation': rec.group(1) if rec else 'PASS',
            'summary': summary.group(1).strip() if summary else ''
        }
