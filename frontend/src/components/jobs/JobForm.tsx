import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { CreateJobRequest } from '@/lib/types';
import { useState } from 'react';

const jobFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  company: z.string().min(2, 'Company name is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().optional(),
  salary_range: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  onSubmit: (data: CreateJobRequest) => void;
  onCancel?: () => void;
  defaultValues?: Partial<CreateJobRequest>;
  isSubmitting?: boolean;
}

export function JobForm({ onSubmit, onCancel, defaultValues, isSubmitting }: JobFormProps) {
  const [requirements, setRequirements] = useState<string[]>(defaultValues?.requirements || []);
  const [requirementInput, setRequirementInput] = useState('');
  
  const [skills, setSkills] = useState<string[]>(defaultValues?.skills || []);
  const [skillInput, setSkillInput] = useState('');

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      company: defaultValues?.company || '',
      description: defaultValues?.description || '',
      location: defaultValues?.location || '',
      salary_range: defaultValues?.salary_range || '',
    },
  });

  const handleSubmit = (values: JobFormValues) => {
    onSubmit({
      ...values,
      requirements,
      skills,
    });
  };

  const addRequirement = () => {
    if (requirementInput.trim() && !requirements.includes(requirementInput.trim())) {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Senior Frontend Developer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Tech Corp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a detailed description to help the AI better match candidates.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., San Francisco, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary_range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Range</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., $80k - $120k" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-3">
          <FormLabel>Requirements *</FormLabel>
          <FormDescription>
            Add key qualifications and requirements for this position.
          </FormDescription>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Bachelor's degree in Computer Science"
              value={requirementInput}
              onChange={(e) => setRequirementInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
            />
            <Button type="button" onClick={addRequirement} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {requirements.map((req, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3">
                {req}
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          {requirements.length === 0 && (
            <p className="text-sm text-destructive">At least one requirement is needed</p>
          )}
        </div>

        {/* Skills */}
        <div className="space-y-3">
          <FormLabel>Required Skills *</FormLabel>
          <FormDescription>
            Add technical and soft skills needed for this role.
          </FormDescription>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., React, TypeScript, Node.js"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="default" className="text-sm py-1.5 px-3">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="ml-2 hover:text-destructive-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          {skills.length === 0 && (
            <p className="text-sm text-destructive">At least one skill is needed</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting || requirements.length === 0 || skills.length === 0}
          >
            {isSubmitting ? 'Saving...' : defaultValues ? 'Update Job' : 'Create Job'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
