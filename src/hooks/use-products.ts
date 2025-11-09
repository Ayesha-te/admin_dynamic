import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Product } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.getProducts(),
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiClient.getProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Product>) => apiClient.createProduct(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: `Product "${data.name}" has been created.`,
      });
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to create product. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) =>
      apiClient.updateProduct(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', data.id] });
      toast({
        title: 'Success',
        description: `Product "${data.name}" has been updated.`,
      });
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to update product. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Success',
        description: 'Product has been deleted.',
      });
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to delete product. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};
