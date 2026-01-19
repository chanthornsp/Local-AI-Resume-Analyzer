import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CandidateCard } from "./CandidateCard";
import type { Candidate, ScoreGroupType } from "@/lib/types";

const groupConfig: Record<
  ScoreGroupType,
  {
    label: string;
    color: string;
    bg: string;
    emoji: string;
  }
> = {
  excellent: {
    label: "Excellent",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/20",
    emoji: "🟢",
  },
  good: {
    label: "Good",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    emoji: "🟡",
  },
  average: {
    label: "Average",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    emoji: "🟠",
  },
  below_average: {
    label: "Below Average",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/20",
    emoji: "🔴",
  },
};

interface ScoreGroupProps {
  type: ScoreGroupType;
  range: string;
  candidates: Candidate[];
  onSelect: (candidate: Candidate) => void;
}

export function ScoreGroup({
  type,
  range,
  candidates,
  onSelect,
}: ScoreGroupProps) {
  const config = groupConfig[type];

  return (
    <Card className={`border-none ${config.bg}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle
            className={`text-lg ${config.color} flex items-center gap-2`}
          >
            <span>{config.emoji}</span>
            {config.label}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-background">{range}</Badge>
            <Badge variant="secondary">{candidates.length} candidates</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 bg-background/50 rounded-lg border border-dashed">
            No candidates in this group
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {candidates.map((candidate, index) => (
              <CandidateCard
                key={index}
                candidate={candidate}
                onClick={() => onSelect(candidate)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
