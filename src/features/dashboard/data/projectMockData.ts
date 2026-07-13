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
  start: string; // ISO
  end: string;
  progress: number; // 0-100
  status: ProjectStatus;
  phases: Phase[];
  totalTasks: number;
}

// Detailed Gantt Chart Data
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

export const detailedGanttData: {
  phases: GanttPhase[];
  totalPhases: number;
  totalTasks: number;
  startDate: string;
  endDate: string;
  totalDays: number;
} = {
  phases: [
    {
      name: "Planning & Design",
      duration: "36 days",
      start: "05 Jan",
      end: "10 Feb",
      color: "bg-blue-500",
      tasks: [
        { id: "1.1", name: "Kickoff & requirements", duration: "4 days", start: "05 Jan", end: "09 Jan", phase: "Planning & Design", color: "bg-blue-400" },
        { id: "1.2", name: "Site survey & soil report", duration: "8 days", start: "08 Jan", end: "16 Jan", phase: "Planning & Design", color: "bg-blue-400" },
        { id: "1.3", name: "Concept design", duration: "11 days", start: "15 Jan", end: "26 Jan", phase: "Planning & Design", color: "bg-blue-400" },
        { id: "1.4", name: "Structural analysis", duration: "15 days", start: "22 Jan", end: "06 Feb", phase: "Planning & Design", color: "bg-blue-400" },
        { id: "1.5", name: "Client approval", duration: "5 days", start: "05 Feb", end: "10 Feb", phase: "Planning & Design", color: "bg-blue-400" },
      ],
    },
    {
      name: "Procurement",
      duration: "22 days",
      start: "11 Feb",
      end: "05 Mar",
      color: "bg-orange-500",
      tasks: [
        { id: "2.1", name: "Raise steel PO", duration: "3 days", start: "11 Feb", end: "14 Feb", phase: "Procurement", color: "bg-orange-400" },
        { id: "2.2", name: "Sheeting & accessories", duration: "9 days", start: "13 Feb", end: "22 Feb", phase: "Procurement", color: "bg-orange-400" },
        { id: "2.3", name: "Material inward & QC", duration: "10 days", start: "23 Feb", end: "05 Mar", phase: "Procurement", color: "bg-orange-400" },
      ],
    },
    {
      name: "Fabrication",
      duration: "47 days",
      start: "02 Mar",
      end: "18 Apr",
      color: "bg-purple-500",
      tasks: [
        { id: "3.1", name: "Cutting & built-up sections", duration: "18 days", start: "02 Mar", end: "20 Mar", phase: "Fabrication", color: "bg-purple-400" },
        { id: "3.2", name: "Welding & assembly", duration: "19 days", start: "16 Mar", end: "04 Apr", phase: "Fabrication", color: "bg-purple-400" },
        { id: "3.3", name: "Surface prep & painting", duration: "16 days", start: "02 Apr", end: "18 Apr", phase: "Fabrication", color: "bg-purple-400" },
      ],
    },
    {
      name: "Site Execution",
      duration: "92 days",
      start: "10 Mar",
      end: "10 Jun",
      color: "bg-green-500",
      tasks: [
        { id: "4.1", name: "Foundation & anchor bolts", duration: "31 days", start: "10 Mar", end: "10 Apr", phase: "Site Execution", color: "bg-green-400" },
        { id: "4.2", name: "Dispatch to site", duration: "10 days", start: "15 Apr", end: "25 Apr", phase: "Site Execution", color: "bg-green-400" },
        { id: "4.3", name: "Erection of main frames", duration: "28 days", start: "22 Apr", end: "20 May", phase: "Site Execution", color: "bg-green-400" },
        { id: "4.4", name: "Sheeting & cladding", duration: "26 days", start: "15 May", end: "10 Jun", phase: "Site Execution", color: "bg-green-400" },
      ],
    },
    {
      name: "Handover",
      duration: "17 days",
      start: "08 Jun",
      end: "25 Jun",
      color: "bg-red-500",
      tasks: [
        { id: "5.1", name: "Snag list & rectification", duration: "10 days", start: "08 Jun", end: "18 Jun", phase: "Handover", color: "bg-red-400" },
        { id: "5.2", name: "Final inspection & handover", duration: "7 days", start: "18 Jun", end: "25 Jun", phase: "Handover", color: "bg-red-400" },
      ],
    },
  ],
  totalPhases: 5,
  totalTasks: 17,
  startDate: "05 Jan",
  endDate: "25 Jun",
  totalDays: 171,
};

// Today fixed for deterministic demo (matches mock 2026 data)
export const TODAY = new Date("2026-06-12");

const rawProjects: Omit<ProjectRow, "status">[] = [
  { 
    id: "P-2101", 
    customer: "Acme Logistics",     
    type: "Warehouse",    
    start: "2026-01-08", 
    end: "2026-04-20", 
    progress: 100,
    phases: [
      { name: "Design", start: "2026-01-08", end: "2026-02-15", progress: 100, tasks: [] },
      { name: "Fabrication", start: "2026-02-16", end: "2026-03-30", progress: 100, tasks: [] },
      { name: "Shipping", start: "2026-03-31", end: "2026-04-10", progress: 100, tasks: [] },
      { name: "Erection", start: "2026-04-11", end: "2026-04-18", progress: 100, tasks: [] },
      { name: "Handover", start: "2026-04-19", end: "2026-04-20", progress: 100, tasks: [] },
    ],
    totalTasks: 17,
  },
  { 
    id: "P-2102", 
    customer: "BlueOak Industries", 
    type: "Factory",      
    start: "2026-01-22", 
    end: "2026-05-30", 
    progress: 92,
    phases: [
      { name: "Design", start: "2026-01-22", end: "2026-03-01", progress: 100, tasks: [] },
      { name: "Fabrication", start: "2026-03-02", end: "2026-05-15", progress: 95, tasks: [] },
      { name: "Shipping", start: "2026-05-16", end: "2026-05-25", progress: 80, tasks: [] },
      { name: "Erection", start: "2026-05-26", end: "2026-05-30", progress: 0, tasks: [] },
      { name: "Handover", start: "2026-05-31", end: "2026-05-30", progress: 0, tasks: [] },
    ],
    totalTasks: 21,
  },
  { 
    id: "P-2103", 
    customer: "Nimbus Aero",        
    type: "Hangar",       
    start: "2026-02-04", 
    end: "2026-06-30", 
    progress: 78,
    phases: [
      { name: "Design", start: "2026-02-04", end: "2026-03-15", progress: 100, tasks: [] },
      { name: "Fabrication", start: "2026-03-16", end: "2026-05-20", progress: 85, tasks: [] },
      { name: "Shipping", start: "2026-05-21", end: "2026-06-10", progress: 40, tasks: [] },
      { name: "Erection", start: "2026-06-11", end: "2026-06-28", progress: 0, tasks: [] },
      { name: "Handover", start: "2026-06-29", end: "2026-06-30", progress: 0, tasks: [] },
    ],
    totalTasks: 19,
  },
  { 
    id: "P-2104", 
    customer: "Coral Cold Chain",   
    type: "Cold Storage", 
    start: "2026-02-18", 
    end: "2026-06-05", 
    progress: 64,
    phases: [
      { name: "Design", start: "2026-02-18", end: "2026-03-25", progress: 100, tasks: [] },
      { name: "Fabrication", start: "2026-03-26", end: "2026-05-10", progress: 70, tasks: [] },
      { name: "Shipping", start: "2026-05-11", end: "2026-05-20", progress: 30, tasks: [] },
      { name: "Erection", start: "2026-05-21", end: "2026-06-03", progress: 0, tasks: [] },
      { name: "Handover", start: "2026-06-04", end: "2026-06-05", progress: 0, tasks: [] },
    ],
    totalTasks: 15,
  },
  { 
    id: "P-2105", 
    customer: "Summit Retail",      
    type: "Showroom",     
    start: "2026-03-01", 
    end: "2026-05-25", 
    progress: 48,
    phases: [
      { name: "Design", start: "2026-03-01", end: "2026-04-05", progress: 100, tasks: [] },
      { name: "Fabrication", start: "2026-04-06", end: "2026-05-15", progress: 50, tasks: [] },
      { name: "Shipping", start: "2026-05-16", end: "2026-05-22", progress: 0, tasks: [] },
      { name: "Erection", start: "2026-05-23", end: "2026-05-25", progress: 0, tasks: [] },
      { name: "Handover", start: "2026-05-26", end: "2026-05-25", progress: 0, tasks: [] },
    ],
    totalTasks: 12,
  },
  { 
    id: "P-2106", 
    customer: "Vertex Steel",       
    type: "Factory",      
    start: "2026-03-14", 
    end: "2026-07-10", 
    progress: 55,
    phases: [
      { name: "Design", start: "2026-03-14", end: "2026-04-20", progress: 100, tasks: [] },
      { name: "Fabrication", start: "2026-04-21", end: "2026-06-15", progress: 60, tasks: [] },
      { name: "Shipping", start: "2026-06-16", end: "2026-06-30", progress: 0, tasks: [] },
      { name: "Erection", start: "2026-07-01", end: "2026-07-08", progress: 0, tasks: [] },
      { name: "Handover", start: "2026-07-09", end: "2026-07-10", progress: 0, tasks: [] },
    ],
    totalTasks: 18,
  },
  { 
    id: "P-2107", 
    customer: "Patel Exports",      
    type: "Warehouse",    
    start: "2026-04-02", 
    end: "2026-06-08", 
    progress: 30,
    phases: [
      { name: "Design", start: "2026-04-02", end: "2026-05-05", progress: 100, tasks: [] },
      { name: "Fabrication", start: "2026-05-06", end: "2026-06-01", progress: 35, tasks: [] },
      { name: "Shipping", start: "2026-06-02", end: "2026-06-05", progress: 0, tasks: [] },
      { name: "Erection", start: "2026-06-06", end: "2026-06-07", progress: 0, tasks: [] },
      { name: "Handover", start: "2026-06-08", end: "2026-06-08", progress: 0, tasks: [] },
    ],
    totalTasks: 14,
  },
  { 
    id: "P-2108", 
    customer: "Konark Cement",      
    type: "Workshop",     
    start: "2026-04-20", 
    end: "2026-08-15", 
    progress: 22,
    phases: [
      { name: "Design", start: "2026-04-20", end: "2026-05-25", progress: 100, tasks: [] },
      { name: "Fabrication", start: "2026-05-26", end: "2026-07-20", progress: 25, tasks: [] },
      { name: "Shipping", start: "2026-07-21", end: "2026-08-05", progress: 0, tasks: [] },
      { name: "Erection", start: "2026-08-06", end: "2026-08-12", progress: 0, tasks: [] },
      { name: "Handover", start: "2026-08-13", end: "2026-08-15", progress: 0, tasks: [] },
    ],
    totalTasks: 16,
  },
  { 
    id: "P-2109", 
    customer: "Helix Auto",         
    type: "Factory",      
    start: "2026-05-05", 
    end: "2026-09-01", 
    progress: 14,
    phases: [
      { name: "Design", start: "2026-05-05", end: "2026-06-10", progress: 100, tasks: [] },
      { name: "Fabrication", start: "2026-06-11", end: "2026-08-05", progress: 15, tasks: [] },
      { name: "Shipping", start: "2026-08-06", end: "2026-08-20", progress: 0, tasks: [] },
      { name: "Erection", start: "2026-08-21", end: "2026-08-28", progress: 0, tasks: [] },
      { name: "Handover", start: "2026-08-29", end: "2026-09-01", progress: 0, tasks: [] },
    ],
    totalTasks: 20,
  },
  { 
    id: "P-2110", 
    customer: "Lotus Beverages",    
    type: "Cold Storage", 
    start: "2026-05-18", 
    end: "2026-09-20", 
    progress: 8,
    phases: [
      { name: "Design", start: "2026-05-18", end: "2026-06-20", progress: 100, tasks: [] },
      { name: "Fabrication", start: "2026-06-21", end: "2026-08-25", progress: 8, tasks: [] },
      { name: "Shipping", start: "2026-08-26", end: "2026-09-10", progress: 0, tasks: [] },
      { name: "Erection", start: "2026-09-11", end: "2026-09-17", progress: 0, tasks: [] },
      { name: "Handover", start: "2026-09-18", end: "2026-09-20", progress: 0, tasks: [] },
    ],
    totalTasks: 22,
  },
];

function deriveStatus(p: Omit<ProjectRow, "status">): ProjectStatus {
  if (p.progress >= 100) return "Completed";
  const end = new Date(p.end);
  const diffDays = Math.ceil((end.getTime() - TODAY.getTime()) / 86400000);
  if (diffDays < 0) return "Overdue";
  if (diffDays <= 14 && p.progress < 80) return "At Risk";
  return "On Track";
}

export const projects: ProjectRow[] = rawProjects.map((p) => ({ ...p, status: deriveStatus(p) }));

// ----- Status counts (live, derived from projects) -----
const overdueCount = projects.filter((p) => p.status === "Overdue").length;
const atRiskCount  = projects.filter((p) => p.status === "At Risk").length;
const onTrackCount = projects.filter((p) => p.status === "On Track").length;
const completedCount = projects.filter((p) => p.status === "Completed").length;

export const projectStatusCounts = {
  "On Track":  { count: onTrackCount,  prev: onTrackCount - 2,  share: Math.round((onTrackCount / projects.length) * 100) },
  "At Risk":   { count: atRiskCount,   prev: atRiskCount - 1,   share: Math.round((atRiskCount / projects.length) * 100) },
  "Overdue":   { count: overdueCount,  prev: overdueCount + 1,  share: Math.round((overdueCount / projects.length) * 100) },
  "Completed": { count: completedCount, prev: completedCount - 1, share: Math.round((completedCount / projects.length) * 100) },
} as const;
