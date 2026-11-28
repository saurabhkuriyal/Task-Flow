"use client";

import * as React from "react";
import Link from "next/link";
import {
  PieChart,
  BarChart3,
  Flame,
  Users,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  OrganizationHomeTaskStats,
  OrganizationTeamStats,
  StreamWorkloadItem,
} from "@/hooks/organizations/useOrganizationHome";

/**
 * 1. SVG Donut Chart for Task Status Breakdown
 */
export function OrgTaskStatusChart({
  taskStats,
  isLoading,
}: {
  taskStats: OrganizationHomeTaskStats;
  isLoading?: boolean;
}) {
  const segments = React.useMemo(
    () => [
      {
        label: "Completed",
        value: taskStats.completed,
        color: "#10b981", // emerald-500
        dotClass: "bg-emerald-500",
      },
      {
        label: "In Progress",
        value: taskStats.inProgress,
        color: "#3b82f6", // blue-500
        dotClass: "bg-blue-500",
      },
      {
        label: "To Do",
        value: taskStats.todo,
        color: "#0ea5e9", // sky-500
        dotClass: "bg-sky-500",
      },
      {
        label: "In Review",
        value: taskStats.inReview,
        color: "#8b5cf6", // violet-500
        dotClass: "bg-violet-500",
      },
      {
        label: "Blocked",
        value: taskStats.blocked,
        color: "#f43f5e", // rose-500
        dotClass: "bg-rose-500",
      },
      {
        label: "Backlog",
        value: taskStats.backlog,
        color: "#f59e0b", // amber-500
        dotClass: "bg-amber-500",
      },
    ],
    [
      taskStats.completed,
      taskStats.inProgress,
      taskStats.todo,
      taskStats.inReview,
      taskStats.blocked,
      taskStats.backlog,
    ]
  );

  const total = taskStats.total;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  // Build SVG stroke-dasharray offsets cleanly
  const arcs = React.useMemo(() => {
    if (total === 0) return [];
    let accumulatedLength = 0;
    return segments
      .filter((s) => s.value > 0)
      .map((s) => {
        const segmentLength = (s.value / total) * circumference;
        const offset = -accumulatedLength;
        accumulatedLength += segmentLength;
        return {
          ...s,
          dashArray: `${segmentLength} ${circumference - segmentLength}`,
          dashOffset: offset,
        };
      });
  }, [segments, total, circumference]);

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <PieChart className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Task Status Distribution
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Completion vs pending workflow stages
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] font-mono">
          {taskStats.completionRate}% done
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 animate-pulse">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
      ) : total === 0 ? (
        <div className="py-8 text-center text-xs text-muted-foreground">
          No tasks recorded across streams yet.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* SVG Donut */}
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
            <svg className="h-36 w-36 -rotate-90" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="16"
                className="text-muted/40"
              />
              {arcs.map((arc) => (
                <circle
                  key={arc.label}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke={arc.color}
                  strokeWidth="16"
                  strokeDasharray={arc.dashArray}
                  strokeDashoffset={arc.dashOffset}
                  strokeLinecap="butt"
                  className="transition-all duration-500"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold text-foreground">
                {taskStats.completionRate}%
              </span>
              <span className="text-[10px] text-muted-foreground">
                {taskStats.pending} pending
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1 w-full text-xs">
            {segments.map((seg) => {
              const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
              return (
                <div
                  key={seg.label}
                  className="flex items-center justify-between gap-2 py-0.5"
                >
                  <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${seg.dotClass}`}
                    />
                    <span className="truncate">{seg.label}</span>
                  </span>
                  <span className="font-mono font-semibold text-foreground shrink-0">
                    {seg.value}{" "}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      ({pct}%)
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 2. Priority Breakdown Bar Graph
 */
export function OrgPriorityChart({
  taskStats,
  isLoading,
}: {
  taskStats: OrganizationHomeTaskStats;
  isLoading?: boolean;
}) {
  const items = [
    {
      label: "Urgent",
      value: taskStats.urgent,
      barClass: "bg-rose-500",
      textClass: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "High",
      value: taskStats.high,
      barClass: "bg-amber-500",
      textClass: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Medium",
      value: taskStats.medium,
      barClass: "bg-blue-500",
      textClass: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Low",
      value: taskStats.low,
      barClass: "bg-slate-400",
      textClass: "text-slate-600 dark:text-slate-400",
    },
  ];

  const maxVal = Math.max(1, ...items.map((i) => i.value));
  const total = taskStats.total;

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Task Priority Breakdown
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Urgency distribution across all tasks
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono">
          {total} tasks
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const widthPct = total > 0 ? Math.round((item.value / maxVal) * 100) : 0;
            const sharePct = total > 0 ? Math.round((item.value / total) * 100) : 0;

            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${item.textClass}`}>
                    {item.label}
                  </span>
                  <span className="font-mono text-foreground font-medium">
                    {item.value}{" "}
                    <span className="text-[10px] text-muted-foreground">
                      ({sharePct}%)
                    </span>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.barClass}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * 3. Department & Project Workload Bar Chart
 */
export function OrgStreamWorkloadChart({
  orgId,
  streamWorkload,
  isLoading,
}: {
  orgId: string;
  streamWorkload: StreamWorkloadItem[];
  isLoading?: boolean;
}) {
  const topStreams = streamWorkload.slice(0, 6);
  const maxTotal = Math.max(1, ...topStreams.map((s) => s.total));

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Stream Task Workload
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Completed vs pending across departments & projects
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Done
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Pending
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full rounded-md" />
          ))}
        </div>
      ) : topStreams.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">
          Create departments or projects to view task workload graphs.
        </div>
      ) : (
        <div className="space-y-3">
          {topStreams.map((item) => {
            const completedPct = (item.completed / maxTotal) * 100;
            const pendingPct = (item.pending / maxTotal) * 100;

            return (
              <Link
                key={item.streamId}
                href={`/organizations/${orgId}/streams/${item.streamId}`}
                className="block group space-y-1"
              >
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="flex items-center gap-1.5 min-w-0 font-medium text-foreground group-hover:text-primary transition-colors">
                    <span className="truncate">{item.name}</span>
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase px-1 py-0 shrink-0"
                    >
                      {item.type === "project" ? "Proj" : "Dept"}
                    </Badge>
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground shrink-0 flex items-center gap-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {item.completed}
                    </span>
                    <span>/</span>
                    <span className="text-foreground font-semibold">
                      {item.total}
                    </span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden flex">
                  {item.completed > 0 && (
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${completedPct}%` }}
                    />
                  )}
                  {item.pending > 0 && (
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${pendingPct}%` }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * 4. Team & Leadership Role Distribution Graph
 */
export function OrgTeamStructureChart({
  teamStats,
  isLoading,
}: {
  teamStats: OrganizationTeamStats;
  isLoading?: boolean;
}) {
  const roles = [
    {
      label: "Employees",
      value: teamStats.employeesCount,
      colorClass: "bg-blue-500",
    },
    {
      label: "Managers",
      value: teamStats.managersCount,
      colorClass: "bg-purple-500",
    },
    {
      label: "Leads",
      value: teamStats.leadsCount,
      colorClass: "bg-indigo-500",
    },
    {
      label: "Admins",
      value: teamStats.adminsCount,
      colorClass: "bg-amber-500",
    },
  ];

  const totalUnits = Math.max(
    1,
    roles.reduce((sum, r) => sum + r.value, 0)
  );

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Team & Leadership Mix
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Employees, managers, leads & admins
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] font-mono">
          {teamStats.totalMembers} members
        </Badge>
      </div>

      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-xl animate-pulse" />
      ) : (
        <div className="space-y-3">
          {/* Segmented horizontal bar */}
          <div className="h-3.5 w-full rounded-full bg-muted/60 overflow-hidden flex">
            {roles.map((role) => {
              const pct = (role.value / totalUnits) * 100;
              if (role.value === 0) return null;
              return (
                <div
                  key={role.label}
                  className={`h-full transition-all duration-500 ${role.colorClass}`}
                  style={{ width: `${pct}%` }}
                  title={`${role.label}: ${role.value}`}
                />
              );
            })}
          </div>

          {/* 2x2 role grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {roles.map((role) => (
              <div
                key={role.label}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-3 py-2"
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${role.colorClass}`}
                  />
                  <span>{role.label}</span>
                </span>
                <span className="font-mono font-bold text-foreground">
                  {role.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 5. 7-Day Task Activity Trend Graph (Created vs Completed)
 */
export function OrgWeeklyTrendChart({
  weeklyTrend,
  isLoading,
}: {
  weeklyTrend: Array<{
    date: string;
    label: string;
    created: number;
    completed: number;
  }>;
  isLoading?: boolean;
}) {
  const maxDaily = Math.max(
    1,
    ...weeklyTrend.flatMap((d) => [d.created, d.completed])
  );

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              7-Day Task Activity
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Daily created vs completed tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            Created
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Done
          </span>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-28 w-full rounded-xl animate-pulse" />
      ) : weeklyTrend.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">
          No recent 7-day activity recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2 items-end h-32 pt-2">
          {weeklyTrend.map((day) => {
            const createdHeight = Math.max(
              day.created > 0 ? 12 : 4,
              Math.round((day.created / maxDaily) * 100)
            );
            const completedHeight = Math.max(
              day.completed > 0 ? 12 : 4,
              Math.round((day.completed / maxDaily) * 100)
            );

            return (
              <div
                key={day.date}
                className="flex flex-col items-center justify-end h-full gap-1.5 group"
                title={`${day.label} (${day.date}): ${day.created} created, ${day.completed} completed`}
              >
                <div className="flex items-end justify-center gap-1 w-full flex-1">
                  <div
                    className={`w-2.5 rounded-t-sm transition-all duration-500 ${
                      day.created > 0 ? "bg-sky-500" : "bg-muted/50"
                    }`}
                    style={{ height: `${createdHeight}%` }}
                  />
                  <div
                    className={`w-2.5 rounded-t-sm transition-all duration-500 ${
                      day.completed > 0 ? "bg-emerald-500" : "bg-muted/50"
                    }`}
                    style={{ height: `${completedHeight}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
