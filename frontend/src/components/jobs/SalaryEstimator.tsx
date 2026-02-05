import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

const CAMBODIA_SALARY_DATA: Record<string, Record<string, string>> = {
  'Frontend Developer': {
    'Junior': '$400 - $800',
    'Mid-Level': '$800 - $1,500',
    'Senior': '$1,500 - $3,000',
    'Lead': '$2,500 - $4,500'
  },
  'Backend Developer': {
    'Junior': '$500 - $900',
    'Mid-Level': '$900 - $1,800',
    'Senior': '$1,800 - $3,500',
    'Lead': '$3,000 - $5,000'
  },
  'Full Stack Developer': {
    'Junior': '$600 - $1,000',
    'Mid-Level': '$1,000 - $2,000',
    'Senior': '$2,000 - $4,000',
    'Lead': '$3,500 - $6,000'
  },
  'Mobile Developer': {
    'Junior': '$400 - $800',
    'Mid-Level': '$800 - $1,600',
    'Senior': '$1,600 - $3,200',
    'Lead': '$2,800 - $5,000'
  },
  'DevOps Engineer': {
    'Junior': '$600 - $1,200',
    'Mid-Level': '$1,200 - $2,500',
    'Senior': '$2,500 - $4,500',
    'Lead': '$4,000 - $7,000'
  },
  'QA Engineer': {
    'Junior': '$300 - $600',
    'Mid-Level': '$600 - $1,200',
    'Senior': '$1,200 - $2,200',
    'Lead': '$2,000 - $3,500'
  },
  'Project Manager': {
    'Junior': '$800 - $1,500',
    'Mid-Level': '$1,500 - $3,000',
    'Senior': '$3,000 - $5,000',
    'Lead': '$5,000+'
  }
};

interface SalaryEstimatorProps {
  onApply: (range: string) => void;
}

export function SalaryEstimator({ onApply }: SalaryEstimatorProps) {
  const [role, setRole] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [open, setOpen] = useState(false);

  const estimatedSalary = (role && level) ? CAMBODIA_SALARY_DATA[role]?.[level] : null;

  const handleApply = () => {
    if (estimatedSalary) {
      onApply(estimatedSalary);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-9">
          <Calculator className="h-4 w-4" />
          Estimate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambodia Salary Estimator 🇰🇭</DialogTitle>
          <DialogDescription>
            Estimate market rates for tech roles in Cambodia (Phnom Penh).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select onValueChange={setRole} value={role}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CAMBODIA_SALARY_DATA).map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Experience Level</Label>
            <Select onValueChange={setLevel} value={level} disabled={!role}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Junior">Junior (0-2 years)</SelectItem>
                <SelectItem value="Mid-Level">Mid-Level (2-4 years)</SelectItem>
                <SelectItem value="Senior">Senior (5+ years)</SelectItem>
                <SelectItem value="Lead">Lead / Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {estimatedSalary && (
            <div className="mt-4 p-4 bg-slate-50 border rounded-lg text-center animate-in zoom-in-95 duration-200">
               <div className="text-sm text-muted-foreground mb-1">Estimated Range</div>
               <div className="text-2xl font-bold text-green-600">{estimatedSalary}</div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleApply} disabled={!estimatedSalary}>
            Apply Range
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
