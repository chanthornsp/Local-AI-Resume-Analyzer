import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CVUploader } from '@/components/upload/CVUploader';
// import { CategoryGroup } from '@/components/candidates/CategoryGroup'; // Removed
import { CandidateList } from '@/components/candidates/CandidateList';
import { CandidateDetailPanel } from '@/components/candidates/CandidateDetailPanel';
import { useJob } from '@/hooks/useJobs';
import { useCandidates, useUploadCVs, usePasteCV, useExportCandidates } from '@/hooks/useCandidates';
import { useStartAnalysis, useAnalysisPolling } from '@/hooks/useAnalysis';
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Play,
  Download,
  Award,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobId = parseInt(id || '0');

  const { data: job, isLoading: isLoadingJob } = useJob(jobId);
  const { data: candidates, isLoading: isLoadingCandidates } = useCandidates(jobId);
  const { mutate: uploadCVs, isPending: isUploading } = useUploadCVs(jobId);
  const { mutate: pasteCV, isPending: isPasting } = usePasteCV(jobId);
  const { mutate: startAnalysis, isPending: isStarting } = useStartAnalysis(jobId);
  const { mutate: exportCandidates } = useExportCandidates(jobId);

  // Initialize active tab from localStorage or default to 'overview'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(`job-tab-${jobId}`) || 'overview';
  });

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`job-tab-${jobId}`, activeTab);
  }, [activeTab, jobId]);

  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

  // Auto-select first candidate when data loads if none selected
  useEffect(() => {
    if (candidates && candidates.length > 0 && !selectedCandidateId) {
        // Sort same as list logic to select the top one
        // Priority: Analyzed > Error > Pending, then Score Desc
        const sorted = [...candidates].sort((a, b) => {
             if (a.status === 'analyzed' && b.status !== 'analyzed') return -1;
             if (a.status !== 'analyzed' && b.status === 'analyzed') return 1;
             if (a.status === 'analyzed' && b.status === 'analyzed') {
                return (b.score || 0) - (a.score || 0);
            }
            return 0;
        });
        setSelectedCandidateId(sorted[0].id);
    }
  }, [candidates, selectedCandidateId]);
  
  // Poll for analysis progress
  const { progress, isAnalyzing } = useAnalysisPolling(jobId, !!candidates && candidates.length > 0);

  const handleUpload = (files: File[]) => {
    uploadCVs(files, {
      onSuccess: (response) => {
        toast.success(`${response.uploaded} CVs uploaded successfully!`);
        if (response.errors.length > 0) {
          toast.error(`${response.errors.length} files failed to upload`);
        }
      },
      onError: (error: any) => {
        toast.error(error.message || 'Upload failed');
      },
    });
  };

  const handleStartAnalysis = () => {
    startAnalysis(undefined, {
      onSuccess: (response) => {
        toast.success(response.message);
        setActiveTab('candidates');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to start analysis');
      },
    });
  };

  const handlePasteText = (text: string) => {
    pasteCV(text, {
      onSuccess: () => {
        toast.success('CV text added! Click "Analyze" to extract details.');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to add candidate');
      },
    });
  };

  const handleExport = () => {
    exportCandidates('csv', {
      onSuccess: () => {
        toast.success('Export started!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Export failed');
      },
    });
  };

  if (isLoadingJob) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  const pendingCount = candidates?.filter(c => c.status === 'pending').length || 0;
  const analyzedCount = candidates?.filter(c => c.status === 'analyzed').length || 0;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{job.title}</h1>
                <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                  {job.status}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{job.company}</span>
                </div>
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.salary_range && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salary_range}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upload">Upload CVs</TabsTrigger>
            <TabsTrigger value="candidates">
              Candidates {candidates && candidates.length > 0 && `(${candidates.length})`}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Candidates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{candidates?.length || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Analyzed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{analyzedCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Top Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {progress?.categories?.excellent || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Progress */}
            {isAnalyzing && progress && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                      </div>
                      <span>AI Analysis in Progress</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round((progress.analyzed / progress.total_candidates) * 100)}%
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Processing CVs with AI... {progress.analyzed} of {progress.total_candidates} complete
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Progress Bar */}
                  <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                      style={{ width: `${(progress.analyzed / progress.total_candidates) * 100}%` }}
                    >
                      {progress.analyzed > 0 && (
                        <div className="text-white text-xs font-bold drop-shadow">
                          {progress.analyzed}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Status Breakdown */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div className="text-xs text-muted-foreground">Analyzed</div>
                      <div className="text-sm font-bold text-green-600">{progress.analyzed}</div>
                    </div>
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div className="text-xs text-muted-foreground">Pending</div>
                      <div className="text-sm font-bold text-yellow-600">{progress.pending}</div>
                    </div>
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div className="text-xs text-muted-foreground">Errors</div>
                      <div className="text-sm font-bold text-red-600">{progress.errors}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-3">
              {pendingCount > 0 && (
                <Button 
                  size="lg"
                  onClick={handleStartAnalysis}
                  disabled={isStarting || isAnalyzing}
                  className="relative"
                >
                  {isStarting || isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      {isAnalyzing ? 'Analyzing...' : 'Starting Analysis...'}
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Analyze {pendingCount} CV{pendingCount !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              )}
              {analyzedCount > 0 && (
                <Button size="lg" variant="outline" onClick={handleExport}>
                  <Download className="h-5 w-5 mr-2" />
                  Export Results
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload CV Files</CardTitle>
                <CardDescription>
                  Upload PDF or image files of candidate resumes. They will be queued for AI analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CVUploader 
                  onUpload={handleUpload} 
                  onPasteText={handlePasteText}
                  isUploading={isUploading || isPasting} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="h-[calc(100vh-220px)] min-h-[600px] data-[state=inactive]:hidden">
            {isLoadingCandidates ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              </div>
            ) : candidates && candidates.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
                  {/* List Sidebar */}
                  <div className="md:col-span-4 lg:col-span-3 h-full overflow-y-auto pr-1">
                      <CandidateList 
                        candidates={candidates} 
                        selectedId={selectedCandidateId}
                        onSelect={setSelectedCandidateId}
                      />
                  </div>
                  
                  {/* Detail Panel */}
                  <div className="md:col-span-8 lg:col-span-9 bg-white rounded-lg border p-6 shadow-sm h-full overflow-hidden">
                      <CandidateDetailPanel candidateId={selectedCandidateId} />
                  </div>
               </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">No candidates yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload CV files to start screening candidates for this position.
                    </p>
                    <Button onClick={() => setActiveTab('upload')}>
                      Upload CVs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
