import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCandidate, useReanalyzeCandidate, useDeleteCandidate } from '@/hooks/useCandidates';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Mail,
  Phone,
  Briefcase,
  GraduationCap,

  AlertCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  FileText,
  Banknote,
  Clock,
  Calendar,
  Copy,
  File as FileIcon
} from 'lucide-react';

interface CandidateDetailPanelProps {
  candidateId: number | null;
}

export function CandidateDetailPanel({ candidateId }: CandidateDetailPanelProps) {
  const [isCVTextOpen, setIsCVTextOpen] = useState(false);
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



  return (
    <div className="h-full flex flex-col bg-white">
      {/* Fixed Header */}
      <div className="p-4 border-b flex-none bg-white">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-xl font-bold truncate disabled:opacity-50" title={candidate.name}>
                  {candidate.name || candidate.original_filename}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                {candidate.email && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <a href={`mailto:${candidate.email}`} className="hover:text-primary transition-colors truncate max-w-[200px]">
                      {candidate.email}
                    </a>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <a href={`tel:${candidate.phone}`} className="hover:text-primary transition-colors">
                      {candidate.phone}
                    </a>
                  </div>
                )}
                {(candidate.file_path || candidate.cv_text) && (
                    <Button 
                        variant="link" 
                        size="sm"
                        className="h-auto p-0 text-muted-foreground hover:text-primary font-normal text-sm" 
                        onClick={() => {
                            if (candidate.file_path && candidate.file_path.toLowerCase().endsWith('.pdf')) {
                                window.open(`${import.meta.env.VITE_API_URL}/api/candidates/${candidate.id}/cv`, '_blank');
                            } else {
                                setIsCVTextOpen(true);
                            }
                        }}
                    >
                        <FileText className="h-3.5 w-3.5 mr-1" /> 
                        {candidate.file_path && candidate.file_path.toLowerCase().endsWith('.pdf') ? 'View PDF' : 'View Original CV'}
                    </Button>
                )}
              </div>
            </div>

            {candidate.status === 'analyzed' && (
              <div className="text-right flex-none">
                <div className={`text-3xl font-bold leading-none ${getScoreColor(candidate.score)}`}>
                  {candidate.score}
                </div>
                <div className="text-[10px] uppercase font-semibold text-muted-foreground mt-1">Match Score</div>
              </div>
            )}
          </div>
      </div>

      {/* CV Text Dialog */}
      <Dialog open={isCVTextOpen} onOpenChange={setIsCVTextOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
             <div className="px-6 py-4 flex items-center justify-between border-b bg-slate-50/50">
                <div>
                     <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Original CV Content
                     </DialogTitle>
                     <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                            <FileIcon className="h-3 w-3" />
                            {candidate.original_filename}
                        </span>
                        {candidate.created_at && (
                             <span className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3" />
                                {new Date(candidate.created_at).toLocaleString()}
                             </span>
                        )}
                     </div>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                        navigator.clipboard.writeText(candidate.cv_text || "");
                        toast.success("Copied to clipboard");
                    }}
                >
                    <Copy className="h-3.5 w-3.5 mr-2" /> Copy Text
                </Button>
             </div>
             
            <div className="flex-1 overflow-y-auto p-6 bg-white">
                <div className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-slate-700 max-w-none">
                    {candidate.cv_text || "No text content available."}
                </div>
            </div>
            
            <div className="p-4 border-t bg-slate-50 flex justify-end">
                <Button onClick={() => setIsCVTextOpen(false)}>Close</Button>
            </div>
        </DialogContent>
      </Dialog>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {candidate.status === 'analyzed' ? (
        <>
          {/* Summary */}
          {candidate.summary && (
            <div className="bg-slate-50 p-3 rounded-md border text-sm text-muted-foreground leading-relaxed">
              {candidate.summary}
            </div>
          )}

          {/* Salary Estimate */}
          {candidate.salary_estimate && candidate.salary_estimate !== 'Not available' && (
            <div className="bg-emerald-50 p-3 rounded-md border border-emerald-200 flex items-center gap-3">
              <div className="p-1.5 bg-emerald-100 rounded-full text-emerald-700">
                <Banknote className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-emerald-900 uppercase">Estimated Salary (Cambodia)</h3>
                <p className="text-emerald-700 font-semibold text-sm">{candidate.salary_estimate}</p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
             <div className="border rounded p-3 flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded text-blue-600">
                    <Briefcase className="h-4 w-4" />
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Experience</div>
                    <div className="font-semibold">{candidate.experience_years} years</div>
                </div>
             </div>
             <div className="border rounded p-3 flex items-center gap-3">
                <div className="bg-purple-50 p-2 rounded text-purple-600">
                    <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                    <div className="text-xs text-muted-foreground">Education</div>
                    <div className="font-semibold text-sm truncate max-w-[150px]" title={candidate.education?.degree}>
                        {candidate.education?.degree || 'Not specified'}
                    </div>
                </div>
             </div>
          </div>

          {/* Skills Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Matched Skills
                </h3>
                <div className="flex flex-wrap gap-1">
                  {candidate.matched_skills.length > 0 ? candidate.matched_skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 px-2 py-0.5 text-xs font-normal">
                      {skill}
                    </Badge>
                  )) : <span className="text-xs text-muted-foreground">-</span>}
                </div>
             </div>
             <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Missing Skills
                </h3>
                <div className="flex flex-wrap gap-1">
                  {candidate.missing_skills.length > 0 ? candidate.missing_skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-muted-foreground bg-slate-50 px-2 py-0.5 text-xs font-normal">
                      {skill}
                    </Badge>
                  )) : <span className="text-xs text-muted-foreground">-</span>}
                </div>
             </div>
          </div>

          <Separator />

          {/* Strengths & Concerns */}
          <div className="grid grid-cols-1 gap-4">
            {/* Strengths */}
            {candidate.strengths.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-700">
                        <TrendingUp className="h-4 w-4" /> Key Strengths
                    </h3>
                    <ul className="space-y-1">
                    {candidate.strengths.map((str, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2 text-xs">
                        <span className="text-green-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        {str}
                        </li>
                    ))}
                    </ul>
                </div>
            )}

            {/* Concerns */}
            {candidate.concerns.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-yellow-700">
                        <AlertCircle className="h-4 w-4" /> Areas for Review
                    </h3>
                     <ul className="space-y-1">
                    {candidate.concerns.map((str, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2 text-xs">
                        <span className="text-yellow-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                        {str}
                        </li>
                    ))}
                    </ul>
                </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="pt-4 mt-4 border-t flex gap-2">
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
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                 )}
                 Re-analyze
              </Button>
              <Button 
                variant="ghost"
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                 {isDeleting ? (
                    <div className="animate-spin rounded-full h-3 w-3 mr-2 border-2 border-inherit border-t-transparent" />
                 ) : (
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                 )}
                 Delete
              </Button>
          </div>
          
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
           <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                {candidate.status === 'error' ? <AlertCircle className="h-6 w-6 text-red-400" /> : <Clock className="h-6 w-6 text-slate-400" />}
           </div>
           <p className="text-muted-foreground font-medium mb-1">
               {candidate.status === 'error' ? 'Analysis Failed' : 'Pending Analysis'}
           </p>
           {candidate.status === 'error' ? (
               <div className="max-w-xs mx-auto">
                    <p className="text-xs text-red-500 mb-4">{candidate.error_message}</p>
                    <Button variant="outline" size="sm" onClick={handleReanalyze}>
                        <RefreshCw className="h-3 w-3 mr-2" /> Retry Analysis
                    </Button>
               </div>
           ) : (
               <p className="text-xs text-muted-foreground max-w-xs">
                   This candidate is queued for processing or waiting to be started.
               </p>
           )}
        </div>
      )}
      </div>
    </div>
  );
}
