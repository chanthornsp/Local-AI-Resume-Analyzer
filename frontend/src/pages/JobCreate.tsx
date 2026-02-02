import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JobForm } from '@/components/jobs/JobForm';
import { useCreateJob } from '@/hooks/useJobs';
import { ArrowLeft } from 'lucide-react';
import type { CreateJobRequest } from '@/lib/types';
import { toast } from 'sonner';

export function JobCreate() {
  const navigate = useNavigate();
  const { mutate: createJob, isPending } = useCreateJob();

  const handleSubmit = (data: CreateJobRequest) => {
    createJob(data, {
      onSuccess: (job) => {
        toast.success('Job created successfully!');
        navigate(`/jobs/${job.id}`);
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create job');
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Create New Job</h1>
          <p className="text-muted-foreground mt-2">
            Add a new job listing to start screening candidates
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Fill in the information about the position you're hiring for.
                This will help the AI better match candidates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobForm
                onSubmit={handleSubmit}
                onCancel={() => navigate('/')}
                isSubmitting={isPending}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
