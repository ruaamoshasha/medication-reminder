import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  logId: number;
  medicationName: string;
  dosage: string;
}

const Notifications: React.FC = () => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const { data: medications } = useQuery<any[]>({
    queryKey: ['/api/today-medications'],
    refetchInterval: 60000, // Refetch every minute to check for new medications
  });

  React.useEffect(() => {
    // Check for upcoming medications that are due in the next 5 minutes
    if (medications) {
      const now = new Date();
      const upcomingMed = medications.find(med => {
        if (med.status !== 'upcoming') return false;
        
        const scheduleTime = new Date(med.scheduledTime);
        const diffMinutes = (scheduleTime.getTime() - now.getTime()) / (1000 * 60);
        
        return diffMinutes >= 0 && diffMinutes <= 5;
      });
      
      if (upcomingMed && !notification) {
        setNotification({
          logId: upcomingMed.logId,
          medicationName: upcomingMed.name,
          dosage: upcomingMed.dosage,
        });
      }
    }
  }, [medications, notification]);

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
      setNotification(null);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark medication as taken.',
        variant: 'destructive',
      });
    },
  });

  const handleTakeMedication = () => {
    if (notification) {
      markAsTakenMutation.mutate(notification.logId);
    }
  };

  const handleDismissNotification = () => {
    setNotification(null);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-secondary bg-opacity-10 rounded-lg shadow-lg p-4 mb-4 flex items-start max-w-sm"
          >
            <span className="material-icons text-secondary mr-3">check_circle</span>
            <div>
              <h3 className="font-medium text-neutral-500">Medication marked as taken</h3>
              <p className="text-sm text-neutral-300">Well done!</p>
            </div>
          </motion.div>
        )}

        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-lg shadow-lg p-4 mb-4 flex items-start max-w-sm border-l-4 border-secondary"
          >
            <span className="material-icons text-secondary mr-3">check_circle</span>
            <div>
              <h3 className="font-medium text-neutral-500">It's time for your medication</h3>
              <p className="text-sm text-neutral-300">{notification.medicationName} - {notification.dosage}</p>
              <div className="mt-2 flex space-x-2">
                <Button 
                  className="px-3 py-1 bg-secondary text-white text-sm rounded-md hover:bg-green-600"
                  onClick={handleTakeMedication}
                  disabled={markAsTakenMutation.isPending}
                >
                  Take now
                </Button>
                <Button 
                  variant="outline"
                  className="px-3 py-1 bg-white text-neutral-400 text-sm border border-neutral-200 rounded-md hover:bg-neutral-100"
                  onClick={handleDismissNotification}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button 
        className="flex items-center justify-center w-12 h-12 bg-primary rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-label="Add new medication"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <span className="material-icons text-white">add</span>
      </Button>
    </div>
  );
};

export default Notifications;
