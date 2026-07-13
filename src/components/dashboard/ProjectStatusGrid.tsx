import { useState, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  CircleDot,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { projectStatusCounts, type ProjectStatus } from "@/features/dashboard/data/projectMockData";

const STATUS: Record<ProjectStatus, { bar: string; chip: string; fill: string; Icon: typeof CheckCircle2 }> = {
  "On Track":  { bar: "bg-blue-500",    chip: "bg-blue-50 text-blue-700",       fill: "bg-blue-500",    Icon: CircleDot },
  "At Risk":   { bar: "bg-amber-500",   chip: "bg-amber-50 text-amber-700",     fill: "bg-amber-500",   Icon: AlertTriangle },
  "Overdue":   { bar: "bg-rose-500",    chip: "bg-rose-50 text-rose-700",       fill: "bg-rose-500",    Icon: Clock },
  "Completed": { bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700", fill: "bg-emerald-500", Icon: CheckCircle2 },
};

interface Props {
  onSelect?: (status: ProjectStatus) => void;
}

export const ProjectStatusGrid = memo(function ProjectStatusGrid({ onSelect }: Props) {
  const order: ProjectStatus[] = ["On Track", "At Risk", "Overdue", "Completed"];
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold">Project status</div>
              <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
                {order.map((st) => {
                  const s = STATUS[st];
                  return (
                    <span
                      key={st}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                        s.chip,
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", s.fill)} />
                      {projectStatusCounts[st].count} {st}
                    </span>
                  );
                })}
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </button>
          
          {isOpen && (
            <>
              <p className="text-xs text-muted-foreground">
                Click a status to filter the timeline below.
              </p>
              
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                {order.map((st) => {
                  const s = STATUS[st];
                  const data = projectStatusCounts[st];
                  const diff = data.count - data.prev;
                  const TrendIcon = diff < 0 ? ArrowDownRight : ArrowUpRight;
                  const trendGood = (st === "Overdue" || st === "At Risk") ? diff <= 0 : diff >= 0;
                  return (
                    <button
                      key={st}
                      onClick={() => onSelect?.(st)}
                      className="relative overflow-hidden rounded-lg border border-border bg-card p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className={cn("absolute inset-x-0 top-0 h-0.5", s.bar)} />
                      <div className="flex items-center justify-between">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", s.chip)}>
                          <s.Icon className="h-3 w-3" />
                          {st}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                            trendGood ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
                          )}
                        >
                          <TrendIcon className="h-3 w-3" />
                          {diff === 0 ? "0" : (diff > 0 ? `+${diff}` : diff)}
                        </span>
                      </div>
                      <div className="mt-2 text-2xl font-semibold tracking-tight">{data.count}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{data.share}% of portfolio</div>
                      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
                        <div className={cn("h-full", s.fill)} style={{ width: `${data.share}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
