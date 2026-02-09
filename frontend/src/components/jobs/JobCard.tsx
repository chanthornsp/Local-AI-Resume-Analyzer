import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Users, Calendar, CheckCircle2, Clock } from 'lucide-react';
import type { Job } from '@/lib/types';
import { Link } from 'react-router';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalAnalyzed = 
    (job.excellent_count || 0) + 
    (job.good_count || 0) + 
    (job.average_count || 0) + 
    (job.below_average_count || 0);
    
  const pendingCount = (job.total_candidates || 0) - totalAnalyzed;

  const analysisProgress = job.total_candidates 
    ? Math.round((totalAnalyzed / job.total_candidates) * 100) 
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
              {job.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Building2 className="h-4 w-4" />
              {job.company}
            </CardDescription>
          </div>
          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
            {job.status}
          </Badge>
        </div>
        
        {job.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.description}
        </p>

        {/* Skills Preview */}
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 5).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{job.skills.length - 5} more
            </Badge>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Users className="h-3.5 w-3.5" />
            </div>
            <div className="text-2xl font-bold">{job.total_candidates || 0}</div>
            <div className="text-xs text-muted-foreground">Candidates</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div className="text-2xl font-bold text-primary">
              {totalAnalyzed}
            </div>
            <div className="text-xs text-muted-foreground">Analyzed</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div className="text-2xl font-bold text-orange-500">
              {pendingCount < 0 ? 0 : pendingCount}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>

        {/* Progress bar for analysis */}
        {job.total_candidates && job.total_candidates > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Analysis Progress</span>
              <span>{analysisProgress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDate(job.created_at)}
        </div>
        <Link to={`/jobs/${job.id}`}>
          <Button variant="default" size="sm">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
