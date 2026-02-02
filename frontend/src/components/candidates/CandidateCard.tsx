import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Briefcase, GraduationCap, TrendingUp, Award } from 'lucide-react';
import type { Candidate } from '@/lib/types';
import { Link } from 'react-router';

interface CandidateCardProps {
  candidate: Candidate;
}

const categoryColors = {
  excellent: 'bg-green-100 text-green-800 border-green-300',
  good: 'bg-blue-100 text-blue-800 border-blue-300',
  average: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  below_average: 'bg-gray-100 text-gray-800 border-gray-300',
  pending: 'bg-slate-100 text-slate-800 border-slate-300',
};

const recommendationColors = {
  SHORTLIST: 'bg-green-500',
  CONSIDER: 'bg-blue-500',
  PASS: 'bg-gray-500',
  PENDING: 'bg-slate-500',
};

export function CandidateCard({ candidate }: CandidateCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{candidate.name}</CardTitle>
            <CardDescription className="space-y-1">
              {candidate.email && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Mail className="h-3.5 w-3.5" />
                  {candidate.email}
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Phone className="h-3.5 w-3.5" />
                  {candidate.phone}
                </div>
              )}
            </CardDescription>
          </div>
          
          {candidate.status === 'analyzed' && (
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(candidate.score)}`}>
                {candidate.score}
              </div>
              <div className="text-xs text-muted-foreground">Match Score</div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <Badge className={categoryColors[candidate.category]}>
            {candidate.category.replace('_', ' ')}
          </Badge>
          <Badge 
            className={`${recommendationColors[candidate.recommendation]} text-white`}
          >
            {candidate.recommendation}
          </Badge>
        </div>
      </CardHeader>

      {candidate.status === 'analyzed' && (
        <CardContent className="space-y-4">
          {/* Experience and Education */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{candidate.experience_years} years exp.</span>
            </div>
            {candidate.education?.degree && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{candidate.education.degree}</span>
              </div>
            )}
          </div>

          {/* Skills Match */}
          {candidate.matched_skills.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-sm font-medium mb-2">
                <Award className="h-4 w-4 text-green-600" />
                <span>Matched Skills ({candidate.matched_skills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {candidate.matched_skills.slice(0, 4).map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {candidate.matched_skills.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{candidate.matched_skills.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          {candidate.summary && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {candidate.summary}
            </p>
          )}

          {/* View Details Button */}
          <Link to={`/candidates/${candidate.id}`} className="block">
            <Button variant="outline" size="sm" className="w-full">
              View Full Profile
            </Button>
          </Link>
        </CardContent>
      )}

      {candidate.status === 'pending' && (
        <CardContent>
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <div className="text-center space-y-3">
              <div className="relative inline-flex items-center justify-center">
                {/* Pulsing background circles */}
                <div className="absolute inset-0 animate-ping">
                  <div className="w-12 h-12 rounded-full bg-blue-400 opacity-75"></div>
                </div>
                <div className="absolute inset-0">
                  <div className="w-12 h-12 rounded-full bg-blue-500 opacity-50 animate-pulse"></div>
                </div>
                {/* Icon */}
                <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Analyzing with AI...</p>
                <p className="text-xs text-muted-foreground mt-1">Extracting candidate details</p>
              </div>
            </div>
          </div>
        </CardContent>
      )}

      {candidate.status === 'error' && (
        <CardContent>
          <div className="text-center py-4 text-sm text-destructive">
            <p>Analysis Failed</p>
            {candidate.error_message && (
              <p className="text-xs mt-1">{candidate.error_message}</p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
