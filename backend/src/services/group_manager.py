from typing import List, Dict

class GroupManager:
    """Manage score-based candidate grouping"""

    DEFAULT_THRESHOLDS = {
        'excellent': {'min': 85, 'max': 100},
        'good': {'min': 70, 'max': 84},
        'average': {'min': 50, 'max': 69},
        'below_average': {'min': 0, 'max': 49}
    }

    def __init__(self, thresholds: Dict = None):
        self.thresholds = thresholds or self.DEFAULT_THRESHOLDS

    def group_candidates(self, candidates: List[Dict]) -> Dict:
        """Group candidates by score ranges"""
        groups = {
            k: {
                'range': f"{v['min']}-{v['max']}",
                'count': 0,
                'candidates': []
            }
            for k, v in self.thresholds.items()
        }

        for candidate in candidates:
            if candidate.get('status') != 'success':
                continue
            score = candidate.get('score', 0)
            group = self._get_group(score)
            groups[group]['count'] += 1
            groups[group]['candidates'].append(candidate)

        # Sort candidates within each group by score descending
        for group in groups.values():
            group['candidates'].sort(key=lambda x: x['score'], reverse=True)

        return groups

    def _get_group(self, score: int) -> str:
        """Determine which group a score belongs to"""
        for name, threshold in self.thresholds.items():
            if threshold['min'] <= score <= threshold['max']:
                return name
        return 'below_average'

    def generate_shortlist(self, candidates: List[Dict], min_score: int = 70) -> List[Dict]:
        """Generate ranked shortlist of top candidates"""
        valid = [
            c for c in candidates
            if c.get('status') == 'success' and c.get('score', 0) >= min_score
        ]
        valid.sort(key=lambda x: x['score'], reverse=True)

        return [
            {
                'rank': i + 1,
                'name': c['name'],
                'score': c['score'],
                'recommendation': c['recommendation'],
                'file': c['file'],
                'group': self._get_group(c['score'])
            }
            for i, c in enumerate(valid)
        ]
