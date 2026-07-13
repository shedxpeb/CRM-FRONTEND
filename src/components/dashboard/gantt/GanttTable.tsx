import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GanttPhase } from "@/features/dashboard/data/projectMockData";

interface Props {
  phases: GanttPhase[];
  collapsedPhases: Set<string>;
  onTogglePhase: (e: React.MouseEvent, phaseName: string) => void;
  hoveredTask: string | null;
  onHoverTask: (taskId: string | null) => void;
  phaseColors: Record<string, string>;
  taskColors: Record<string, string>;
}

export function GanttTable({
  phases,
  collapsedPhases,
  onTogglePhase,
  hoveredTask,
  onHoverTask,
  phaseColors,
  taskColors,
}: Props) {
  return (
    <div className="w-full sm:w-[350px] flex-shrink-0 border-r border-border">
      {/* Table Rows */}
      {phases.map((phase) => {
        const isCollapsed = collapsedPhases.has(phase.name);
        
        return (
          <div key={phase.name}>
            {/* Phase Row */}
            <div
              className="grid grid-cols-[40px_1fr_60px_60px_60px] gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50 items-center border-b border-border/50"
              style={{ height: '36px' }}
              onClick={(e) => onTogglePhase(e, phase.name)}
            >
              <div className="flex items-center gap-2 col-span-2">
                {isCollapsed ? (
                  <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronUp className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
                <div className={cn("h-2 w-2 rounded-full flex-shrink-0", phaseColors[phase.name] || "bg-gray-500")} />
                <span className="text-[11px] font-semibold truncate">{phase.name}</span>
              </div>
              <div className="text-[10px] text-muted-foreground text-center">{phase.duration}</div>
              <div className="text-[10px] text-muted-foreground text-center">{phase.start}</div>
              <div className="text-[10px] text-muted-foreground text-center">{phase.end}</div>
            </div>

            {/* Task Rows */}
            {!isCollapsed && (
              <div className="ml-4">
                {phase.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-[40px_1fr_60px_60px_60px] gap-2 px-3 py-1.5 hover:bg-muted/30 items-center border-b border-border/30"
                    style={{ height: '24px' }}
                    onMouseEnter={() => onHoverTask(task.id)}
                    onMouseLeave={() => onHoverTask(null)}
                  >
                    <div className="text-[10px] text-muted-foreground text-center">{task.id}</div>
                    <div className="text-[10px] truncate">{task.name}</div>
                    <div className="text-[10px] text-muted-foreground text-center">{task.duration}</div>
                    <div className="text-[10px] text-muted-foreground text-center">{task.start}</div>
                    <div className="text-[10px] text-muted-foreground text-center">{task.end}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
