/**
 * CandidateList Component
 * 
 * Displays a list of candidates with filtering and sorting.
 */

import { useState } from 'react';
import { CandidateCard } from './CandidateCard';
import { EmptyState } from '../common/EmptyState';
import type { Candidate, CandidateCategory } from '@/lib/types';

interface CandidateListProps {
  candidates: Candidate[];
  jobId: number;
  onDelete?: (candidateId: number) => void;
}

export function CandidateList({ candidates, jobId, onDelete }: CandidateListProps) {
  const [filterCategory, setFilterCategory] = useState<CandidateCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');

  // Filter candidates
  const filteredCandidates = candidates.filter(c =>
    filterCategory === 'all' ? true : c.category === filterCategory
  );

  // Sort candidates
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'score') {
      return b.score - a.score; // Descending
    } else {
      return a.name.localeCompare(b.name); // Ascending
    }
  });

  if (candidates.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="No candidates yet"
        description="Upload CV files to start analyzing candidates for this job."
      />
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All ({candidates.length})</option>
            <option value="excellent">
              Excellent ({candidates.filter(c => c.category === 'excellent').length})
            </option>
            <option value="good">
              Good ({candidates.filter(c => c.category === 'good').length})
            </option>
            <option value="average">
              Average ({candidates.filter(c => c.category === 'average').length})
            </option>
            <option value="below_average">
              Below Average ({candidates.filter(c => c.category === 'below_average').length})
            </option>
            <option value="pending">
              Pending ({candidates.filter(c => c.category === 'pending').length})
            </option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="score">Highest Score</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-600 mb-4">
        Showing {sortedCandidates.length} of {candidates.length} candidates
      </p>

      {/* Candidate Grid */}
      {sortedCandidates.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No candidates match the filter"
          description="Try selecting a different category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              jobId={jobId}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
