import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useMedications() {
  const { toast } = useToast();

  const { data: medications, isLoading, isError } = useQuery({
    queryKey: ['/api/medications'],
  });

  const { data: todayMedications, isLoading: isTodayLoading, isError: isTodayError } = useQuery({
    queryKey: ['/api/today-medications'],
  });

  const { data: adherenceData, isLoading: isAdherenceLoading, isError: isAdherenceError } = useQuery({
    queryKey: ['/api/adherence'],
  });

  const addMedicationMutation = useMutation({
    mutationFn: async (medicationData: any) => {
      const response = await apiRequest('POST', '/api/medications', medicationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/today-medications'] });
      toast({
        title: 'Success',
        description: 'Medication added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add medication',
        variant: 'destructive',
      });
    },
  });

  const markAsTakenMutation = useMutation({
    mutationFn: async (logId: number) => {
      const response = await apiRequest('PUT', `/api/medication-logs/${logId}/mark-as-taken`, {
        takenTime: new Date().toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/today-medications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/adherence'] });
      toast({
        title: 'Success',
        description: 'Medication marked as taken',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark medication as taken',
        variant: 'destructive',
      });
    },
  });

  return {
    // Queries
    medications,
    todayMedications,
    adherenceData,
    
    // Loading states
    isLoading,
    isTodayLoading,
    isAdherenceLoading,
    
    // Error states
    isError,
    isTodayError,
    isAdherenceError,
    
    // Mutations
    addMedication: addMedicationMutation.mutate,
    markAsTaken: markAsTakenMutation.mutate,
    
    // Mutation states
    isAddingMedication: addMedicationMutation.isPending,
    isMarkingAsTaken: markAsTakenMutation.isPending,
  };
}
