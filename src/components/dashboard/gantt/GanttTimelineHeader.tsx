import { useMemo } from "react";

interface Props {
  startDate: Date | null;
  endDate: Date | null;
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
  const months = useMemo(() => {
    if (!startDate || !endDate) return [];
    return getMonthsBetween(startDate, endDate);
  }, [startDate, endDate]);

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
