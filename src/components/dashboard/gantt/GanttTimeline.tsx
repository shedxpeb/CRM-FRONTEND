import { useMemo, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { GanttPhase } from "@/features/dashboard/data/projectMockData";

interface Props {
  phases: GanttPhase[];
  collapsedPhases: Set<string>;
  hoveredTask: string | null;
  onHoverTask: (taskId: string | null) => void;
  phaseColors: Record<string, string>;
  taskColors: Record<string, string>;
  startDate: string;
  endDate: string;
  totalDays: number;
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

// Helper function to calculate position and width
function calculateBarPosition(
  taskStart: string,
  taskEnd: string,
  timelineStart: Date,
  timelineEnd: Date
): { left: number; width: number } {
  const start = parseDate(taskStart);
  const end = parseDate(taskEnd);
  
  const totalTimeline = timelineEnd.getTime() - timelineStart.getTime();
  const taskStartOffset = start.getTime() - timelineStart.getTime();
  const taskDuration = end.getTime() - start.getTime();
  
  const left = (taskStartOffset / totalTimeline) * 100;
  const width = (taskDuration / totalTimeline) * 100;
  
  return { left: Math.max(0, left), width: Math.max(1, width) };
}

export function GanttTimeline({
  phases,
  collapsedPhases,
  hoveredTask,
  onHoverTask,
  phaseColors,
  taskColors,
  startDate,
  endDate,
  totalDays,
}: Props) {
  const timelineStart = parseDate(startDate);
  const timelineEnd = parseDate(endDate);
  
  const months = useMemo(() => getMonthsBetween(timelineStart, timelineEnd), [timelineStart, timelineEnd]);
  
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number; direction: 'left' | 'right' } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Smart tooltip positioning with auto-flip
  useEffect(() => {
    if (hoveredTask && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate position based on available space
      let x = rect.right + 8;
      let direction: 'left' | 'right' = 'right';
      
      // Flip to left if not enough space on right
      if (x + 200 > viewportWidth) {
        x = rect.left - 208;
        direction = 'left';
      }
      
      // Adjust y to stay within viewport
      let y = rect.top;
      if (y + 100 > viewportHeight) {
        y = viewportHeight - 108;
      }
      if (y < 0) {
        y = 8;
      }
      
      setTooltipPosition({ x, y, direction });
    } else {
      setTooltipPosition(null);
    }
  }, [hoveredTask]);
  
  return (
    <div className="flex-1">
      <div className="min-w-[600px]">
        {/* Timeline Rows */}
        {phases.map((phase) => {
          const isCollapsed = collapsedPhases.has(phase.name);
          const phasePosition = calculateBarPosition(phase.start, phase.end, timelineStart, timelineEnd);
          
          return (
            <div key={phase.name}>
              {/* Phase Bar */}
              <div className="relative border-b border-border/50 px-3" style={{ height: '36px' }}>
                <div className="absolute inset-0 grid grid-cols-6">
                  {months.map((_, i) => (
                    <div key={i} className="border-l border-border/20 first:border-l-0" />
                  ))}
                </div>
                <div
                  className={cn("absolute top-2 bottom-2 rounded-md", phaseColors[phase.name] || "bg-gray-500")}
                  style={{ left: `${phasePosition.left}%`, width: `${phasePosition.width}%` }}
                />
              </div>

              {/* Task Bars */}
              {!isCollapsed && (
                <div className="ml-4">
                  {phase.tasks.map((task) => {
                    const taskPosition = calculateBarPosition(task.start, task.end, timelineStart, timelineEnd);
                    
                    return (
                      <div
                        key={task.id}
                        className="relative border-b border-border/30 px-3"
                        style={{ height: '24px' }}
                        onMouseEnter={() => onHoverTask(task.id)}
                        onMouseLeave={() => onHoverTask(null)}
                      >
                        <div className="absolute inset-0 grid grid-cols-6">
                          {months.map((_, i) => (
                            <div key={i} className="border-l border-border/10 first:border-l-0" />
                          ))}
                        </div>
                        <div
                          ref={hoveredTask === task.id ? tooltipRef : null}
                          className={cn("absolute top-1 bottom-1 rounded-sm", taskColors[task.phase] || "bg-gray-400")}
                          style={{ left: `${taskPosition.left}%`, width: `${taskPosition.width}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Fixed positioned tooltip */}
      {hoveredTask && tooltipPosition && (
        <div
          className="fixed z-[100] bg-foreground text-background text-[10px] p-2 rounded shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in duration-200"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          {(() => {
            const allTasks = phases.flatMap(p => p.tasks);
            const task = allTasks.find(t => t.id === hoveredTask);
            if (!task) return null;
            return (
              <>
                <div className="font-semibold">{task.name}</div>
                <div>{task.duration}</div>
                <div>{task.start} - {task.end}</div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
