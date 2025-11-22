import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useSubscribers() {
  return useQuery({
    queryKey: ['subscribers'],
    queryFn: async () => {
      return apiClient.request('/newsletter/active_subscribers/');
    },
  });
}

export function useAllSubscribers() {
  return useQuery({
    queryKey: ['all-subscribers'],
    queryFn: async () => {
      return apiClient.request('/newsletter/');
    },
  });
}

export function useUnsubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      return apiClient.request(`/newsletter/${id}/`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
}

export function useToggleSubscriber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiClient.request(`/newsletter/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
}
