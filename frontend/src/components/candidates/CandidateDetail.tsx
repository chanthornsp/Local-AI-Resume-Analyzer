import { X, Check, AlertTriangle, Briefcase, GraduationCap, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Candidate } from "@/lib/types";

interface CandidateDetailProps {
  candidate: Candidate;
  onClose?: () => void;
}

export function CandidateDetail({ candidate, onClose }: CandidateDetailProps) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{candidate.name}</h2>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{candidate.file}</span>
          </div>
        </div>
        {onClose && (
           <Button variant="ghost" size="icon" onClick={onClose} className="hidden md:flex">
             <X className="h-4 w-4" />
           </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col">
           <span className="text-sm text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Match Score</span>
           <span className={`text-3xl font-bold ${getScoreColor(candidate.score)}`}>
             {candidate.score}%
           </span>
        </div>
        <Separator orientation="vertical" className="h-10" />
        <div className="flex flex-col">
           <span className="text-sm text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Experience</span>
           <span className="text-xl font-semibold flex items-center gap-1">
             <Briefcase className="h-4 w-4 text-muted-foreground" />
             {candidate.experience_years} Years
           </span>
        </div>
        <Separator orientation="vertical" className="h-10" />
        <div className="flex flex-col">
           <span className="text-sm text-muted-foreground font-medium uppercase text-[10px] tracking-wider">Recommendation</span>
           <Badge variant={getRecVariant(candidate.recommendation)} className="mt-1">
             {candidate.recommendation}
           </Badge>
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1 -mr-4 pr-4">
        <div className="space-y-6 pb-6">
          
          {/* Summary */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
               Summary Analysis
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-lg border">
              {candidate.summary}
            </p>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <h4 className="text-sm font-semibold flex items-center gap-2 text-green-600">
                 <Check className="h-4 w-4" /> Matched Skills
               </h4>
               <div className="flex flex-wrap gap-1.5">
                 {candidate.matched_keywords.length > 0 ? (
                    candidate.matched_keywords.map((k, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{k}</Badge>
                    ))
                 ) : (
                    <span className="text-xs text-muted-foreground italic">None found</span>
                 )}
               </div>
            </div>
            <div className="space-y-2">
               <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-600">
                 <AlertTriangle className="h-4 w-4" /> Missing
               </h4>
               <div className="flex flex-wrap gap-1.5">
                 {candidate.missing_keywords.length > 0 ? (
                    candidate.missing_keywords.map((k, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">{k}</Badge>
                    ))
                 ) : (
                    <span className="text-xs text-muted-foreground italic">None missing</span>
                 )}
               </div>
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Key Strengths</h3>
            <ul className="space-y-2">
              {candidate.strengths.map((s, i) => (
                <li key={i} className="text-sm flex gap-2 items-start">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Concerns */}
          {candidate.concerns.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Areas of Concern</h3>
              <ul className="space-y-2">
                {candidate.concerns.map((c, i) => (
                  <li key={i} className="text-sm flex gap-2 items-start">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </ScrollArea>
      
      <div className="pt-4 border-t mt-auto">
        <Button className="w-full" variant="outline">
           Download Full Report
        </Button>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 85) return "text-green-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function getRecVariant(rec: string): "default" | "secondary" | "destructive" | "outline" {
  switch (rec?.toUpperCase()) {
    case 'SHORTLIST': return 'default';
    case 'CONSIDER': return 'secondary';
    case 'PASS': return 'destructive';
    default: return 'outline';
  }
}
