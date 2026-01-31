import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// Category & Styling Utilities
// ============================================

export type CandidateCategory = 'excellent' | 'good' | 'average' | 'below_average' | 'pending';

export function getCategoryLabel(category: CandidateCategory): string {
  const labels: Record<CandidateCategory, string> = {
    excellent: 'Excellent',
    good: 'Good',
    average: 'Average',
    below_average: 'Below Average',
    pending: 'Pending Analysis',
  };
  return labels[category] || category;
}

export function getCategoryColor(category: CandidateCategory): string {
  const colors: Record<CandidateCategory, string> = {
    excellent: '#10b981',
    good: '#3b82f6',
    average: '#f59e0b',
    below_average: '#ef4444',
    pending: '#6b7280',
  };
  return colors[category] || '#6b7280';
}

export function getCategoryBadgeClass(category: CandidateCategory): string {
  const classes: Record<CandidateCategory, string> = {
    excellent: 'bg-green-100 text-green-800 border-green-300',
    good: 'bg-blue-100 text-blue-800 border-blue-300',
    average: 'bg-amber-100 text-amber-800 border-amber-300',
    below_average: 'bg-red-100 text-red-800 border-red-300',
    pending: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return classes[category] || 'bg-gray-100 text-gray-800';
}

export function getCategoryIcon(category: CandidateCategory): string {
  const icons: Record<CandidateCategory, string> = {
    excellent: '🌟',
    good: '👍',
    average: '📊',
    below_average: '📉',
    pending: '⏳',
  };
  return icons[category] || '📄';
}

export function getScoreColor(score: number): string {
  if (score >= 85) return getCategoryColor('excellent');
  if (score >= 70) return getCategoryColor('good');
  if (score >= 50) return getCategoryColor('average');
  return getCategoryColor('below_average');
}

export function getRecommendationBadge(recommendation: string): {
  label: string;
  class: string;
} {
  switch (recommendation) {
    case 'SHORTLIST':
      return {
        label: 'Shortlist',
        class: 'bg-purple-100 text-purple-800 border-purple-300',
      };
    case 'CONSIDER':
      return {
        label: 'Consider',
        class: 'bg-blue-100 text-blue-800 border-blue-300',
      };
    case 'PASS':
      return {
        label: 'Pass',
        class: 'bg-gray-100 text-gray-800 border-gray-300',
      };
    default:
      return {
        label: 'Pending',
        class: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      };
  }
}

// ============================================
// Date & Text Utilities
// ============================================

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural || `${singular}s`;
}
