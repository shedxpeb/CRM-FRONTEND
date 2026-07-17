/**
 * Dashboard project timeline/gantt types and live-safe empty datasets.
 * Fake sample projects were removed for production readiness.
 */

export type ProjectStatus = "On Track" | "At Risk" | "Overdue" | "Completed";
export type BuildingType = "Warehouse" | "Factory" | "Hangar" | "Cold Storage" | "Showroom" | "Workshop";

export interface Task {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  phase: string;
}

export interface Phase {
  name: string;
  start: string;
  end: string;
  progress: number;
  tasks: Task[];
}

export interface ProjectRow {
  id: string;
  customer: string;
  type: BuildingType;
  start: string;
  end: string;
  progress: number;
  status: ProjectStatus;
  phases: Phase[];
  totalTasks: number;
}

export interface GanttTask {
  id: string;
  name: string;
  duration: string;
  start: string;
  end: string;
  phase: string;
  color: string;
}

export interface GanttPhase {
  name: string;
  duration: string;
  start: string;
  end: string;
  color: string;
  tasks: GanttTask[];
}

export const TODAY = new Date();

export const detailedGanttData: {
  phases: GanttPhase[];
  totalPhases: number;
  totalTasks: number;
  startDate: string;
  endDate: string;
  totalDays: number;
} = {
  phases: [],
  totalPhases: 0,
  totalTasks: 0,
  startDate: "",
  endDate: "",
  totalDays: 0,
};

/** Populated from live project APIs when dashboard widgets are wired; empty until then. */
export const projects: ProjectRow[] = [];

export const projectStatusCounts: Record<
  ProjectStatus,
  { count: number; prev: number; share: number }
> = {
  "On Track": { count: 0, prev: 0, share: 0 },
  "At Risk": { count: 0, prev: 0, share: 0 },
  Overdue: { count: 0, prev: 0, share: 0 },
  Completed: { count: 0, prev: 0, share: 0 },
};
