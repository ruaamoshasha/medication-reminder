import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface MedicationWithStatus {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  daysOfWeek: Record<string, boolean>;
  reminderTime: string;
  status: 'taken' | 'upcoming' | 'missed';
  scheduledTime: string;
  logId: number;
}

const MedicationList: React.FC = () => {
  const { toast } = useToast();
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMM d');

  const { data: medications, isLoading, isError } = useQuery<MedicationWithStatus[]>({
    queryKey: ['/api/today-medications'],
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
        title: 'Medication Taken',
        description: 'Your medication has been marked as taken.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark medication as taken.',
        variant: 'destructive',
      });
    },
  });

  const handleMarkAsTaken = (logId: number) => {
    markAsTakenMutation.mutate(logId);
  };

  const formatDaysOfWeek = (daysObj: Record<string, boolean>): string => {
    const selectedDays = Object.entries(daysObj)
      .filter(([_, selected]) => selected)
      .map(([day]) => day);
    
    if (selectedDays.length === 7) return 'Daily (All days)';
    if (selectedDays.length === 0) return 'No days selected';
    
    return `Daily (${selectedDays.join(',')})`;
  };

  const formatTime = (timeString: string): string => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return format(date, 'h:mm a');
    } catch (error) {
      return timeString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'taken':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-secondary mr-2">
            <span className="material-icons text-secondary mr-1 text-sm">check_circle</span>
            Taken
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-primary mr-2">
            <span className="material-icons text-primary mr-1 text-sm">notifications</span>
            Upcoming
          </span>
        );
      case 'missed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-accent mr-2">
            <span className="material-icons text-accent mr-1 text-sm">cancel</span>
            Missed
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-neutral-500">Today's Medications</h2>
          <span className="text-sm text-neutral-300">{formattedDate}</span>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="mt-2">
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-neutral-500">Today's Medications</h2>
          <span className="text-sm text-neutral-300">{formattedDate}</span>
        </div>
        <div className="p-4 text-center">
          <p className="text-red-500">Error loading medications. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-neutral-500">Today's Medications</h2>
        <span className="text-sm text-neutral-300">{formattedDate}</span>
      </div>
      
      <div className="space-y-4">
        {medications && medications.length > 0 ? (
          medications.map((medication) => (
            <div key={medication.id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-neutral-500">{medication.name}</h3>
                  <p className="text-sm text-neutral-300">{medication.dosage}</p>
                </div>
                <div className="flex items-center">
                  {getStatusBadge(medication.status)}
                  <button className="text-neutral-300 hover:text-neutral-400">
                    <span className="material-icons">more_vert</span>
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <span className={`material-icons text-sm mr-1 ${medication.status === 'missed' ? 'text-accent' : 'text-primary'}`}>
                  schedule
                </span>
                <span className={`text-sm ${medication.status === 'missed' ? 'text-accent' : 'text-primary'}`}>
                  {formatTime(medication.reminderTime)}
                </span>
                <span className="mx-2 text-neutral-300">•</span>
                <span className="text-sm text-neutral-300">
                  {formatDaysOfWeek(medication.daysOfWeek)}
                </span>
              </div>
              {medication.status !== 'taken' && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    onClick={() => handleMarkAsTaken(medication.logId)}
                    disabled={markAsTakenMutation.isPending}
                  >
                    Mark as Taken
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-neutral-400">No medications scheduled for today.</p>
            <p className="text-sm text-neutral-300 mt-2">Add a medication to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationList;
