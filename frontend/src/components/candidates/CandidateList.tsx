import { useState } from "react";
import type { Candidate } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, XCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useBulkDeleteCandidates } from "@/hooks/useCandidates";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CandidateListProps {
  candidates: Candidate[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  jobId: number;
}

export function CandidateList({ candidates: initialCandidates, selectedId, onSelect, jobId }: CandidateListProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const bulkDelete = useBulkDeleteCandidates(jobId);

  // Sort candidates
  const candidates = [...initialCandidates].sort((a, b) => {
    // Priority: Analyzed > Error > Pending
    if (a.status === 'analyzed' && b.status !== 'analyzed') return -1;
    if (a.status !== 'analyzed' && b.status === 'analyzed') return 1;
    
    // Sort by score descending
    if (a.status === 'analyzed' && b.status === 'analyzed') {
        return (b.score || 0) - (a.score || 0);
    }
    return 0;
  });



  const handleSelectAll = (checked: boolean) => {
      if (checked) {
          setSelectedIds(candidates.map(c => c.id));
      } else {
          setSelectedIds([]);
      }
  };

  const handleDeleteSelected = () => {
      bulkDelete.mutate(selectedIds, {
          onSuccess: () => {
              toast.success(`Deleted ${selectedIds.length} candidates`);
              setSelectedIds([]);
              setIsDeleteDialogOpen(false);
          },
          onError: () => {
              toast.error("Failed to delete candidates");
          }
      });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-slate-600 bg-slate-50 border-slate-200";
  };

  if (candidates.length === 0) {
      return (
          <div className="p-8 text-center text-sm text-muted-foreground">
              No candidates found.
          </div>
      );
  }

  return (
    <>
        <div className="flex flex-col h-full">
            {/* Bulk Action Header */}
            <div className="p-2 border-b bg-muted/30 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                 <div className="flex items-center gap-2">
                     <Checkbox 
                        checked={selectedIds.length > 0 && selectedIds.length === candidates.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                     />
                     <span className="text-xs font-medium text-muted-foreground">
                         {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select All'}
                     </span>
                 </div>
                 
                 {selectedIds.length > 0 && (
                     <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-7 text-xs px-2"
                        onClick={() => setIsDeleteDialogOpen(true)}
                     >
                         <Trash2 className="h-3 w-3 mr-1" />
                         Delete ({selectedIds.length})
                     </Button>
                 )}
            </div>

            <div className="divide-y overflow-y-auto flex-1">
            {candidates.map((candidate) => (
                <div
                    key={candidate.id}
                    onClick={() => onSelect(candidate.id)}
                    className={cn(
                        "p-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-3 group border-l-4 border-l-transparent",
                        selectedId === candidate.id 
                            ? "bg-blue-50/40 border-l-blue-600" 
                            : "border-l-transparent",
                        selectedIds.includes(candidate.id) && "bg-muted/30"
                    )}
                >
                    <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                        <Checkbox 
                            checked={selectedIds.includes(candidate.id)}
                            onCheckedChange={(checked: boolean | "indeterminate") => {
                                setSelectedIds(prev => 
                                    checked === true
                                        ? [...prev, candidate.id] 
                                        : prev.filter(i => i !== candidate.id)
                                );
                            }}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                             <div className={cn("font-medium text-sm truncate pr-2", selectedId === candidate.id ? "text-primary" : "text-foreground")}>
                                {candidate.name || candidate.original_filename}
                            </div>
                            
                            {candidate.status === 'analyzed' && (
                                <div className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border min-w-[28px] text-center flex-shrink-0", getScoreColor(candidate.score))}>
                                    {candidate.score}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                            {candidate.status === 'analyzed' ? (
                            <span className="text-xs text-muted-foreground truncate">
                                {candidate.experience_years} years exp
                            </span>
                            ) : (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 capitalize">
                                    {candidate.status === 'pending' && <Clock className="h-3 w-3" />}
                                    {candidate.status === 'error' && <XCircle className="h-3 w-3 text-red-500" />}
                                    {candidate.status}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            </div>
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedIds.length} Candidates?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the selected candidates and their data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelected} className="bg-red-600 hover:bg-red-700">
                        {bulkDelete.isPending ? "Deleting..." : "Delete Candidates"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
