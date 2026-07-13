import { useMemo } from "react";

interface Props {
  startDate: string;
  endDate: string;
}

// Helper function to convert "DD Mon" format to date
function parseDate(dateStr: string): Date {
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  const [day, month] = dateStr.split(' ');
  const year = 2026; // Fixed year for demo
  return new Date(year, months[month], parseInt(day));
}

// Helper function to get month array between two dates
function getMonthsBetween(startDate: Date, endDate: Date): string[] {
  const months: string[] = [];
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  
  const current = new Date(startDate);
  current.setDate(1); // Set to first day of month
  
  while (current <= endDate) {
    months.push(`${monthNames[current.getMonth()]} '${current.getFullYear().toString().slice(-2)}`);
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
}

export function GanttTimelineHeader({ startDate, endDate }: Props) {
  const timelineStart = parseDate(startDate);
  const timelineEnd = parseDate(endDate);
  
  const months = useMemo(() => getMonthsBetween(timelineStart, timelineEnd), [timelineStart, timelineEnd]);
  
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-0 px-3 py-2 bg-muted/30">
      {months.map((month) => (
        <div key={month} className="text-[10px] font-semibold text-muted-foreground text-center border-l border-border/30 first:border-l-0">
          {month}
        </div>
      ))}
    </div>
  );
}
