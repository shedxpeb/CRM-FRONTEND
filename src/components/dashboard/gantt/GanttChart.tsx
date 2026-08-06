import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardGantt } from "@/features/dashboard/hooks/useDashboardGantt";
import type { GanttProject } from "@/features/dashboard/services/dashboardApi";
import type { GanttPhase, GanttTask } from "@/features/dashboard/data/projectTypes";
import { GanttHeader } from "./GanttHeader";
import { GanttTable } from "./GanttTable";
import { GanttTimeline } from "./GanttTimeline";
import { GanttTimelineHeader } from "./GanttTimelineHeader";
import { GanttLegend } from "./GanttLegend";

const PHASE_COLORS: Record<string, string> = {
  "Design": "bg-blue-500",
  "Planning & Design": "bg-blue-500",
  "Procurement": "bg-orange-500",
  "Fabrication": "bg-purple-500",
  "Shipping": "bg-cyan-500",
  "Dispatch": "bg-cyan-500",
  "Erection": "bg-green-500",
  "Installation": "bg-green-500",
  "Site Execution": "bg-green-500",
  "Handover": "bg-red-500",
};

const TASK_COLORS: Record<string, string> = {
  "Design": "bg-blue-400",
  "Planning & Design": "bg-blue-400",
  "Procurement": "bg-orange-400",
  "Fabrication": "bg-purple-400",
  "Shipping": "bg-cyan-400",
  "Dispatch": "bg-cyan-400",
  "Erection": "bg-green-400",
  "Installation": "bg-green-400",
  "Site Execution": "bg-green-400",
  "Handover": "bg-red-400",
};

interface GanttData {
  phases: GanttPhase[];
  totalPhases: number;
  totalTasks: number;
  startDate: Date | null;
  endDate: Date | null;
  totalDays: number;
}

interface Props {
  selectedProjectId?: string;
}

const DAY_MS = 86400000;

function durationDays(start: Date, end: Date) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1);
}

// Transform an aggregated GanttProject into the local gantt phase/task shape
function toGanttData(project: GanttProject | undefined): GanttData {
  if (!project) {
    return {
      phases: [],
      totalPhases: 0,
      totalTasks: 0,
      startDate: null,
      endDate: null,
      totalDays: 0,
    };
  }

  const phases: GanttPhase[] = project.phases.map((phase) => {
    const color = PHASE_COLORS[phase.name] || "bg-gray-500";
    const taskColor = TASK_COLORS[phase.name] || "bg-gray-400";

    const tasks: GanttTask[] = phase.tasks.map((t) => ({
      id: t.id,
      name: t.name,
      startDate: t.startDate,
      endDate: t.endDate,
      phase: phase.name,
      color: taskColor,
      durationDays: durationDays(t.startDate, t.endDate),
      progress: t.progress,
      description: t.description,
      owner: t.owner,
      priority: t.priority,
      status: t.status,
    }));

    return {
      name: phase.name,
      startDate: phase.startDate,
      endDate: phase.endDate,
      color,
      tasks,
    };
  });

  const allStarts = phases.flatMap((ph) => [ph.startDate, ...ph.tasks.map((t) => t.startDate)]);
  const allEnds = phases.flatMap((ph) => [ph.endDate, ...ph.tasks.map((t) => t.endDate)]);
  const startDate = allStarts.length > 0 ? new Date(Math.min(...allStarts.map((d) => d.getTime()))) : null;
  const endDate = allEnds.length > 0 ? new Date(Math.max(...allEnds.map((d) => d.getTime()))) : null;

  return {
    phases,
    totalPhases: phases.length,
    totalTasks: phases.reduce((sum, ph) => sum + ph.tasks.length, 0),
    startDate,
    endDate,
    totalDays: startDate && endDate ? durationDays(startDate, endDate) : 0,
  };
}

export function GanttChart({ selectedProjectId }: Props) {
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(true);

  const { data, isLoading } = useDashboardGantt(Boolean(selectedProjectId), selectedProjectId);
  const selectedProject = data?.projects.find((p) => p.id === selectedProjectId);

  const ganttData = useMemo(() => toGanttData(selectedProject), [selectedProject]);

  const togglePhase = (e: React.MouseEvent, phaseName: string) => {
    e.stopPropagation();
    setCollapsedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phaseName)) {
        newSet.delete(phaseName);
      } else {
        newSet.add(phaseName);
      }
      return newSet;
    });
  };

  const toggleTimeline = () => {
    setShowTimeline(prev => !prev);
  };

  if (!selectedProjectId) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="text-sm font-semibold">Detailed project Gantt chart</div>
          <p className="mt-2 text-xs text-muted-foreground">
            Select a project from the timeline above to view its phased Gantt chart with tasks.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="text-sm font-semibold">Detailed project Gantt chart</div>
          <p className="mt-2 text-xs text-muted-foreground">Loading Gantt chart…</p>
        </CardContent>
      </Card>
    );
  }

  if (ganttData.phases.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="text-sm font-semibold">Detailed project Gantt chart</div>
          <p className="mt-2 text-xs text-muted-foreground">
            {selectedProject
              ? `No tasks scheduled for “${selectedProject.projectName}” yet. The Gantt chart will appear here once tasks with start/due dates are created.`
              : 'No tasks scheduled for this project yet.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <GanttHeader
            ganttData={ganttData}
            showTimeline={showTimeline}
            onToggleTimeline={toggleTimeline}
          />

          <div className="flex flex-col">
            {/* Header Row - Sticky */}
            <div className="flex border-b border-border">
              <div className="w-full sm:w-[350px] flex-shrink-0 border-r border-border">
                <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 px-3 py-2 bg-muted/30">
                  <div className="text-[10px] font-semibold text-muted-foreground">TASK</div>
                  <div className="text-[10px] font-semibold text-muted-foreground text-center">DURATION</div>
                  <div className="text-[10px] font-semibold text-muted-foreground text-center">START</div>
                  <div className="text-[10px] font-semibold text-muted-foreground text-center">END</div>
                </div>
              </div>
              {showTimeline && (
                <div className="flex-1 overflow-hidden">
                  <GanttTimelineHeader
                    startDate={ganttData.startDate}
                    endDate={ganttData.endDate}
                  />
                </div>
              )}
            </div>

            {/* Single Scroll Container */}
            <div className="flex overflow-auto">
              <GanttTable
                phases={ganttData.phases}
                collapsedPhases={collapsedPhases}
                onTogglePhase={togglePhase}
                hoveredTask={hoveredTask}
                onHoverTask={setHoveredTask}
                phaseColors={PHASE_COLORS}
                taskColors={TASK_COLORS}
              />

              {showTimeline && (
                <GanttTimeline
                  phases={ganttData.phases}
                  collapsedPhases={collapsedPhases}
                  hoveredTask={hoveredTask}
                  onHoverTask={setHoveredTask}
                  phaseColors={PHASE_COLORS}
                  taskColors={TASK_COLORS}
                  startDate={ganttData.startDate}
                  endDate={ganttData.endDate}
                  totalDays={ganttData.totalDays}
                />
              )}
            </div>
          </div>

          <GanttLegend phases={ganttData.phases} />
        </div>
      </CardContent>
    </Card>
  );
}
