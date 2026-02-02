import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAPI } from '@/lib/api';

export interface Settings {
    ollama_model: string;
    system_prompt: string;
    temperature: number;
}

export interface SettingsResponse {
    settings: Settings;
    available_models: string[];
    ollama_connected: boolean;
}

export const SETTINGS_KEYS = {
    all: ['settings'] as const,
};

export function useSettings() {
    return useQuery({
        queryKey: SETTINGS_KEYS.all,
        queryFn: async () => {
            return await fetchAPI<SettingsResponse>('/api/settings');
        },
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<Settings>) => {
            return await fetchAPI<{ data: Settings }>('/api/settings', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.all });
            // Also invalidate system status to reflect new model
            queryClient.invalidateQueries({ queryKey: ['system', 'status'] });
        },
    });
}
