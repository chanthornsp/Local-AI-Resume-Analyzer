from typing import List, Dict
import time
from src.core.pdf_extractor import PDFExtractor
from src.services.cv_screener import CVScreener
from src.services.group_manager import GroupManager

class BatchProcessor:
    """Process multiple CV files in batch"""

    def __init__(self):
        self.extractor = PDFExtractor()
        self.screener = CVScreener()
        self.grouper = GroupManager()

    def process_batch(
        self,
        file_paths: List[str],
        job_title: str,
        job_description: str,
        job_requirements: List[str],
        company_name: str
    ) -> Dict:
        """Process multiple CVs and return grouped results"""

        start_time = time.time()
        candidates = []

        for filepath in file_paths:
            try:
                # Extract text from CV
                cv_text = self.extractor.extract_text(filepath)

                # Screen candidate against job requirements
                result = self.screener.screen(
                    cv_text=cv_text,
                    job_title=job_title,
                    job_description=job_description,
                    job_requirements=job_requirements,
                    company_name=company_name
                )
                result['file'] = filepath.split('/')[-1]
                result['status'] = 'success'
                candidates.append(result)

            except Exception as e:
                candidates.append({
                    'file': filepath.split('/')[-1],
                    'status': 'error',
                    'error': str(e)
                })

        # Group candidates by score
        grouped = self.grouper.group_candidates(candidates)

        # Generate ranked shortlist
        shortlist = self.grouper.generate_shortlist(candidates)

        # Calculate analytics
        analytics = self._calculate_analytics(candidates, start_time)

        return {
            'job_info': {
                'title': job_title,
                'company': company_name,
                'total_applicants': len(candidates)
            },
            'score_groups': grouped,
            'shortlist': shortlist,
            'analytics': analytics
        }

    def _calculate_analytics(self, candidates: List[Dict], start_time: float) -> Dict:
        """Calculate batch analytics"""
        successful = [c for c in candidates if c.get('status') == 'success']
        scores = [c['score'] for c in successful]

        # Collect all matched/missing keywords
        all_matched = []
        all_missing = []
        for c in successful:
            all_matched.extend(c.get('matched_keywords', []))
            all_missing.extend(c.get('missing_keywords', []))

        # Count keyword frequencies
        from collections import Counter
        matched_counts = Counter(all_matched)
        missing_counts = Counter(all_missing)

        return {
            'average_score': sum(scores) / len(scores) if scores else 0,
            'processed': len(successful),
            'errors': len(candidates) - len(successful),
            'top_matched_skills': [k for k, v in matched_counts.most_common(5)],
            'commonly_missing_skills': [k for k, v in missing_counts.most_common(5)],
            'screening_time_seconds': round(time.time() - start_time, 2)
        }
