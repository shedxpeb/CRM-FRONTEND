import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { projects, type GanttPhase, type Phase, type Task } from "@/features/dashboard/data/projectMockData";
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
  "Erection": "bg-green-500",
  "Site Execution": "bg-green-500",
  "Handover": "bg-red-500",
};

const TASK_COLORS: Record<string, string> = {
  "Design": "bg-blue-400",
  "Planning & Design": "bg-blue-400",
  "Procurement": "bg-orange-400",
  "Fabrication": "bg-purple-400",
  "Shipping": "bg-cyan-400",
  "Erection": "bg-green-400",
  "Site Execution": "bg-green-400",
  "Handover": "bg-red-400",
};

interface Props {
  selectedProjectId?: string;
}

// Helper function to convert ISO date to "DD Mon" format
function formatGanttDate(isoDate: string): string {
  const date = new Date(isoDate);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = date.getDate();
  const month = months[date.getMonth()];
  return `${day} ${month}`;
}

// Helper function to calculate duration in days
function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days`;
}

// Transform project phases to Gantt format
function transformProjectToGanttData(projectId?: string) {
  if (!projectId) {
    // Return default detailed Gantt data if no project selected
    return null;
  }

  const selectedProject = projects.find(p => p.id === projectId);
  if (!selectedProject) {
    return null;
  }

  const ganttPhases: GanttPhase[] = selectedProject.phases.map((phase, index) => {
    const color = PHASE_COLORS[phase.name] || "bg-gray-500";
    const taskColor = TASK_COLORS[phase.name] || "bg-gray-400";
    
    // Transform tasks if they exist, otherwise create placeholder tasks
    const tasks: GanttPhase["tasks"] = phase.tasks.length > 0 
      ? phase.tasks.map((task, taskIndex) => ({
          id: `${index + 1}.${taskIndex + 1}`,
          name: task.name,
          duration: calculateDuration(task.start, task.end),
          start: formatGanttDate(task.start),
          end: formatGanttDate(task.end),
          phase: phase.name,
          color: taskColor,
        }))
      : [
          {
            id: `${index + 1}.1`,
            name: `${phase.name} Task 1`,
            duration: calculateDuration(phase.start, phase.end),
            start: formatGanttDate(phase.start),
            end: formatGanttDate(phase.end),
            phase: phase.name,
            color: taskColor,
          }
        ];

    return {
      name: phase.name,
      duration: calculateDuration(phase.start, phase.end),
      start: formatGanttDate(phase.start),
      end: formatGanttDate(phase.end),
      color: color,
      tasks: tasks,
    };
  });

  // Calculate overall stats
  const totalPhases = ganttPhases.length;
  const totalTasks = ganttPhases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  
  // Find earliest start and latest end
  const allDates = ganttPhases.flatMap(phase => [
    new Date(selectedProject.phases.find(p => p.name === phase.name)?.start || phase.start),
    new Date(selectedProject.phases.find(p => p.name === phase.name)?.end || phase.end)
  ]);
  const startDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const endDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return {
    phases: ganttPhases,
    totalPhases,
    totalTasks,
    startDate: formatGanttDate(startDate.toISOString()),
    endDate: formatGanttDate(endDate.toISOString()),
    totalDays,
  };
}

export function GanttChart({ selectedProjectId }: Props) {
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(true);

  // Compute Gantt data from selected project - fully controlled
  const ganttData = useMemo(() => {
    const data = transformProjectToGanttData(selectedProjectId);
    return data || {
      phases: [],
      totalPhases: 0,
      totalTasks: 0,
      startDate: "",
      endDate: "",
      totalDays: 0,
    };
  }, [selectedProjectId]);

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
                <div className="grid grid-cols-[40px_1fr_60px_60px_60px] gap-2 px-3 py-2 bg-muted/30">
                  <div className="text-[10px] font-semibold text-muted-foreground text-center">ID</div>
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
