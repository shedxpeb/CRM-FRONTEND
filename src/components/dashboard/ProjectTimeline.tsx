import { useEffect, useMemo, useState, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Clock, CircleDot, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProjectStatus } from "@/features/dashboard/data/projectTypes";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface TimelineRow {
  id: string;
  customer: string;
  type: string;
  start: string;
  end: string;
  progress: number;
  status: ProjectStatus;
}

interface Range {
  start: Date;
  end: Date;
  months: string[];
  ms: number;
}

function buildRange(projects: TimelineRow[]): Range {
  if (projects.length === 0) {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return { start, end, months: monthNames(start, end), ms: end.getTime() - start.getTime() };
  }
  const times = projects.flatMap((pr) => [new Date(pr.start).getTime(), new Date(pr.end).getTime()]);
  const start = new Date(Math.min(...times));
  const end = new Date(Math.max(...times));
  const rangeStart = new Date(start.getFullYear(), start.getMonth(), 1);
  const rangeEnd = new Date(end.getFullYear(), end.getMonth() + 1, 0);
  return { start: rangeStart, end: rangeEnd, months: monthNames(rangeStart, rangeEnd), ms: rangeEnd.getTime() - rangeStart.getTime() };
}

function monthNames(start: Date, end: Date): string[] {
  const months: string[] = [];
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    months.push(MONTH_NAMES[current.getMonth()]);
    current.setMonth(current.getMonth() + 1);
  }
  return months.length > 0 ? months : [MONTH_NAMES[start.getMonth()]];
}

function pct(date: Date, range: Range) {
  return Math.max(0, Math.min(100, ((date.getTime() - range.start.getTime()) / range.ms) * 100));
}

const STATUS: Record<ProjectStatus, { bar: string; fill: string; chip: string; Icon: typeof CheckCircle2 }> = {
  "On Track":  { bar: "bg-blue-200",    fill: "bg-blue-500",    chip: "bg-blue-50 text-blue-700",       Icon: CircleDot },
  "At Risk":   { bar: "bg-amber-200",   fill: "bg-amber-500",   chip: "bg-amber-50 text-amber-700",     Icon: AlertTriangle },
  "Overdue":   { bar: "bg-rose-200",    fill: "bg-rose-500",    chip: "bg-rose-50 text-rose-700",       Icon: Clock },
  "Completed": { bar: "bg-emerald-200", fill: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700", Icon: CheckCircle2 },
  "Cancelled": { bar: "bg-slate-200",   fill: "bg-slate-500",   chip: "bg-slate-100 text-slate-600",    Icon: XCircle },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

type Filter = "All" | ProjectStatus;

interface Props {
  projects: TimelineRow[];
  statusFilter?: Filter;
  selectedId?: string;
  onSelectId?: (id: string) => void;
  onStatusFilterChange?: (f: Filter) => void;
}

export const ProjectTimeline = memo(function ProjectTimeline({
  projects,
  statusFilter,
  selectedId,
  onSelectId,
  onStatusFilterChange,
}: Props) {
  const [today] = useState(() => new Date());
  const [internalFilter, setInternalFilter] = useState<Filter>("All");
  const filter = statusFilter ?? internalFilter;
  const setFilter = (f: Filter) => {
    setInternalFilter(f);
    onStatusFilterChange?.(f);
  };

  const range = useMemo(() => buildRange(projects), [projects]);

  const filtered = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.status === filter)),
    [filter, projects],
  );

  const defaultId =
    filtered.find((p) => p.status === "Overdue")?.id ??
    filtered.find((p) => p.status === "At Risk")?.id ??
    filtered[0]?.id ??
    "";

  const [internalId, setInternalId] = useState(defaultId);
  const activeId = selectedId ?? internalId;
  const setActiveId = (id: string) => {
    setInternalId(id);
    onSelectId?.(id);
  };

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((p) => p.id === activeId)) {
      setActiveId(filtered[0]?.id ?? "");
    }
  }, [filter, activeId, filtered]);

  const p = projects.find((x) => x.id === activeId);

  if (projects.length === 0 || !p) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project timeline</CardTitle>
          <CardDescription>No project timeline data available yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Timeline will appear when project schedule data is available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const todayPct = pct(today, range);
  const start = new Date(p.start);
  const end = new Date(p.end);
  const left = pct(start, range);
  const width = Math.max(2, pct(end, range) - left);
  const s = STATUS[p.status];
  const Icon = s.Icon;
  const daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86400000);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="text-base">Project timeline</CardTitle>
          <CardDescription>Filter by status, then select a project</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {(["All", "On Track", "At Risk", "Overdue", "Completed", "Cancelled"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                  filter === f
                    ? "border-foreground/20 bg-foreground text-background"
                    : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <Select value={activeId} onValueChange={setActiveId}>
            <SelectTrigger className="h-8 w-full sm:w-[240px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filtered.map((pr) => (
                <SelectItem key={pr.id} value={pr.id} className="text-xs">
                  {pr.customer} — {pr.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            {/* Month header */}
            <div className="relative h-5 border-b border-border">
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${range.months.length}, 1fr)` }}>
                {range.months.map((m) => (
                  <div key={m} className="border-l border-border/60 pl-1.5 text-[11px] text-muted-foreground">
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Single bar row */}
            <div className="relative h-7 py-1">
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${range.months.length}, 1fr)` }}>
                {range.months.map((m) => (
                  <div key={m} className="border-l border-border/40" />
                ))}
              </div>

              {/* today marker */}
              <div
                className="absolute top-0 bottom-0 z-10 w-px border-l-2 border-dashed border-foreground/30"
                style={{ left: `${todayPct}%` }}
              />

              {/* bar */}
              <div
                className={cn(
                  "absolute top-1/2 z-20 flex h-5 -translate-y-1/2 items-center overflow-hidden rounded-md ring-1 ring-inset",
                  s.bar,
                  p.status === "Overdue" ? "ring-rose-300" : "ring-black/5",
                )}
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                <div className={cn("h-full", s.fill)} style={{ width: `${p.progress}%` }} />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5 text-[10px] font-medium text-foreground/80">
                  <span>{p.progress}%</span>
                  {p.status === "Overdue" && (
                    <span className="rounded bg-rose-600 px-1 py-0.5 text-[9px] font-semibold text-white">
                      {Math.abs(daysLeft)}d late
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Today legend */}
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="inline-block h-3 w-px border-l-2 border-dashed border-foreground/40" />
              Today · {today.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Detail strip */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Status</div>
            <span className={cn("mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", s.chip)}>
              <Icon className="h-3 w-3" />
              {p.status}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Progress</div>
            <div className="mt-1 text-sm font-semibold">{p.progress}%</div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className={cn("h-full", s.fill)} style={{ width: `${p.progress}%` }} />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Schedule</div>
            <div className="mt-1 text-sm font-semibold">
              {fmtDate(p.start)} → {fmtDate(p.end)}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {p.status === "Overdue" ? "Overdue by" : p.status === "Completed" || p.status === "Cancelled" ? "Status" : "Days remaining"}
            </div>
            <div className={cn("mt-1 text-sm font-semibold", p.status === "Overdue" && "text-rose-600")}>
              {p.status === "Completed" ? "Delivered" : p.status === "Cancelled" ? "Closed" : p.status === "Overdue" ? `${Math.abs(daysLeft)} days` : `${daysLeft} days`}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
          {(Object.keys(STATUS) as ProjectStatus[]).map((st) => {
            const LI = STATUS[st].Icon;
            return (
              <span key={st} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium", STATUS[st].chip)}>
                <LI className="h-3 w-3" />
                {st}
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
