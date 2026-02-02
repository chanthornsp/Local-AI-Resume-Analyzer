import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCandidate, useReanalyzeCandidate, useDeleteCandidate } from '@/hooks/useCandidates';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Award,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  FileText
} from 'lucide-react';

interface CandidateDetailPanelProps {
  candidateId: number | null;
}

export function CandidateDetailPanel({ candidateId }: CandidateDetailPanelProps) {
  const { data: candidate, isLoading } = useCandidate(candidateId || 0);
  const { mutate: reanalyze, isPending: isReanalyzing } = useReanalyzeCandidate(candidate?.job_id || 0);
  const { mutate: deleteCandidate, isPending: isDeleting } = useDeleteCandidate(candidate?.job_id || 0);

  if (!candidateId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground border rounded-lg bg-slate-50">
        <FileText className="h-12 w-12 mb-4 opacity-20" />
        <p>Select a candidate to view details</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <p>Candidate not found</p>
      </div>
    );
  }

  const handleReanalyze = () => {
    reanalyze(candidateId, {
      onSuccess: () => {
        toast.success(`Analysis updated for ${candidate?.name}`);
      },
      onError: (error: any) => {
        toast.error(error.message || 'Analysis failed');
      }
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      deleteCandidate(candidateId, {
        onSuccess: () => {
          toast.success('Candidate deleted');
          // Note: In list view, parent handles selection reset usually, or invalidation clears it
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to delete candidate');
        }
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const categoryColors = {
    excellent: 'bg-green-100 text-green-800 border-green-300',
    good: 'bg-blue-100 text-blue-800 border-blue-300',
    average: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    below_average: 'bg-gray-100 text-gray-800 border-gray-300',
    pending: 'bg-slate-100 text-slate-800 border-slate-300',
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{candidate.name || candidate.original_filename}</h2>
          <div className="flex flex-col gap-1">
            {candidate.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <a href={`mailto:${candidate.email}`} className="hover:text-primary transition-colors">
                  {candidate.email}
                </a>
              </div>
            )}
            {candidate.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <a href={`tel:${candidate.phone}`} className="hover:text-primary transition-colors">
                  {candidate.phone}
                </a>
              </div>
            )}
            {candidate.file_path && (
                <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary justify-start mt-1 font-normal" 
                    onClick={() => window.open(`${import.meta.env.VITE_API_URL}/api/candidates/${candidate.id}/cv`, '_blank')}
                >
                    <FileText className="h-3 w-3 mr-1" /> View Original PDF
                </Button>
            )}
          </div>
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

      <Separator />

      {candidate.status === 'analyzed' ? (
        <div className="grid grid-cols-1 gap-6">
          {/* Summary */}
          {candidate.summary && (
            <div className="bg-slate-50 p-4 rounded-lg border text-sm text-muted-foreground leading-relaxed">
              {candidate.summary}
            </div>
          )}

          {/* Skills */}
          <div className="space-y-4">
            {candidate.matched_skills.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Matched Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.matched_skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {candidate.missing_skills.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Missing Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.missing_skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-muted-foreground bg-slate-50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            {candidate.strengths.length > 0 && (
              <Card className="border-green-100 bg-green-50/10">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-3">
                  <ul className="space-y-1.5">
                    {candidate.strengths.map((str, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {str}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Concerns */}
            {candidate.concerns.length > 0 && (
              <Card className="border-yellow-100 bg-yellow-50/10">
                 <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Concerns
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-3">
                  <ul className="space-y-1.5">
                    {candidate.concerns.map((str, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        {str}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Info & Actions */}
          <div className="grid grid-cols-2 gap-4">
             <Card>
                <CardContent className="p-4 space-y-2">
                    <div className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4" /> Experience
                    </div>
                    <div className="text-2xl font-bold">{candidate.experience_years} <span className="text-sm font-normal text-muted-foreground">years</span></div>
                </CardContent>
             </Card>
             <Card>
                <CardContent className="p-4 space-y-2">
                    <div className="text-sm font-medium flex items-center gap-2 mb-2">
                        <GraduationCap className="h-4 w-4" /> Education
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                        {candidate.education?.degree || 'Not specified'}
                    </div>
                </CardContent>
             </Card>
          </div>

          <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={handleReanalyze}
                disabled={isReanalyzing}
              >
                 {isReanalyzing ? (
                    <div className="animate-spin rounded-full h-3 w-3 mr-2 border-2 border-inherit border-t-transparent" />
                 ) : (
                    <RefreshCw className="h-3 w-3 mr-2" />
                 )}
                 Re-analyze
              </Button>
              <Button 
                variant="destructive"
                size="sm" 
                className="flex-1"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                 {isDeleting ? (
                    <div className="animate-spin rounded-full h-3 w-3 mr-2 border-2 border-inherit border-t-transparent" />
                 ) : (
                    <Trash2 className="h-3 w-3 mr-2" />
                 )}
                 Delete
              </Button>
          </div>
          
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
           <div className="animate-pulse mb-4 flex justify-center">
             <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
           </div>
           <p className="text-muted-foreground">Analysis in progress or failed.</p>
           <p className="text-xs text-red-500 mt-2">{candidate.error_message}</p>
           {candidate.status === 'error' && (
              <Button variant="outline" size="sm" onClick={handleReanalyze} className="mt-4">
                Retry Analysis
              </Button>
           )}
        </div>
      )}
    </div>
  );
}
