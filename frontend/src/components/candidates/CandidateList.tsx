import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Candidate } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react";

interface CandidateListProps {
  candidates: Candidate[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function CandidateList({ candidates, selectedId, onSelect }: CandidateListProps) {
  // Sort by score desc by default, putting analyzed first
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

  const getScoreBadge = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-800 hover:bg-green-100";
    if (score >= 70) return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    if (score >= 50) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    return "bg-slate-100 text-slate-800 hover:bg-slate-100";
  };

  const getStatusIcon = (status: string, error?: string) => {
      if (status === 'analyzed') return null;
      if (status === 'pending') return <Clock className="h-4 w-4 text-slate-400" />;
      if (status === 'error') return <XCircle className="h-4 w-4 text-red-500" />;
      return null;
  };

  return (
    <div className="border rounded-md bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Candidate</TableHead>
            <TableHead className="text-right">Score</TableHead> 
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCandidates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                No candidates found.
              </TableCell>
            </TableRow>
          ) : (
            sortedCandidates.map((candidate) => (
              <TableRow
                key={candidate.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-slate-50",
                  selectedId === candidate.id && "bg-blue-50/50 border-l-4 border-l-blue-600"
                )}
                onClick={() => onSelect(candidate.id)}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm truncate max-w-[180px]" title={candidate.name}>
                        {candidate.name || candidate.original_filename}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                       {getStatusIcon(candidate.status)}
                       {candidate.status === 'analyzed' ? (
                           <span>{candidate.experience_years}y exp</span>
                       ) : (
                           <span className="italic capitalize">{candidate.status}</span>
                       )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {candidate.status === 'analyzed' ? (
                    <Badge variant="secondary" className={getScoreBadge(candidate.score)}>
                      {candidate.score}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
