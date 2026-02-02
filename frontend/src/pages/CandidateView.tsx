import { useParams, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCandidate, useReanalyzeCandidate, useDeleteCandidate } from '@/hooks/useCandidates';
import { toast } from 'sonner';
import {
  ArrowLeft,
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
} from 'lucide-react';

export function CandidateView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const candidateId = parseInt(id || '0');
  const { data: candidate, isLoading } = useCandidate(candidateId);
  const { mutate: reanalyze, isPending: isReanalyzing } = useReanalyzeCandidate(candidate?.job_id || 0);
  const { mutate: deleteCandidate, isPending: isDeleting } = useDeleteCandidate(candidate?.job_id || 0);

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
          navigate(`/jobs/${candidate?.job_id}`);
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to delete candidate');
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-2">Candidate Not Found</h2>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

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
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-3">{candidate.name}</h1>
              <div className="flex flex-wrap gap-3">
                {candidate.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${candidate.email}`} className="hover:text-primary">
                      {candidate.email}
                    </a>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${candidate.phone}`} className="hover:text-primary">
                      {candidate.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {candidate.status === 'analyzed' && (
              <div className="text-right">
                <div className={`text-5xl font-bold ${getScoreColor(candidate.score)}`}>
                  {candidate.score}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Match Score</div>
                <div className="flex gap-2 mt-3">
                  <Badge className={categoryColors[candidate.category]}>
                    {candidate.category.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {candidate.status === 'analyzed' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary */}
              {candidate.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{candidate.summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Matched Skills */}
              {candidate.matched_skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      Matched Skills ({candidate.matched_skills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidate.matched_skills.map((skill, index) => (
                        <Badge key={index} variant="default" className="bg-green-100 text-green-800 border-green-300">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Missing Skills */}
              {candidate.missing_skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      Missing Skills ({candidate.missing_skills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidate.missing_skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-muted-foreground">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Strengths */}
              {candidate.strengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {candidate.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Concerns */}
              {candidate.concerns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      Concerns
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {candidate.concerns.map((concern, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                          <span className="text-sm">{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <Briefcase className="h-4 w-4" />
                      Experience
                    </div>
                    <p className="text-muted-foreground pl-6">
                      {candidate.experience_years} years
                    </p>
                  </div>

                  {candidate.education?.degree && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                          <GraduationCap className="h-4 w-4" />
                          Education
                        </div>
                        <p className="text-muted-foreground pl-6">
                          {candidate.education.degree}
                          {candidate.education.field && ` in ${candidate.education.field}`}
                        </p>
                        {candidate.education.institution && (
                          <p className="text-sm text-muted-foreground pl-6 mt-1">
                            {candidate.education.institution}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <Separator />
                  <div>
                    <div className="text-sm font-medium mb-1">Recommendation</div>
                    <Badge variant={
                      candidate.recommendation === 'SHORTLIST' ? 'default' :
                      candidate.recommendation === 'CONSIDER' ? 'secondary' :
                      'outline'
                    }>
                      {candidate.recommendation}
                    </Badge>
                  </div>

                  <Separator />
                  <div>
                    <div className="text-sm font-medium mb-1">Original File</div>
                    <p className="text-xs text-muted-foreground break-all">
                      {candidate.original_filename}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleReanalyze}
                    disabled={isReanalyzing}
                  >
                     {isReanalyzing ? (
                        <div className="animate-spin rounded-full h-4 w-4 mr-2 border-2 border-inherit border-t-transparent" />
                     ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                     )}
                     {isReanalyzing ? 'Analyzing...' : 'Re-analyze Candidate'}
                  </Button>
                  {candidate.email && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`mailto:${candidate.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </a>
                    </Button>
                  )}
                  {candidate.phone && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`tel:${candidate.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </a>
                    </Button>
                  )}
                  <Separator className="my-2" />
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleDelete}
                    disabled={isDeleting || isReanalyzing}
                  >
                     {isDeleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 mr-2 border-2 border-inherit border-t-transparent" />
                     ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                     )}
                     {isDeleting ? 'Deleting...' : 'Delete Candidate'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  {candidate.status === 'pending' ? 'Analysis Pending' : 'Analysis Failed'}
                </h3>
                <p className="text-muted-foreground">
                  {candidate.status === 'pending' 
                    ? 'This candidate is waiting to be analyzed.'
                    : candidate.error_message || 'An error occurred during analysis.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
