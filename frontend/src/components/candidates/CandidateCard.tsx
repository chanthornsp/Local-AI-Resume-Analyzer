/**
 * CandidateCard Component
 * 
 * Displays a candidate summary card with score, category, and key information.
 */

import { Link } from 'react-router-dom';
import type { Candidate } from '@/lib/types';
import { getCategoryBadgeClass, getCategoryIcon, getRecommendationBadge } from '@/lib/utils';

interface CandidateCardProps {
  candidate: Candidate;
  jobId: number;
  showActions?: boolean;
  onDelete?: (candidateId: number) => void;
}

export function CandidateCard({ candidate, jobId, showActions = true, onDelete }: CandidateCardProps) {
  const recommendationBadge = getRecommendationBadge(candidate.recommendation);
  const scoreColor = candidate.score >= 85 ? 'text-green-600' :
                     candidate.score >= 70 ? 'text-blue-600' :
                     candidate.score >= 50 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200">
      <div className="p-5">
        {/* Header with Name and Score */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Link
              to={`/candidates/${candidate.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors block"
            >
              {candidate.name}
            </Link>
            {candidate.email && (
              <p className="text-sm text-gray-600 mt-0.5">{candidate.email}</p>
            )}
          </div>
          
          {/* Score Badge */}
          <div className="flex flex-col items-end gap-1">
            <div className={`text-2xl font-bold ${scoreColor}`}>
              {candidate.score}
            </div>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
        </div>

        {/* Category and Recommendation */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryBadgeClass(candidate.category)}`}>
            {getCategoryIcon(candidate.category)} {candidate.category.replace('_', ' ')}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${recommendationBadge.class}`}>
            {recommendationBadge.label}
          </span>
        </div>

        {/* Experience and Contact */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <span>💼</span>
            <span>{candidate.experience_years} years exp.</span>
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-1">
              <span>📱</span>
              <span>{candidate.phone}</span>
            </div>
          )}
        </div>

        {/* Matched Skills */}
        {candidate.matched_skills && candidate.matched_skills.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1.5">Matched Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.matched_skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs"
                >
                  {skill}
                </span>
              ))}
              {candidate.matched_skills.length > 4 && (
                <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs">
                  +{candidate.matched_skills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Strengths */}
        {candidate.strengths && candidate.strengths.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Key Strength</p>
            <p className="text-sm text-gray-700 line-clamp-2">
              • {candidate.strengths[0]}
            </p>
          </div>
        )}

        {/* Summary */}
        {candidate.summary && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2">
              {candidate.summary}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              📄 {candidate.original_filename}
            </span>
            <div className="flex gap-2">
              {onDelete && (
                <button
                  onClick={() => onDelete(candidate.id)}
                  className="text-sm text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                >
                  Delete
                </button>
              )}
              <Link
                to={`/candidates/${candidate.id}`}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                View Full Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
