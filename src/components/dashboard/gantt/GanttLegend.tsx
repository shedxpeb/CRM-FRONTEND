import { cn } from "@/lib/utils";
import type { GanttPhase } from "@/features/dashboard/data/projectMockData";

interface Props {
  phases: GanttPhase[];
}

export function GanttLegend({ phases }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
      <div className="text-[10px] text-muted-foreground">Legend:</div>
      {phases.map((phase) => (
        <div key={phase.name} className="flex items-center gap-1.5">
          <div className={cn("h-3 w-3 rounded-sm", phase.color)} />
          <span className="text-[10px] text-muted-foreground">{phase.name}</span>
        </div>
      ))}
      <div className="text-[10px] text-muted-foreground ml-auto">
        Hover any task bar for full description, owner and progress. Click a phase row to collapse its tasks.
      </div>
    </div>
  );
}
