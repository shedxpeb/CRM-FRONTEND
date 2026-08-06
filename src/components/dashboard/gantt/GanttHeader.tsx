import { Button } from "@/components/ui/button";
import { Scissors } from "lucide-react";

interface GanttData {
  totalPhases: number;
  totalTasks: number;
  startDate: Date | null;
  endDate: Date | null;
  totalDays: number;
}

interface Props {
  ganttData: GanttData;
  showTimeline: boolean;
  onToggleTimeline: () => void;
}

function fmtDate(date: Date | null) {
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function GanttHeader({ ganttData, showTimeline, onToggleTimeline }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold">
          Detailed project Gantt chart
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {ganttData.totalPhases} phases · {ganttData.totalTasks} tasks · {fmtDate(ganttData.startDate)} → {fmtDate(ganttData.endDate)} ({ganttData.totalDays} days)
        </div>
      </div>
      <Button 
        variant="default" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={onToggleTimeline}
      >
        <Scissors className="h-4 w-4" />
        {showTimeline ? "Hide Gantt Chart" : "Show Gantt Chart"}
      </Button>
    </div>
  );
}
