import type { Candidate } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, XCircle, CheckCircle2 } from "lucide-react";

interface CandidateListProps {
  candidates: Candidate[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function CandidateList({ candidates, selectedId, onSelect }: CandidateListProps) {
  // Sort by score desc by default
  const sortedCandidates = [...candidates].sort((a, b) => {
    // Priority: Analyzed > Error > Pending
    if (a.status === 'analyzed' && b.status !== 'analyzed') return -1;
    if (a.status !== 'analyzed' && b.status === 'analyzed') return 1;
    
    // Sort by score descending
    if (a.status === 'analyzed' && b.status === 'analyzed') {
        return (b.score || 0) - (a.score || 0);
    }
    
    return 0;
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-slate-600 bg-slate-50 border-slate-200";
  };

  if (sortedCandidates.length === 0) {
      return (
          <div className="p-8 text-center text-sm text-muted-foreground">
              No candidates found.
          </div>
      );
  }

  return (
    <div className="divide-y">
      {sortedCandidates.map((candidate) => (
        <div
            key={candidate.id}
            onClick={() => onSelect(candidate.id)}
            className={cn(
                "p-3 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 group border-l-4 border-l-transparent",
                selectedId === candidate.id 
                    ? "bg-blue-50/40 border-l-blue-600" 
                    : "border-l-transparent"
            )}
        >
            <div className="flex-1 min-w-0">
                <div className={cn("font-medium text-sm truncate", selectedId === candidate.id ? "text-primary" : "text-foreground")}>
                    {candidate.name || candidate.original_filename}
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
            
            {candidate.status === 'analyzed' && (
                <div className={cn("text-xs font-bold px-2 py-1 rounded border min-w-[32px] text-center", getScoreColor(candidate.score))}>
                    {candidate.score}
                </div>
            )}
        </div>
      ))}
    </div>
  );
}
