import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { PlusCircle, FileText, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { checkStatus } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const navigate = useNavigate();
  
  const { data: status, isLoading } = useQuery({
    queryKey: ['status'],
    queryFn: checkStatus
  });

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your recruitment drives and screen CVs with AI.
          </p>
        </div>
        <Button onClick={() => navigate('/new')} size="lg" className="gap-2">
          <PlusCircle className="h-5 w-5" />
          New Screening
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className={`h-4 w-4 ${status?.status === 'ok' ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{isLoading ? 'Checking...' : status?.status || 'Unknown'}</div>
            <p className="text-xs text-muted-foreground">
              {status?.ollama_available ? 'Ollama is connected' : 'Ollama not detected'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.model || 'llama3'}</div>
            <p className="text-xs text-muted-foreground">
              Current active LLM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Just now</div>
            <p className="text-xs text-muted-foreground">
              Ready to process
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Welcome to Local AI CV Screener</CardTitle>
          <CardDescription>
            Get started by creating a new screening task. You can upload multiple PDF resumes, 
            define job requirements, and let the local AI screen them for privacy-first analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <Button onClick={() => navigate('/new')} variant="secondary" size="lg">
            Start First Screening
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
