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
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { JobForm } from '@/components/jobs/JobForm';
import { useUpdateJob, useDeleteJob } from '@/hooks/useJobs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDelete = () => {
    deleteJob.mutate(jobId, {
      onSuccess: () => {
        toast.success('Job deleted successfully');
        navigate('/');
      },
      onError: () => {
        toast.error('Failed to delete job');
      }
    });
  };

  const handleUpdate = (data: any) => {
    updateJob.mutate({ id: jobId, data }, {
      onSuccess: () => {
        toast.success('Job updated successfully');
        setIsEditOpen(false);
      },
      onError: () => {
        toast.error('Failed to update job');
      }
    });
  };

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
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b bg-white shadow-sm z-10 relative flex-none">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold truncate max-w-[400px]" title={job.title}>{job.title}</h1>
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'} className="rounded-md px-2 py-0 h-5 text-[10px] uppercase">
                        {job.status}
                    </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{job.company}</span>
                    </div>
                    {job.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{job.location}</span>
                        </div>
                    )}
                    {job.salary_range && (
                        <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{job.salary_range}</span>
                        </div>
                    )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
                 <div className="flex items-center gap-4 mr-4 text-xs text-muted-foreground border-r pr-4">
                    <div className="text-center">
                        <span className="block font-bold text-foreground">{candidates?.length || 0}</span>
                        <span>Total</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-green-600">{analyzedCount}</span>
                        <span>Analyzed</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-yellow-600">{pendingCount}</span>
                        <span>Pending</span>
                    </div>
                 </div>

                 <Button size="sm" variant="outline" onClick={() => setActiveTab('upload')}>
                     Upload CVs
                 </Button>
                 {pendingCount > 0 && (
                    <Button 
                        size="sm"
                        onClick={handleStartAnalysis}
                        disabled={isStarting || isAnalyzing}
                    >
                        {isStarting || isAnalyzing ? 'Analyzing...' : 'Analyze Pending'}
                    </Button>
                 )}
                 {analyzedCount > 0 && (
                    <Button size="sm" variant="ghost" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                    </Button>
                 )}

                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Job
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Job
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col space-y-4">
            <div className="flex-none">
                <TabsList className="grid w-full max-w-[400px] grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="candidates">Candidates</TabsTrigger>
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                </TabsList>
            </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 overflow-y-auto pb-10">
            {/* Same overview content... simplified for brevity if needed/kept same */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {/* Dashboard cards kept same */}
               <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Total Candidates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{candidates?.length || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Analyzed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{analyzedCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Top Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{progress?.categories?.excellent || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Analysis Progress */}
            {isAnalyzing && progress && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="py-4">
                   {/* ... Keep existing progress UI ... */}
                   <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                        <span>Analysis in Progress... {Math.round((progress.analyzed / progress.total_candidates) * 100)}%</span>
                    </div>
                   </CardTitle>
                   {/* Simplified Progress bar */}
                   <div className="w-full bg-white/50 rounded-full h-2 mt-2 overflow-hidden shadow-inner">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-500"
                      style={{ width: `${(progress.analyzed / progress.total_candidates) * 100}%` }}
                    />
                   </div>
                </CardHeader>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Job Description</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                        {job.description}
                    </CardContent>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Requirements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                            {job.requirements.map((req, index) => (
                                <li key={index} className="flex items-start gap-2">
                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>{req}</span>
                                </li>
                            ))}
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-1.5">
                            {job.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                                </Badge>
                            ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="h-full">
            <Card className="h-full border-dashed">
              <CardContent className="p-8 h-full flex flex-col items-center justify-center">
                <div className="max-w-2xl w-full">
                     <CVUploader 
                        onUpload={handleUpload} 
                        onPasteText={handlePasteText}
                        isUploading={isUploading || isPasting} 
                    />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Candidates Tab - MAIN REDESIGN */}
          <TabsContent value="candidates" className="flex-1 overflow-hidden data-[state=inactive]:hidden mt-0!">
            {isLoadingCandidates ? (
               <div className="flex justify-center items-center h-full">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
               </div>
            ) : candidates && candidates.length > 0 ? (
               <div className="flex h-full gap-4 items-stretch">
                  {/* List Sidebar - Narrow & Compact */}
                  <div className="w-[320px] flex-none flex flex-col border rounded-lg bg-white overflow-hidden shadow-sm">
                      <div className="p-2 border-b bg-muted/30 text-xs font-medium text-muted-foreground flex justify-between items-center">
                          <span>Candidates ({candidates.length})</span>
                          {/* Could add Sort/Filter here later */}
                      </div>
                      <div className="flex-1 overflow-y-auto">
                           <CandidateList 
                                candidates={candidates} 
                                selectedId={selectedCandidateId}
                                onSelect={setSelectedCandidateId}
                            />
                      </div>
                  </div>
                  
                  {/* Detail Panel - Wide & Flexible */}
                  <div className="flex-1 border rounded-lg bg-white shadow-sm overflow-hidden flex flex-col">
                      <CandidateDetailPanel candidateId={selectedCandidateId} />
                  </div>
               </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg bg-slate-50">
                    <p className="text-muted-foreground mb-4">No candidates yet.</p>
                    <Button onClick={() => setActiveTab('upload')}>Upload CVs</Button>
                </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Job Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          <JobForm 
            defaultValues={{
                title: job.title,
                company: job.company,
                description: job.description,
                requirements: job.requirements,
                skills: job.skills,
                location: job.location,
                salary_range: job.salary_range,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditOpen(false)}
            isSubmitting={updateJob.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job 
              and all {candidates?.length || 0} associated candidates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
                {deleteJob.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
