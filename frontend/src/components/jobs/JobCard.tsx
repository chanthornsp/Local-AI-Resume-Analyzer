/**
 * JobCard Component
 * 
 * Displays a job listing card with statistics and actions.
 */

import { Link } from 'react-router-dom';
import type { Job } from '@/lib/types';
import { formatRelativeTime, pluralize } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  onDelete?: (jobId: number) => void;
}

export function JobCard({ job, onDelete }: JobCardProps) {
  const totalCandidates = job.total_candidates || 0;
  const analyzedCount = 
    (job.excellent_count || 0) +
    (job.good_count || 0) +
    (job.average_count || 0) +
    (job.below_average_count || 0);
  const pendingCount = job.pending_count || 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link
              to={`/jobs/${job.id}`}
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {job.title}
            </Link>
            <p className="text-gray-600 mt-1">{job.company}</p>
          </div>
          
          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              job.status === 'active'
                ? 'bg-green-100 text-green-800'
                : job.status === 'closed'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {job.status}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {job.description}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          {job.location && (
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{job.location}</span>
            </div>
          )}
          {job.salary_range && (
            <div className="flex items-center gap-1">
              <span>💰</span>
              <span>{job.salary_range}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span>⏰</span>
            <span>{formatRelativeTime(job.created_at)}</span>
          </div>
        </div>

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 5 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                +{job.skills.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Total:</span>
                <span className="font-semibold text-gray-900">
                  {totalCandidates}
                </span>
              </div>
              
              {analyzedCount > 0 && (
                <>
                  {job.excellent_count > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-green-600">🌟</span>
                      <span className="text-green-700 font-medium">
                        {job.excellent_count}
                      </span>
                    </div>
                  )}
                  {job.good_count > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-blue-600">👍</span>
                      <span className="text-blue-700 font-medium">
                        {job.good_count}
                      </span>
                    </div>
                  )}
                </>
              )}
              
              {pendingCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-amber-600">⏳</span>
                  <span className="text-amber-700 font-medium">
                    {pendingCount} pending
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                to={`/jobs/${job.id}/edit`}
                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Edit
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(job.id)}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  Delete
                </button>
              )}
              <Link
                to={`/jobs/${job.id}`}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
