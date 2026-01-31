"""
CV Analyzer Service

Analyzes CVs against job requirements using Ollama LLM.
Extracts structured data and categorizes candidates.
"""
from typing import Dict, Any
from src.services.ollama_client import OllamaClient
from src.services.candidate_service import CandidateService
import re


class CVAnalyzer:
    """Analyze CVs against job requirements using AI"""
    
    # Score category thresholds
    CATEGORY_THRESHOLDS = {
        'excellent': 85,
        'good': 70,
        'average': 50,
        'below_average': 0
    }
    
    def __init__(self):
        """Initialize CV analyzer with Ollama client"""
        self.ollama = OllamaClient()
    
    def analyze_candidate(self, candidate_id: int, cv_text: str, job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a single candidate CV against job requirements.
        
        Args:
            candidate_id: ID of candidate record in database
            cv_text: Extracted text from CV
            job: Job dictionary with requirements and description
        
        Returns:
            Dictionary with analysis results
        """
        try:
            # Build prompt for LLM
            prompt = self._build_prompt(cv_text, job)
            
            # Get LLM response
            print(f"  🤖 Analyzing candidate {candidate_id}...")
            response = self.ollama.generate(
                prompt=prompt,
                temperature=0.3,  # Lower temperature for more consistent extraction
                num_predict=2000
            )
            
            # Parse response into structured data
            analysis = self._parse_response(response)
            
            # Categorize by score
            analysis['category'] = self._get_category(analysis['score'])
            
            # Save to database
            CandidateService.update_analysis(candidate_id, analysis)
            
            print(f"  ✅ {analysis['name']} - Score: {analysis['score']}/100 ({analysis['category']})")
            
            return analysis
            
        except Exception as e:
            error_msg = f"Analysis failed: {str(e)}"
            print(f"  ❌ Error analyzing candidate {candidate_id}: {error_msg}")
            CandidateService.mark_error(candidate_id, error_msg)
            raise
    
    def _build_prompt(self, cv_text: str, job: Dict[str, Any]) -> str:
        """
        Build structured prompt for LLM analysis.
        
        Args:
            cv_text: Extracted CV text
            job: Job details
            
        Returns:
            Formatted prompt string
        """
        # Format requirements
        requirements_list = '\n'.join(f"- {req}" for req in job.get('requirements', []))
        
        # Format skills
        skills_str = ', '.join(job.get('skills', []))
        
        prompt = f"""You are an expert HR recruiter analyzing a candidate's CV for a job position.

**JOB DETAILS:**
Position: {job['title']}
Company: {job['company']}

Job Description:
{job['description']}

Required Qualifications:
{requirements_list}

Desired Skills: {skills_str}

---

**CANDIDATE CV:**
{cv_text[:4000]}

---

**INSTRUCTIONS:**
Analyze this CV and provide a structured assessment. Extract information EXACTLY in this format:

Name: [candidate's full name]
Email: [email address if found, or "Not provided"]
Phone: [phone number if found, or "Not provided"]
Match Score: [number from 0-100 based on job fit]
Experience Years: [total years of relevant experience]
Matched Skills: [comma-separated list of skills from CV that match job requirements]
Missing Skills: [comma-separated list of required skills NOT found in CV]
Education: [highest degree and field, e.g., "BS Computer Science"]
Key Strengths:
• [strength 1 - specific achievement or skill]
• [strength 2]
• [strength 3]
Concerns:
• [concern 1 - gaps or missing qualifications]
• [concern 2]
Recommendation: [SHORTLIST, CONSIDER, or PASS]
Summary: [2-3 sentence overall assessment of candidate fit]

**SCORING GUIDELINES:**
- 85-100: Excellent match, exceeds requirements
- 70-84: Good match, meets most requirements
- 50-69: Average match, meets basic requirements
- 0-49: Below requirements, significant gaps

Be specific and honest. Base the score on actual qualifications, not potential."""
        
        return prompt
    
    def _parse_response(self, response: str) -> Dict[str, Any]:
        """
        Parse LLM response into structured data.
        
        Args:
            response: Raw LLM response text
            
        Returns:
            Dictionary with extracted fields
        """
        def extract(pattern: str, default: str = '') -> str:
            """Extract single value using regex"""
            match = re.search(pattern, response, re.IGNORECASE | re.MULTILINE)
            return match.group(1).strip() if match else default
        
        def extract_list(pattern: str) -> list:
            """Extract comma-separated list"""
            match = re.search(pattern, response, re.IGNORECASE)
            if match:
                items = match.group(1).split(',')
                return [item.strip() for item in items if item.strip()]
            return []
        
        def extract_bullets(header: str) -> list:
            """Extract bullet point list"""
            pattern = rf'{header}:\s*\n((?:•[^\n]+\n?)+)'
            match = re.search(pattern, response, re.IGNORECASE | re.MULTILINE)
            if match:
                bullets = match.group(1).split('\n')
                return [b.strip('• ').strip() for b in bullets if b.strip()]
            return []
        
        # Extract score with validation
        score_str = extract(r'Match Score:\s*(\d+)', '0')
        score = int(score_str) if score_str.isdigit() else 0
        score = max(0, min(100, score))  # Clamp between 0-100
        
        # Extract experience years with validation
        exp_str = extract(r'Experience Years:\s*(\d+)', '0')
        experience_years = int(exp_str) if exp_str.isdigit() else 0
        
        # Extract all fields
        analysis = {
            'name': extract(r'Name:\s*(.+?)(?:\n|$)', 'Unknown Candidate'),
            'email': extract(r'Email:\s*([^\s]+@[^\s]+|\S+@\S+|Not provided)', None),
            'phone': extract(r'Phone:\s*([+\d\s\-()]+|Not provided)', None),
            'score': score,
            'experience_years': experience_years,
            'matched_skills': extract_list(r'Matched Skills:\s*(.+?)(?:\n|$)'),
            'missing_skills': extract_list(r'Missing Skills:\s*(.+?)(?:\n|$)'),
            'education': {
                'summary': extract(r'Education:\s*(.+?)(?:\n|$)', 'Not specified')
            },
            'strengths': extract_bullets('Key Strengths'),
            'concerns': extract_bullets('Concerns'),
            'recommendation': extract(r'Recommendation:\s*(SHORTLIST|CONSIDER|PASS)', 'PASS').upper(),
            'summary': extract(r'Summary:\s*(.+?)(?:\n\n|$)', 'No summary provided')
        }
        
        # Clean up "Not provided" values
        if analysis['email'] and 'not provided' in analysis['email'].lower():
            analysis['email'] = None
        if analysis['phone'] and 'not provided' in analysis['phone'].lower():
            analysis['phone'] = None
        
        # Ensure we have at least some data
        if not analysis['strengths']:
            analysis['strengths'] = ['Analysis incomplete']
        if not analysis['matched_skills']:
            analysis['matched_skills'] = []
        
        return analysis
    
    def _get_category(self, score: int) -> str:
        """
        Determine category based on score.
        
        Args:
            score: Match score (0-100)
            
        Returns:
            Category string
        """
        for category, threshold in sorted(
            self.CATEGORY_THRESHOLDS.items(), 
            key=lambda x: x[1], 
            reverse=True
        ):
            if score >= threshold:
                return category
        return 'below_average'
    
    def analyze_batch(self, job_id: int) -> Dict[str, Any]:
        """
        Analyze all pending candidates for a job.
        
        Args:
            job_id: Job ID
            
        Returns:
            Dictionary with analysis statistics
        """
        from src.services.job_service import JobService
        
        # Get job details
        job = JobService.get_by_id(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")
        
        # Get pending candidates
        pending_candidates = CandidateService.get_pending(job_id)
        
        if not pending_candidates:
            return {
                'job_id': job_id,
                'total': 0,
                'analyzed': 0,
                'errors': 0,
                'message': 'No pending candidates to analyze'
            }
        
        print(f"\n🔍 Analyzing {len(pending_candidates)} candidates for: {job['title']}")
        print("=" * 60)
        
        analyzed_count = 0
        error_count = 0
        
        for candidate in pending_candidates:
            try:
                self.analyze_candidate(
                    candidate_id=candidate['id'],
                    cv_text=candidate['cv_text'],
                    job=job
                )
                analyzed_count += 1
            except Exception as e:
                error_count += 1
                print(f"  ❌ Failed to analyze candidate {candidate['id']}: {e}")
        
        print("=" * 60)
        print(f"✅ Analysis complete: {analyzed_count} analyzed, {error_count} errors\n")
        
        # Get updated statistics
        stats = JobService.get_stats(job_id)
        
        return {
            'job_id': job_id,
            'total': len(pending_candidates),
            'analyzed': analyzed_count,
            'errors': error_count,
            'stats': stats
        }
