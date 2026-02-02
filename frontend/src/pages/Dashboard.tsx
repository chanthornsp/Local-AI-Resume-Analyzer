import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JobList } from '@/components/jobs/JobList';
import { useJobs } from '@/hooks/useJobs';
import { Plus, Search, Briefcase, Settings } from 'lucide-react';
import { AIStatusBadge } from '@/components/layout/AIStatusBadge';

export function Dashboard() {
  const navigate = useNavigate();
  const { data: jobs, isLoading } = useJobs();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobs?.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">CV Screening System</h1>
                <p className="text-sm text-muted-foreground">
                  AI-Powered Resume Analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <AIStatusBadge />
              <Button variant="outline" size="icon" onClick={() => navigate('/settings')} title="AI Settings">
                <Settings className="h-5 w-5" />
              </Button>
              <Button onClick={() => navigate('/jobs/new')} size="lg" className="shadow-sm">
                <Plus className="h-5 w-5 mr-2" />
                Create New Job
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        {jobs && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <div className="text-sm font-medium text-muted-foreground">Total Jobs</div>
              <div className="text-3xl font-bold mt-2">{jobs.length}</div>
            </div>
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <div className="text-sm font-medium text-muted-foreground">Total Candidates</div>
              <div className="text-3xl font-bold mt-2">
                {jobs.reduce((acc, job) => acc + (job.total_candidates || 0), 0)}
              </div>
            </div>
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <div className="text-sm font-medium text-muted-foreground">Analyzed</div>
              <div className="text-3xl font-bold mt-2 text-primary">
                {jobs.reduce((acc, job) => acc + (
                  (job.excellent_count || 0) + 
                  (job.good_count || 0) + 
                  (job.average_count || 0) + 
                  (job.below_average_count || 0)
                ), 0)}
              </div>
            </div>
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <div className="text-sm font-medium text-muted-foreground">Pending</div>
              <div className="text-3xl font-bold mt-2 text-muted-foreground">
                 {jobs.reduce((acc, job) => acc + (
                   (job.total_candidates || 0) - (
                     (job.excellent_count || 0) + 
                     (job.good_count || 0) + 
                     (job.average_count || 0) + 
                     (job.below_average_count || 0)
                   )
                 ), 0)}
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search jobs..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Job List */}
        <div className="bg-card rounded-lg border shadow-sm">
           <JobList jobs={filteredJobs} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
