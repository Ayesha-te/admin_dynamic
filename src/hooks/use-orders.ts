import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Order } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.getOrders(),
  });
};

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => apiClient.getOrder(id),
    enabled: !!id,
  });
};

export const useMarkOrderAsPaid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (orderId: number) => apiClient.markOrderAsPaid(orderId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', data.id] });
      toast({
        title: 'Success',
        description: `Order #${data.id} has been marked as paid.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark order as paid. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useMarkOrderAsShipped = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (orderId: number) => apiClient.updateOrder(orderId, { status: 'shipped' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', data.id] });
      toast({
        title: 'Success',
        description: `Order #${data.id} has been marked as shipped.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark order as shipped. Please try again.',
        variant: 'destructive',
      });
    },
  });
};