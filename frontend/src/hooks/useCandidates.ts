import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatesApi } from '@/lib/api';

export const CANDIDATE_KEYS = {
    all: ['candidates'] as const,
    lists: () => [...CANDIDATE_KEYS.all, 'list'] as const,
    list: (jobId: number, category?: string) =>
        [...CANDIDATE_KEYS.lists(), jobId, category] as const,
    details: () => [...CANDIDATE_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...CANDIDATE_KEYS.details(), id] as const,
};

/**
 * Hook to fetch candidates for a job
 */
export function useCandidates(jobId: number, category?: string) {
    return useQuery({
        queryKey: CANDIDATE_KEYS.list(jobId, category),
        queryFn: () => candidatesApi.getByJob(jobId, category),
        enabled: !!jobId,
    });
}

/**
 * Hook to fetch a single candidate by ID
 */
export function useCandidate(id: number) {
    return useQuery({
        queryKey: CANDIDATE_KEYS.detail(id),
        queryFn: () => candidatesApi.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook to upload CVs
 */
export function useUploadCVs(jobId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (files: File[]) => candidatesApi.upload(jobId, files),
        onSuccess: () => {
            // Invalidate candidates list to show newly uploaded CVs
            queryClient.invalidateQueries({
                queryKey: CANDIDATE_KEYS.list(jobId)
            });
        },
    });
}

/**
 * Hook to paste CV text (name extracted by AI during analysis)
 */
export function usePasteCV(jobId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (cvText: string) =>
            candidatesApi.pasteText(jobId, cvText),
        onSuccess: () => {
            // Invalidate candidates list to show newly pasted CV
            queryClient.invalidateQueries({
                queryKey: CANDIDATE_KEYS.list(jobId)
            });
        },
    });
}

/**
 * Hook to re-analyze a candidate
 */
export function useReanalyzeCandidate(jobId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (candidateId: number) => candidatesApi.reanalyze(candidateId),
        onSuccess: (_, candidateId) => {
            queryClient.invalidateQueries({
                queryKey: CANDIDATE_KEYS.list(jobId)
            });
            queryClient.invalidateQueries({
                queryKey: CANDIDATE_KEYS.detail(candidateId)
            });
        },
    });
}

/**
 * Hook to delete a candidate
 */
export function useDeleteCandidate(jobId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (candidateId: number) => candidatesApi.delete(candidateId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: CANDIDATE_KEYS.list(jobId)
            });
        },
    });
}

/**
 * Hook to export candidates
 */
export function useExportCandidates(jobId: number) {
    return useMutation({
        mutationFn: (format: 'csv' | 'excel' = 'csv') =>
            candidatesApi.export(jobId, format),
        onSuccess: (blob, format) => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `candidates-job-${jobId}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },
    });
}
