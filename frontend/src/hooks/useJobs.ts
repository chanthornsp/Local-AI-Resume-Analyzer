import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '@/lib/api';
import type { CreateJobRequest } from '@/lib/types';

export const JOB_KEYS = {
    all: ['jobs'] as const,
    lists: () => [...JOB_KEYS.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...JOB_KEYS.lists(), { filters }] as const,
    details: () => [...JOB_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...JOB_KEYS.details(), id] as const,
    stats: (id: number) => [...JOB_KEYS.detail(id), 'stats'] as const,
};

/**
 * Hook to fetch all jobs
 */
export function useJobs() {
    return useQuery({
        queryKey: JOB_KEYS.lists(),
        queryFn: () => jobsApi.getAll(),
    });
}

/**
 * Hook to fetch a single job by ID
 */
export function useJob(id: number) {
    return useQuery({
        queryKey: JOB_KEYS.detail(id),
        queryFn: () => jobsApi.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook to fetch job statistics
 */
export function useJobStats(id: number) {
    return useQuery({
        queryKey: JOB_KEYS.stats(id),
        queryFn: () => jobsApi.getStats(id),
        enabled: !!id,
    });
}

/**
 * Hook to create a new job
 */
export function useCreateJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateJobRequest) => jobsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: JOB_KEYS.lists() });
        },
    });
}

/**
 * Hook to update a job
 */
export function useUpdateJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateJobRequest> }) =>
            jobsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: JOB_KEYS.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: JOB_KEYS.lists() });
        },
    });
}

/**
 * Hook to delete a job
 */
export function useDeleteJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => jobsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: JOB_KEYS.lists() });
        },
    });
}
