/**
 * Dashboard project timeline/gantt types.
 * Shapes are populated from the aggregated `/dashboard/gantt` endpoint.
 */

export type ProjectStatus = "On Track" | "At Risk" | "Overdue" | "Completed" | "Cancelled";

export interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  phase: string;
  color: string;
  durationDays: number;
  progress: number;
  description?: string | null;
  owner?: string | null;
  priority?: string;
  status?: string;
}

export interface GanttPhase {
  name: string;
  startDate: Date;
  endDate: Date;
  color: string;
  tasks: GanttTask[];
}
