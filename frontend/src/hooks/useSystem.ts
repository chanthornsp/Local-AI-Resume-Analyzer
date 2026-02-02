import { useQuery } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

interface SystemStatus {
    ollama: {
        available: boolean;
        host: string;
        model: string;
    };
    total_jobs: number;
    total_candidates: number;
    total_analyzed: number;
}

export const SYSTEM_KEYS = {
    status: ['system', 'status'] as const,
};

export function useSystemStatus() {
    return useQuery({
        queryKey: SYSTEM_KEYS.status,
        queryFn: async () => {
            // fetchAPI automatically unwraps 'data' property from backend response
            return await fetchAPI<SystemStatus>('/api/status');
        },
        refetchInterval: 30000, // Check every 30 seconds
    });
}
