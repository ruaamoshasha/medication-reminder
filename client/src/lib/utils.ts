import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeString: string): string {
  try {
    // Handle HH:MM format
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return format(date, 'h:mm a');
    }
    
    // Handle ISO date string
    return format(parseISO(timeString), 'h:mm a');
  } catch (error) {
    return timeString;
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMM d');
  } catch (error) {
    return dateString;
  }
}

export function getDayAbbreviation(day: string): string {
  const days: Record<string, string> = {
    'monday': 'M',
    'tuesday': 'T',
    'wednesday': 'W',
    'thursday': 'Th',
    'friday': 'F',
    'saturday': 'Sa',
    'sunday': 'Su'
  };
  
  return days[day.toLowerCase()] || day;
}

export function formatDaysOfWeek(daysObj: Record<string, boolean>): string {
  const selectedDays = Object.entries(daysObj)
    .filter(([_, selected]) => selected)
    .map(([day]) => day);
  
  if (selectedDays.length === 7) return 'Daily (All days)';
  if (selectedDays.length === 0) return 'No days selected';
  
  return `Daily (${selectedDays.join(',')})`;
}
