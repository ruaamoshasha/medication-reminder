import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { medicationFormSchema } from '@shared/schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type DayOfWeek = 'M' | 'T' | 'W' | 'Th' | 'F' | 'Sa' | 'Su';

const daysOfWeek: { key: DayOfWeek; label: string }[] = [
  { key: 'M', label: 'M' },
  { key: 'T', label: 'T' },
  { key: 'W', label: 'W' },
  { key: 'Th', label: 'Th' },
  { key: 'F', label: 'F' },
  { key: 'Sa', label: 'Sa' },
  { key: 'Su', label: 'Su' },
];

const MedicationForm: React.FC = () => {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: '',
      dosage: '',
      reminderTime: '',
      frequency: 'daily',
      daysOfWeek: {
        M: true,
        T: true,
        W: true,
        Th: true,
        F: true,
        Sa: false,
        Su: false,
      },
      notes: '',
    },
  });

  const addMedicationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/medications', data);
      const medication = await response.json();
      return medication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/today-medications'] });
      toast({
        title: 'Medication Added',
        description: 'Your medication has been successfully added.',
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Failed to Add Medication',
        description: error.message || 'There was an error adding your medication.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: any) => {
    addMedicationMutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-medium text-neutral-500 mb-4">Add Medication</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-400">
                  Medication Name
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter medication name" 
                    className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dosage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-400">Dosage</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. 10mg, 1 pill" 
                    className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-400">Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reminderTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-neutral-300">Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-neutral-300">Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="twice-daily">Twice Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <FormLabel className="block text-sm font-medium text-neutral-400">
              Days of Week
            </FormLabel>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <FormField
                  key={day.key}
                  control={form.control}
                  name={`daysOfWeek.${day.key}`}
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <label
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-sm cursor-pointer",
                            field.value
                              ? "bg-primary bg-opacity-10 text-primary hover:bg-opacity-20"
                              : "bg-neutral-200 text-neutral-400 hover:bg-neutral-300"
                          )}
                          onClick={() => field.onChange(!field.value)}
                        >
                          <input type="checkbox" className="sr-only" {...field} checked={field.value} />
                          {day.label}
                        </label>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-400">
                  Notes (optional)
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add any special instructions" 
                    className="w-full p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={addMedicationMutation.isPending}
            >
              {addMedicationMutation.isPending ? 'Adding...' : 'Add Medication'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MedicationForm;
