import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';

interface MedicationLog {
  id: number;
  medicationId: number;
  scheduledTime: string;
  status: 'upcoming' | 'taken' | 'missed';
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
}

const Calendar: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Fetch all medications
  const { data: medications } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  // Fetch medication logs for the current month
  const { data: medicationLogs, isLoading } = useQuery<MedicationLog[]>({
    queryKey: ['/api/medication-logs', 'month', format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await fetch(`/api/medication-logs?week=${format(date, 'yyyy-MM-dd')}&view=month`);
      if (!response.ok) {
        throw new Error('Failed to fetch medication logs');
      }
      return response.json();
    },
  });

  // Group medication logs by date
  const logsByDate = React.useMemo(() => {
    if (!medicationLogs) return new Map<string, MedicationLog[]>();
    
    const groupedLogs = new Map<string, MedicationLog[]>();
    medicationLogs.forEach(log => {
      const dateKey = format(new Date(log.scheduledTime), 'yyyy-MM-dd');
      const logsForDate = groupedLogs.get(dateKey) || [];
      logsForDate.push(log);
      groupedLogs.set(dateKey, logsForDate);
    });
    
    return groupedLogs;
  }, [medicationLogs]);

  // Get medications for the selected date
  const selectedDateLogs = React.useMemo(() => {
    if (!selectedDate || !medicationLogs) return [];
    
    return medicationLogs.filter(log => 
      isSameDay(parseISO(log.scheduledTime), selectedDate)
    );
  }, [selectedDate, medicationLogs]);

  // Find medication details by ID
  const getMedicationById = (id: number) => {
    return medications?.find(med => med.id === id);
  };

  const formatTime = (timeString: string): string => {
    try {
      return format(new Date(timeString), 'h:mm a');
    } catch (error) {
      return timeString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'taken':
        return (
          <Badge variant="secondary" className="ml-2">
            Taken
          </Badge>
        );
      case 'upcoming':
        return (
          <Badge className="ml-2 bg-primary text-white">
            Upcoming
          </Badge>
        );
      case 'missed':
        return (
          <Badge variant="destructive" className="ml-2">
            Missed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-500">Monthly Calendar</h1>
          <p className="text-neutral-400">Track your medication schedule and adherence</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <Skeleton className="h-[350px] w-full" />
              ) : (
                <CalendarUI
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={date}
                  onMonthChange={setDate}
                  className="rounded-md border"
                  modifiers={{
                    today: isToday,
                    selected: day => selectedDate ? isSameDay(day, selectedDate) : false,
                    highlighted: day => {
                      const dateKey = format(day, 'yyyy-MM-dd');
                      return (logsByDate.get(dateKey) || []).length > 0;
                    }
                  }}
                  modifiersClassNames={{
                    today: 'bg-primary text-white',
                    selected: 'border-2 border-primary text-primary',
                    highlighted: 'bg-primary/10'
                  }}
                  components={{
                    Day: (props) => {
                      const { date: day } = props;
                      const dateKey = format(day, 'yyyy-MM-dd');
                      const logs = logsByDate.get(dateKey) || [];
                      
                      // Count logs by status
                      const takenCount = logs.filter(log => log.status === 'taken').length;
                      const missedCount = logs.filter(log => log.status === 'missed').length;
                      const upcomingCount = logs.filter(log => log.status === 'upcoming').length;
                      
                      const hasLogs = logs.length > 0;
                      
                      return (
                        <div className="relative flex items-center justify-center w-full h-full">
                          <div className="flex items-center justify-center h-9 w-9">
                            {format(day, 'd')}
                          </div>
                          {hasLogs && (
                            <div className="absolute -bottom-1 flex gap-1">
                              {takenCount > 0 && (
                                <span className="block h-1.5 w-1.5 rounded-full bg-secondary"></span>
                              )}
                              {missedCount > 0 && (
                                <span className="block h-1.5 w-1.5 rounded-full bg-destructive"></span>
                              )}
                              {upcomingCount > 0 && (
                                <span className="block h-1.5 w-1.5 rounded-full bg-primary"></span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  }}
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-neutral-500 mb-4">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
              </h2>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-neutral-200 rounded-lg p-4">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : selectedDateLogs.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateLogs.map((log) => {
                    const medication = getMedicationById(log.medicationId);
                    return (
                      <div key={log.id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-neutral-500">
                              {medication?.name || 'Unknown medication'}
                              {getStatusBadge(log.status)}
                            </h3>
                            <p className="text-sm text-neutral-300">{medication?.dosage}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center">
                          <span className="material-icons text-sm mr-1 text-primary">
                            schedule
                          </span>
                          <span className="text-sm text-primary">
                            {formatTime(log.scheduledTime)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-neutral-400">No medications scheduled for this day.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Calendar;