import { CandidateCard } from './CandidateCard';
import type { Candidate, CandidateCategory } from '@/lib/types';

interface CategoryGroupProps {
  category: CandidateCategory;
  candidates: Candidate[];
  title: string;
  icon?: React.ReactNode;
  colorClass?: string;
}

export function CategoryGroup({ category, candidates, title, icon, colorClass }: CategoryGroupProps) {
  const filteredCandidates = candidates.filter(c => c.category === category);

  if (filteredCandidates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {icon && <div className={colorClass}>{icon}</div>}
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCandidates.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </div>
  );
}
