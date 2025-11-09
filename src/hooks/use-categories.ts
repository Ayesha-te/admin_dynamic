import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Category } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });
};

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => apiClient.getCategory(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Category>) => apiClient.createCategory(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Success',
        description: `Category "${data.name}" has been created.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create category. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) =>
      apiClient.updateCategory(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', data.id] });
      toast({
        title: 'Success',
        description: `Category "${data.name}" has been updated.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update category. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Success',
        description: 'Category has been deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete category. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
