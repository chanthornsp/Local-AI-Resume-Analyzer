import { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Download, ChevronLeft, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScoreGroup } from "@/components/candidates/ScoreGroup";
import { CandidateDetail } from "@/components/candidates/CandidateDetail";
import type { ScreeningResult, Candidate } from "@/lib/types";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result: ScreeningResult | undefined = location.state?.result;
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  if (!result) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Button variant="ghost" size="sm" onClick={() => navigate('/new')} className="-ml-2">
               <ChevronLeft className="h-4 w-4 mr-1" /> Back
             </Button>
             <h1 className="text-3xl font-bold tracking-tight">Screening Results</h1>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-medium text-foreground">{result.job_info.title}</span>
            <span>at</span>
            <span className="font-medium text-foreground">{result.job_info.company}</span>
            <span>•</span>
            <Badge variant="outline">{result.job_info.total_applicants} Applicants</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {/* TODO: Implement Export */}}>
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
          <Button onClick={() => navigate('/')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="py-4">
             <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
             <div className="text-2xl font-bold">{result.analytics.average_score.toFixed(1)}%</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-4">
             <CardTitle className="text-sm font-medium text-muted-foreground">Processing Time</CardTitle>
             <div className="text-2xl font-bold">{result.analytics.screening_time_seconds}s</div>
          </CardHeader>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="py-4">
             <CardTitle className="text-sm font-medium text-muted-foreground">Top Skills Found</CardTitle>
             <div className="flex flex-wrap gap-2 mt-2">
               {result.analytics.top_matched_skills.map((skill, i) => (
                 <Badge key={i} variant="secondary">{skill}</Badge>
               ))}
             </div>
          </CardHeader>
        </Card>
      </div>

      <div className="flex gap-6 items-start">
        {/* Main Content Area */}
        <div className={`flex-1 transition-all ${selectedCandidate ? 'w-2/3 hidden md:block' : 'w-full'}`}>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Groups</TabsTrigger>
              <TabsTrigger value="shortlist">Shortlist ({result.shortlist.length})</TabsTrigger>
              <TabsTrigger value="excellent">Excellent ({result.score_groups.excellent.count})</TabsTrigger>
              <TabsTrigger value="good">Good ({result.score_groups.good.count})</TabsTrigger>
              <TabsTrigger value="average">Average ({result.score_groups.average.count})</TabsTrigger>
              <TabsTrigger value="below">Below Avg ({result.score_groups.below_average.count})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <ScoreGroup 
                type="excellent" 
                {...result.score_groups.excellent} 
                onSelect={setSelectedCandidate} 
              />
              <ScoreGroup 
                type="good" 
                {...result.score_groups.good} 
                onSelect={setSelectedCandidate} 
              />
              <ScoreGroup 
                type="average" 
                {...result.score_groups.average} 
                onSelect={setSelectedCandidate} 
              />
               <ScoreGroup 
                type="below_average" 
                {...result.score_groups.below_average} 
                onSelect={setSelectedCandidate} 
              />
            </TabsContent>

            <TabsContent value="shortlist" className="space-y-6">
                {/* Reusing ScoreGroup component for simplicity, but in real app might want a table view */}
                <div className="grid gap-4">
                  {result.shortlist.map((item) => {
                     // Find the full candidate object from the groups
                     const group = result.score_groups[item.group];
                     const candidate = group.candidates.find(c => c.name === item.name); // basic matching
                     return candidate ? (
                        <div key={item.rank} className="flex gap-4 items-center">
                           <div className="font-bold text-lg text-muted-foreground w-8">#{item.rank}</div>
                           <div className="flex-1">
                            {/* We can reuse CandidateCard here if we import it, or just pass to ScoreGroup like wrapper */}
                           </div>
                        </div>
                     ) : null;
                  })}
                  <div className="p-4 border border-dashed rounded text-center text-muted-foreground">
                    Shortlist view implementation pending. Use "All Groups" to see details.
                  </div>
                </div>
            </TabsContent>

            {/* Individual Group Tabs */}
            {(['excellent', 'good', 'average', 'below_average'] as const).map((groupType) => (
                <TabsContent key={groupType} value={groupType === 'below_average' ? 'below' : groupType}>
                  <ScoreGroup 
                    type={groupType} 
                    {...result.score_groups[groupType]} 
                    onSelect={setSelectedCandidate} 
                  />
                </TabsContent>
            ))}

          </Tabs>
        </div>

        {/* Candidate Detail Sidebar / Modal */}
        {selectedCandidate && (
          <div className="w-full md:w-[400px] lg:w-[500px] shrink-0 border-l pl-6 animate-in slide-in-from-right duration-300 fixed md:sticky top-6 h-[calc(100vh-100px)] overflow-y-auto bg-background z-10 md:z-0 shadow-2xl md:shadow-none p-6 md:p-0 right-0 border-l-2 md:border-l-0">
             <div className="flex justify-between items-center mb-4 md:hidden">
               <h3 className="font-bold">Candidate Details</h3>
               <Button variant="ghost" size="sm" onClick={() => setSelectedCandidate(null)}>Close</Button>
             </div>
             <CandidateDetail candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
