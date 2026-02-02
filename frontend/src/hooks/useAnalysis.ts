import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisApi } from '@/lib/api';
import type { AnalysisProgress } from '@/lib/types';
import { CANDIDATE_KEYS } from './useCandidates';
import { JOB_KEYS } from './useJobs';

export const ANALYSIS_KEYS = {
    all: ['analysis'] as const,
    status: (jobId: number) => [...ANALYSIS_KEYS.all, 'status', jobId] as const,
};

/**
 * Hook to get analysis status/progress
 */
export function useAnalysisStatus(jobId: number, options?: {
    refetchInterval?: number | ((query: any) => number | false);
    enabled?: boolean;
}) {
    return useQuery({
        queryKey: ANALYSIS_KEYS.status(jobId),
        queryFn: () => analysisApi.getStatus(jobId),
        enabled: options?.enabled ?? !!jobId,
        refetchInterval: options?.refetchInterval,
    });
}

/**
 * Hook to start analysis
 */
export function useStartAnalysis(jobId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => analysisApi.startAnalysis(jobId),
        onSuccess: () => {
            // Invalidate analysis status to start polling
            queryClient.invalidateQueries({
                queryKey: ANALYSIS_KEYS.status(jobId)
            });
            // Invalidate candidates list to show updates
            queryClient.invalidateQueries({
                queryKey: CANDIDATE_KEYS.list(jobId)
            });
            // Invalidate job stats
            queryClient.invalidateQueries({
                queryKey: JOB_KEYS.stats(jobId)
            });
        },
    });
}

/**
 * Custom hook to poll analysis progress
 * Automatically starts/stops polling based on completion status
 */
export function useAnalysisPolling(jobId: number, enabled: boolean = true) {
    const { data: progress, isLoading } = useAnalysisStatus(jobId, {
        enabled,
        refetchInterval: (query) => {
            const data = query.state.data as AnalysisProgress | undefined;
            // Only poll if analysis is actively in progress
            // Don't poll for 'pending' (not started yet) or 'complete'/'no_candidates'
            const shouldPoll = data?.analysis_status === 'in_progress';
            return shouldPoll ? 2000 : false;
        },
    });

    return {
        progress,
        isLoading,
        // Analysis is actively running when status is 'in_progress'
        isAnalyzing: progress?.analysis_status === 'in_progress',
        // Complete when status is 'complete' or 'no_candidates'
        isComplete: progress?.analysis_status === 'complete' || progress?.analysis_status === 'no_candidates',
    };
}
