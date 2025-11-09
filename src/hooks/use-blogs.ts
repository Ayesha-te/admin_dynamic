import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, Blog } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const useBlogs = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: () => apiClient.getBlogs(),
  });
};

export const useBlog = (id: number) => {
  return useQuery({
    queryKey: ['blogs', id],
    queryFn: () => apiClient.getBlog(id),
    enabled: !!id,
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<Blog>) => apiClient.createBlog(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast({
        title: 'Success',
        description: `Blog "${data.title}" has been created.`,
      });
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to create blog. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Blog> }) =>
      apiClient.updateBlog(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogs', data.id] });
      toast({
        title: 'Success',
        description: `Blog "${data.title}" has been updated.`,
      });
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to update blog. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast({
        title: 'Success',
        description: 'Blog has been deleted.',
      });
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to delete blog. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};
