import type { Candidate } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface CandidateCardProps {
  candidate: Candidate;
  onClick: () => void;
}

export function CandidateCard({ candidate, onClick }: CandidateCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
      style={{
        borderLeftColor: getScoreColor(candidate.score)
      }}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-full">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold line-clamp-1">{candidate.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {candidate.file}
              </p>
            </div>
          </div>
          <Badge variant={getScoreVariant(candidate.score)}>
            {candidate.score}% Match
          </Badge>
        </div>

        <div className="flex gap-2 text-xs">
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            {candidate.matched_keywords.length} Matched
          </Badge>
          {candidate.missing_keywords.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <AlertCircle className="h-3 w-3 text-amber-500" />
              {candidate.missing_keywords.length} Missing
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getScoreColor(score: number): string {
  if (score >= 85) return "hsl(var(--color-excellent))";
  if (score >= 70) return "hsl(var(--color-good))";
  if (score >= 50) return "hsl(var(--color-average))";
  return "hsl(var(--color-below))";
}

function getScoreVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 85) return "default";
  if (score >= 70) return "secondary";
  if (score >= 50) return "outline";
  return "destructive";
}
