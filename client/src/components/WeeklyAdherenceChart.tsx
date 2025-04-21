import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AdherenceData {
  adherenceByDay: {
    day: string;
    taken: number;
    missed: number;
    upcoming: number;
    total: number;
    adherenceRate: number;
  }[];
  overallAdherence: number;
}

const WeeklyAdherenceChart: React.FC = () => {
  const { data, isLoading, isError } = useQuery<AdherenceData>({
    queryKey: ['/api/adherence'],
  });

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.adherenceByDay.map(day => ({
      name: day.day,
      Taken: day.taken,
      Missed: day.missed,
      Upcoming: day.upcoming,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-neutral-500 mb-4">Weekly Medication Adherence</h2>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-neutral-400">Overall Adherence</span>
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-neutral-500 mb-4">Weekly Medication Adherence</h2>
        <div className="p-4 text-center">
          <p className="text-red-500">Error loading adherence data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-medium text-neutral-500 mb-4">Weekly Medication Adherence</h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-400">Overall Adherence</span>
          <span className="text-sm font-medium text-secondary">{data.overallAdherence}%</span>
        </div>
        <Progress value={data.overallAdherence} className="h-2.5 bg-neutral-200" indicatorClassName="bg-secondary" />
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 5,
              left: 0,
              bottom: 5,
            }}
            barGap={0}
            barSize={12}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#616161' }}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '6px', 
                border: 'none', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)' 
              }}
            />
            <Bar dataKey="Taken" stackId="a" fill="#34A853" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Missed" stackId="a" fill="#EA4335" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Upcoming" stackId="a" fill="#4285F4" radius={[4, 4, 0, 0]} opacity={0.4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 flex justify-center">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-secondary rounded-sm mr-1"></div>
          <span className="text-xs text-neutral-400">Taken</span>
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-accent rounded-sm mr-1"></div>
          <span className="text-xs text-neutral-400">Missed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary opacity-40 rounded-sm mr-1"></div>
          <span className="text-xs text-neutral-400">Upcoming</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyAdherenceChart;
