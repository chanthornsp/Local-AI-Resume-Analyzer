"""
CV Analyzer Service

Analyzes CVs against job requirements using Ollama LLM.
Extracts structured data and categorizes candidates.
"""
from typing import Dict, Any
from src.services.ollama_client import OllamaClient
from src.services.candidate_service import CandidateService
from src.services.settings_service import SettingsService
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
        settings = SettingsService.get_settings()
        # Use configured model and custom prompt
        self.ollama = OllamaClient(model=settings.get('ollama_model'))
        self.custom_prompt = settings.get('system_prompt')
        self.temperature = float(settings.get('temperature', 0.2))
    
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
            print(f"  🤖 Analyzing candidate {candidate_id}...", flush=True)
            response = self.ollama.generate(
                prompt=prompt,
                temperature=self.temperature,
                num_predict=2000
            )
            
            # Parse response into structured data
            analysis = self._parse_response(response)
            
            # Categorize by score
            analysis['category'] = self._get_category(analysis['score'])
            
            # Calculate salary based on score and job salary range
            # This overrides the LLM estimate to ensure consistency with the score and job budget
            if job.get('salary_range'):
                calculated_salary = self._calculate_salary_estimate(analysis['score'], job['salary_range'])
                if calculated_salary:
                    analysis['salary_estimate'] = calculated_salary
            
            # Save to database
            CandidateService.update_analysis(candidate_id, analysis)
            
            print(f"  ✅ [QUEUE] COMPLETED: {analysis['name']}", flush=True)
            print(f"     Score: {analysis['score']}/100 ({analysis['category']})", flush=True)
            print(f"     Estimated Salary: {analysis.get('salary_estimate', 'N/A')}", flush=True)
            print(f"     --------------------------------------------------", flush=True)
            
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
        
        # Default instructions
        default_instructions = """**INSTRUCTIONS:**
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
- [strength 1 - specific achievement or skill]
- [strength 2]
- [strength 3]
Concerns:
- [concern 1 - gaps or missing qualifications]
- [concern 2]
Summary: [2-3 sentence overall assessment of candidate fit]
Salary Estimate: [Estimate salary range in USD/month based on candidate level, job budget, and Cambodia market rates]


**SCORING GUIDELINES:**
- 85-100: Excellent match, exceeds requirements
- 70-84: Good match, meets most requirements
- 50-69: Average match, meets basic requirements
- 0-49: Below requirements, significant gaps

Be specific and honest. Base the score on actual qualifications, not potential."""

        # Use custom prompt if configured
        instructions = default_instructions
        if getattr(self, 'custom_prompt', None) and len(self.custom_prompt.strip()) > 10:
            instructions = self.custom_prompt

        prompt = f"""You are an expert HR recruiter analyzing a candidate's CV for a job position.

**JOB DETAILS:**
Position: {job['title']}
Company: {job['company']}

Job Description:
{job['description']}

Required Qualifications:
{requirements_list}

Desired Skills: {skills_str}
Salary Range: {job.get('salary_range', 'Not specified')}

**SALARY ESTIMATION CONTEXT:**
- Base the estimate on the candidate's experience, skills match, and the job's salary range (if provided).
- Consider the market rates for this role in **Cambodia**.
- If the candidate is overqualified/underqualified, adjust the estimate accordingly within or outside the job's range.

---

**CANDIDATE CV:**
{cv_text[:4000]}

---

{instructions}"""
        
        return prompt
    
    def _parse_response(self, response: str) -> Dict[str, Any]:
        """
        Parse LLM response into structured data.
        """
        # --- Pre-processing / Sanitization ---
        # 1. Remove markdown bold/italic markers which confuse regex
        clean_response = response.replace('**', '').replace('__', '')
        
        # 2. Ensure critical headers are on their own lines (fix inline headers)
        headers = [
            'Name:', 'Email:', 'Phone:', 'Match Score:', 'Experience Years:',
            'Matched Skills:', 'Missing Skills:', 'Education:', 
            'Key Strengths:', 'Concerns:', 'Recommendation:', 'Summary:', 'Salary Estimate:'
        ]
        for header in headers:
            # Add newline before header if it doesn't have one
            # Use regex to replace "text Header:" with "text\nHeader:"
            # CASE INSENSITIVE match for the header text
            clean_response = re.sub(rf'(?<!\n)({re.escape(header)})', r'\n\1', clean_response, flags=re.IGNORECASE)
            
        # Update response variable to use sanitized version for all closures below
        response = clean_response
        
        def extract(pattern: str, default: str = '') -> str:
            """Extract single value using regex"""
            # Updated to match sanitized response
            match = re.search(pattern, response, re.IGNORECASE | re.MULTILINE)
            return match.group(1).strip() if match else default
        
        def extract_list(pattern: str) -> list:
            """Extract comma-separated list (can be multiline)"""
            # Use DOTALL to capture across newlines, stopping at double newline or next header
            prefix = pattern.split('(')[0] # Extract "Header: " part
            robust_pattern = rf'{prefix}(.*?)(?:\n\n|\n[A-Z][a-z]+:|$)'
            
            match = re.search(robust_pattern, response, re.IGNORECASE | re.DOTALL)
            if match:
                content = match.group(1)
                
                # Extra safety: remove any text that looks like a known header from content
                for header in headers:
                   if header.lower() in content.lower():
                       # Cut off content before the next header if it leaked in
                       idx = content.lower().find(header.lower())
                       if idx > 0:
                           content = content[:idx]
                
                # Normalize separators:
                # 1. Replace newlines with commas (handles vertical lists)
                content = content.replace('\n', ',')
                
                # 2. Replace common bullet separators (*, -, •) with commas
                # Matches: start/space + bullet + space/end
                # Uses regex to avoid replacing hyphens in words like "cross-functional"
                content = re.sub(r'(?:^|\s)(?:[\*•\-])(?:\s|$)', ',', content)
                
                items = content.split(',')
                return [item.strip() for item in items if item.strip()]
            return []
        
        def extract_bullets(header: str) -> list:
            """Extract bullet point list handling various formats"""
            bullets = []
            
            # Try multiple patterns for flexibility
            patterns = [
                # Pattern 1: Header followed by newline then bullets
                rf'{header}:\s*\n(.*?)(?:\n\n|\n[A-Z][a-z]+:|$)',
                # Pattern 2: Header with content on same line or next lines  
                rf'{header}:\s*(.*?)(?:\n\n|\n[A-Z][a-z]+:|$)',
                # Pattern 3: Just find header and grab everything after until next section
                rf'{header}[:\s]+(.*?)(?:Concerns|Recommendation|Summary|$)',
            ]
            
            content = None
            for pattern in patterns:
                match = re.search(pattern, response, re.IGNORECASE | re.DOTALL)
                if match and match.group(1).strip():
                    content = match.group(1).strip()
                    break
            
            if not content:
                return []
            
            # Split by newlines first
            lines = content.split('\n')
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Skip if this looks like another header
                if re.match(r'^[A-Z][a-z]+:', line):
                    break
                    
                # Remove common bullet markers (•, -, *, 1., etc.)
                cleaned = re.sub(r'^[\s•\-\*\>\+]+|^\d+[\.\)]\s*', '', line).strip()
                
                # Skip very short or empty results
                if cleaned and len(cleaned) > 3:
                    bullets.append(cleaned)
            
            return bullets

        
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
            'summary': extract(r'Summary:\s*(.+?)(?:\n\n|$)', 'No summary provided'),
            'salary_estimate': extract(r'Salary Estimate:\s*(.+?)(?:\n|$)', 'Not available')
        }
        
        # Determine recommendation based on score (not LLM response)
        # This ensures consistency between score and recommendation
        if score >= 70:
            analysis['recommendation'] = 'SHORTLIST'
        elif score >= 50:
            analysis['recommendation'] = 'CONSIDER'
        else:
            analysis['recommendation'] = 'PASS'
        
        # Clean up "Not provided" values
        if analysis['email'] and 'not provided' in analysis['email'].lower():
            analysis['email'] = None
        if analysis['phone'] and 'not provided' in analysis['phone'].lower():
            analysis['phone'] = None
        
        # Ensure we have at least some data
        if not analysis['strengths']:
            # Try to create a meaningful fallback based on score
            if score >= 70:
                analysis['strengths'] = ['Strong match for the role based on qualifications']
            elif score >= 50:
                analysis['strengths'] = ['Meets basic qualifications for the role']
            else:
                analysis['strengths'] = ['Limited information available']
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

    def _calculate_salary_estimate(self, score: int, salary_range: str) -> str:
        """
        Calculate estimated salary based on match score and job salary range.
        
        Args:
            score: Candidate match score (0-100)
            salary_range: Job salary range string (e.g. "$1000 - $2000")
            
        Returns:
             Estimated salary string or None if cannot be calculated
        """
        if not salary_range or salary_range.lower() in ['not specified', 'negotiable']:
            return None
            
        try:
            # Extract numbers from range string
            # Handles "$1,000 - $2,000", "1000-2000", etc.
            matches = re.findall(r'(\d+(?:,\d+)*(?:\.\d+)?)', salary_range)
            if len(matches) >= 2:
                # Parse min and max values
                vals = [float(m.replace(',', '')) for m in matches[:2]]
                min_sal = min(vals)
                max_sal = max(vals)
                
                # Logic:
                # - Score >= 50: Linear mapping from Min to Max salary
                #   (50 -> Min, 100 -> Max)
                # - Score < 50: Discounted Min salary 
                #   (0 -> 80% Min, 49 -> 99% Min)
                
                if score >= 50:
                    # Normalize score 50-100 to 0-1
                    ratio = (score - 50) / 50
                    estimate = min_sal + (max_sal - min_sal) * ratio
                else:
                    # Normalize score 0-50 to 0-1
                    ratio = score / 50
                    # Range from 80% to 100% of min salary
                    estimate = min_sal * (0.8 + (0.2 * ratio))
                
                # Round to nice number (nearest 50)
                estimate = round(estimate / 50) * 50
                
                return f"${int(estimate):,}"
                
        except Exception as e:
            print(f"Error calculating salary: {e}")
            return None
        
        return None
    
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
        
        print(f"\n🔍 Analyzing {len(pending_candidates)} candidates for: {job['title']}", flush=True)
        print("=" * 60, flush=True)
        
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
