import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isSameDay, addDays } from 'date-fns';

interface Medication {
  id: number;
  name: string;
  scheduledTime: string;
}

const UpcomingReminders: React.FC = () => {
  const { data: medications, isLoading, isError } = useQuery<any[]>({
    queryKey: ['/api/today-medications'],
  });

  const formatUpcomingTime = (scheduledTime: string): string => {
    const scheduleDate = new Date(scheduledTime);
    const now = new Date();
    
    if (isSameDay(scheduleDate, now)) {
      return `Today, ${format(scheduleDate, 'h:mm a')}`;
    } else if (isSameDay(scheduleDate, addDays(now, 1))) {
      return `Tomorrow, ${format(scheduleDate, 'h:mm a')}`;
    } else {
      return format(scheduleDate, 'EEE, h:mm a');
    }
  };

  const getUpcomingMedications = () => {
    if (!medications) return [];
    
    const now = new Date();
    return medications
      .filter(med => med.status === 'upcoming' || (
        med.status !== 'taken' && new Date(med.scheduledTime) > now
      ))
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
      .slice(0, 3);
  };

  const upcomingMedications = getUpcomingMedications();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-neutral-500 mb-4">Upcoming Reminders</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-neutral-200">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-neutral-500 mb-4">Upcoming Reminders</h2>
        <div className="p-4 text-center">
          <p className="text-red-500">Error loading reminders. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-medium text-neutral-500 mb-4">Upcoming Reminders</h2>
      
      <div className="space-y-4">
        {upcomingMedications.length > 0 ? (
          upcomingMedications.map((medication, index) => (
            <div key={medication.id} className={`flex items-center justify-between py-3 ${
              index < upcomingMedications.length - 1 ? 'border-b border-neutral-200' : ''
            }`}>
              <div className="flex items-center">
                <div className="bg-primary bg-opacity-10 rounded-full p-2 mr-3">
                  <span className="material-icons text-primary">medication</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-500">{medication.name}</h3>
                  <p className="text-xs text-neutral-300">{formatUpcomingTime(medication.scheduledTime)}</p>
                </div>
              </div>
              <button className="text-neutral-300 hover:text-neutral-400">
                <span className="material-icons">notifications</span>
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-neutral-400">No upcoming reminders</p>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <Button variant="outline" className="w-full py-2 text-primary text-sm font-medium border border-primary rounded-md hover:bg-primary hover:bg-opacity-5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          View All Reminders
        </Button>
      </div>
    </div>
  );
};

export default UpcomingReminders;
