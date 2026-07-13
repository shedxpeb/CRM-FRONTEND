import { GanttChart } from "./gantt/GanttChart";

interface Props {
  selectedProjectId?: string;
}

export function DetailedGanttChart({ selectedProjectId }: Props) {
  return <GanttChart selectedProjectId={selectedProjectId} />;
}
