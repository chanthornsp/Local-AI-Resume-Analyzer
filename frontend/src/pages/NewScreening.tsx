import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CVUploader } from "@/components/screening/CVUploader";
import { screenCandidates } from "@/lib/api";

const formSchema = z.object({
  jobTitle: z.string().min(2, "Job title is required"),
  companyName: z.string().min(2, "Company name is required"),
  jobDescription: z.string().min(10, "Job description is required"),
  requirements: z.string().min(5, "At least one requirement is needed"),
});

export default function NewScreening() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: "",
      companyName: "",
      jobDescription: "",
      requirements: "",
    },
  });

  const mutation = useMutation({
    mutationFn: screenCandidates,
    onSuccess: (data) => {
      toast.success("Screening Complete", {
        description: `Successfully screened ${data.job_info.total_applicants} candidates.`,
      });
      // Pass data to results page via state
      navigate("/results", { state: { result: data } });
    },
    onError: (error: Error) => {
      toast.error("Screening Failed", {
        description: error.message,
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (files.length === 0) {
      toast.error("No CVs Uploaded", {
        description: "Please upload at least one PDF CV to screen.",
      });
      return;
    }

    // Split requirements by new line
    const jobRequirements = values.requirements
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    mutation.mutate({
      files,
      jobTitle: values.jobTitle,
      companyName: values.companyName,
      jobDescription: values.jobDescription,
      jobRequirements,
    });
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Screening</h1>
        <p className="text-muted-foreground mt-2">
          Enter job details and upload CVs to begin AI screening.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Define the role you are hiring for.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Senior Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Tech Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="jobDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste the full job description here..." 
                          className="h-32" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Requirements (One per line)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="5+ years Python experience&#10;Bachelor's degree in CS&#10;Experience with AWS" 
                          className="h-32 font-mono text-sm" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Upload CVs</h3>
                  <CVUploader onFilesSelected={setFiles} />
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={mutation.isPending}
                    className="w-full md:w-auto min-w-[200px]"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Screening {files.length} Candidates...
                      </>
                    ) : (
                      <>
                        Start Screening
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
