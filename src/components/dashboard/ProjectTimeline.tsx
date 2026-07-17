import { useEffect, useMemo, useState, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Clock, CircleDot } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projects, TODAY, type ProjectStatus } from "@/features/dashboard/data/projectMockData";

const RANGE_START = new Date("2026-01-01");
const RANGE_END = new Date("2026-09-30");
const RANGE_MS = RANGE_END.getTime() - RANGE_START.getTime();
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

function pct(date: Date) {
  return Math.max(0, Math.min(100, ((date.getTime() - RANGE_START.getTime()) / RANGE_MS) * 100));
}

const STATUS: Record<ProjectStatus, { bar: string; fill: string; chip: string; Icon: typeof CheckCircle2 }> = {
  "On Track":  { bar: "bg-blue-200",    fill: "bg-blue-500",    chip: "bg-blue-50 text-blue-700",       Icon: CircleDot },
  "At Risk":   { bar: "bg-amber-200",   fill: "bg-amber-500",   chip: "bg-amber-50 text-amber-700",     Icon: AlertTriangle },
  "Overdue":   { bar: "bg-rose-200",    fill: "bg-rose-500",    chip: "bg-rose-50 text-rose-700",       Icon: Clock },
  "Completed": { bar: "bg-emerald-200", fill: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700", Icon: CheckCircle2 },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

type Filter = "All" | ProjectStatus;

interface Props {
  statusFilter?: Filter;
  selectedId?: string;
  onSelectId?: (id: string) => void;
  onStatusFilterChange?: (f: Filter) => void;
}

export const ProjectTimeline = memo(function ProjectTimeline({ statusFilter, selectedId, onSelectId, onStatusFilterChange }: Props = {}) {
  const [internalFilter, setInternalFilter] = useState<Filter>("All");
  const filter = statusFilter ?? internalFilter;
  const setFilter = (f: Filter) => {
    setInternalFilter(f);
    onStatusFilterChange?.(f);
  };

  const filtered = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.status === filter)),
    [filter],
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
    if (!filtered.some((p) => p.id === activeId)) {
      setActiveId(filtered[0]?.id ?? "");
    }
  }, [filter, activeId, filtered]);

  const p = projects.find((x) => x.id === activeId);

  if (!p) {
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

  const todayPct = pct(TODAY);
  const start = new Date(p.start);
  const end = new Date(p.end);
  const left = pct(start);
  const width = Math.max(2, pct(end) - left);
  const s = STATUS[p.status];
  const Icon = s.Icon;
  const daysLeft = Math.ceil((end.getTime() - TODAY.getTime()) / 86400000);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="text-base">Project timeline</CardTitle>
          <CardDescription>Filter by status, then select a project</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {(["All", "On Track", "At Risk", "Overdue", "Completed"] as Filter[]).map((f) => (
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
                  {pr.id} · {pr.customer} — {pr.type}
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
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${MONTHS.length}, 1fr)` }}>
                {MONTHS.map((m) => (
                  <div key={m} className="border-l border-border/60 pl-1.5 text-[11px] text-muted-foreground">
                    {m}
                  </div>
                ))}
              </div>
            </div>

            {/* Single bar row */}
            <div className="relative h-7 py-1">
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${MONTHS.length}, 1fr)` }}>
                {MONTHS.map((m) => (
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
              Today · {TODAY.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
              {p.status === "Overdue" ? "Overdue by" : p.status === "Completed" ? "Status" : "Days remaining"}
            </div>
            <div className={cn("mt-1 text-sm font-semibold", p.status === "Overdue" && "text-rose-600")}>
              {p.status === "Completed" ? "Delivered" : p.status === "Overdue" ? `${Math.abs(daysLeft)} days` : `${daysLeft} days`}
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
