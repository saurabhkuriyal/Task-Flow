"use client";

import * as React from "react";
import Link from "next/link";
import {
  Timer,
  Clock3,
  Users,
  ListTodo,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatSecondsToHHMMSS } from "@/hooks/task/useTimeLog";
import {
  computeTodayTimeSummary,
  useTodayTimeLogged,
} from "@/hooks/task/useTodayTimeLogged";
import type { TaskItem } from "@/services/task.service";
import type { User } from "@/types/auth";

export interface OrganizationEmployeeActivityProps {
  orgId: string;
  members: User[];
  tasks: TaskItem[];
  isLoading?: boolean;
}

interface TaskTimeDetail {
  taskId: string;
  taskname: string;
  streamName: string;
  assigneeName: string;
  status: string;
  todaySeconds: number;
  totalSeconds: number;
  isRunning: boolean;
}

interface EmployeeActivityRow {
  empId: string;
  name: string;
  email?: string;
  role: string;
  tasksCount: number;
  completedCount: number;
  todaySeconds: number;
  totalSeconds: number;
  hasActiveTimer: boolean;
  tasks: TaskTimeDetail[];
}

function extractId(val: unknown): string {
  if (!val) return "";
  if (typeof val === "object" && val !== null && "_id" in val) {
    return String((val as { _id?: unknown })._id || "");
  }
  return String(val);
}

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "completed":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "in_progress":
      return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "in_review":
      return "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400";
    case "blocked":
      return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";
    default:
      return "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400";
  }
}

export function OrganizationEmployeeActivity({
  orgId,
  members,
  tasks,
  isLoading = false,
}: OrganizationEmployeeActivityProps) {
  const [viewMode, setViewMode] = React.useState<"employees" | "tasks">(
    "employees"
  );
  const [expandedEmpId, setExpandedEmpId] = React.useState<string | null>(null);

  const hasAnyActiveTimer = React.useMemo(
    () =>
      tasks.some(
        (t) => Array.isArray(t.timeLogs) && t.timeLogs.some((l) => l.isRunning)
      ),
    [tasks]
  );

  const [nowMs, setNowMs] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    if (!hasAnyActiveTimer) return;
    const id = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [hasAnyActiveTimer]);

  const {
    formattedTodayTime,
    formattedLiveTotalTime,
    todaySessionsCount,
    hasActiveTimer,
  } = useTodayTimeLogged(tasks, nowMs);

  // Per-task time summary across the org
  const taskTimeList = React.useMemo<TaskTimeDetail[]>(() => {
    return tasks
      .map((t) => {
        const taskId = t.id || t._id || "";
        const summary = computeTodayTimeSummary([t], nowMs);
        return {
          taskId,
          taskname: t.taskname || t.title || "Untitled Task",
          streamName: t.streamName || "Direct Task",
          assigneeName: t.assigneeName || "Unassigned",
          status: t.status || "todo",
          todaySeconds: summary.todaySeconds,
          totalSeconds: summary.liveTotalSeconds,
          isRunning: summary.hasActiveTimer,
        };
      })
      .sort((a, b) => {
        if (a.isRunning !== b.isRunning) return a.isRunning ? -1 : 1;
        if (b.todaySeconds !== a.todaySeconds)
          return b.todaySeconds - a.todaySeconds;
        return b.totalSeconds - a.totalSeconds;
      });
  }, [tasks, nowMs]);

  // Per-employee activity (tasks worked count, today's time, total time, and per-task list)
  const employeeRows = React.useMemo<EmployeeActivityRow[]>(() => {
    const taskDetailById = new Map<string, TaskTimeDetail>();
    taskTimeList.forEach((td) => {
      if (td.taskId) taskDetailById.set(td.taskId, td);
    });

    const empMap = new Map<
      string,
      {
        empId: string;
        name: string;
        email?: string;
        role: string;
        taskMap: Map<string, TaskItem>;
      }
    >();

    // Seed with all organization members
    members.forEach((m) => {
      const empId = String(m.id || m._id || "");
      if (!empId) return;
      empMap.set(empId, {
        empId,
        name: m.name || "Employee",
        email: m.email,
        role: m.role || "employee",
        taskMap: new Map<string, TaskItem>(),
      });
    });

    // Associate tasks by assignedId and by timeLogs.userId
    tasks.forEach((task) => {
      const tid = task.id || task._id || "";
      if (!tid) return;

      const assignedEmpId = extractId(task.assignedId);
      if (assignedEmpId) {
        if (!empMap.has(assignedEmpId)) {
          empMap.set(assignedEmpId, {
            empId: assignedEmpId,
            name: task.assigneeName || "Member",
            role: "employee",
            taskMap: new Map<string, TaskItem>(),
          });
        }
        empMap.get(assignedEmpId)!.taskMap.set(tid, task);
      }

      if (Array.isArray(task.timeLogs)) {
        task.timeLogs.forEach((log) => {
          const loggerId = extractId(log.userId);
          if (loggerId && empMap.has(loggerId)) {
            empMap.get(loggerId)!.taskMap.set(tid, task);
          }
        });
      }
    });

    return Array.from(empMap.values())
      .map((entry) => {
        const workedTasks = Array.from(entry.taskMap.values());
        const summary = computeTodayTimeSummary(workedTasks, nowMs);
        const completedCount = workedTasks.filter(
          (t) => t.status === "completed"
        ).length;

        const detailList: TaskTimeDetail[] = workedTasks
          .map((t) => {
            const tid = t.id || t._id || "";
            return (
              taskDetailById.get(tid) || {
                taskId: tid,
                taskname: t.taskname || t.title || "Task",
                streamName: t.streamName || "Direct Task",
                assigneeName: t.assigneeName || entry.name,
                status: t.status || "todo",
                todaySeconds: 0,
                totalSeconds: t.totalTimeSpent || 0,
                isRunning: false,
              }
            );
          })
          .sort((a, b) => {
            if (a.isRunning !== b.isRunning) return a.isRunning ? -1 : 1;
            if (b.todaySeconds !== a.todaySeconds)
              return b.todaySeconds - a.todaySeconds;
            return b.totalSeconds - a.totalSeconds;
          });

        return {
          empId: entry.empId,
          name: entry.name,
          email: entry.email,
          role: entry.role,
          tasksCount: workedTasks.length,
          completedCount,
          todaySeconds: summary.todaySeconds,
          totalSeconds: summary.liveTotalSeconds,
          hasActiveTimer: summary.hasActiveTimer,
          tasks: detailList,
        };
      })
      .sort((a, b) => {
        if (a.hasActiveTimer !== b.hasActiveTimer)
          return a.hasActiveTimer ? -1 : 1;
        if (b.todaySeconds !== a.todaySeconds)
          return b.todaySeconds - a.todaySeconds;
        if (b.tasksCount !== a.tasksCount) return b.tasksCount - a.tasksCount;
        return a.name.localeCompare(b.name);
      });
  }, [members, tasks, taskTimeList, nowMs]);

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header Row: Title + Today's Total Time Logged + View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Timer className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-foreground">
              Employee Workload & Time Logged
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Tasks worked per employee, today&apos;s logged hours, and
              per-task time breakdown
            </p>
          </div>
        </div>

        {/* Today's Total Time Logged + All-Time + Mode Switch */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Today's Total Time Logged Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
              hasActiveTimer
                ? "border-red-500/30 bg-red-500/5"
                : "border-primary/25 bg-primary/5"
            }`}
            title={`${todaySessionsCount} logged session${
              todaySessionsCount === 1 ? "" : "s"
            } today`}
          >
            {hasActiveTimer ? (
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
            ) : (
              <Clock3 className="h-3.5 w-3.5 text-primary" />
            )}
            <span className="text-muted-foreground">Today&apos;s Total:</span>
            <span
              className={`font-mono font-bold ${
                hasActiveTimer
                  ? "text-red-600 dark:text-red-400"
                  : "text-foreground"
              }`}
            >
              {formattedTodayTime}
            </span>
          </div>

          {/* All-Time Total Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-muted/30 text-xs">
            <span className="text-muted-foreground">All Time:</span>
            <span className="font-mono font-bold text-foreground">
              {formattedLiveTotalTime}
            </span>
          </div>

          {/* By Employee / By Task Switch */}
          <div className="inline-flex items-center rounded-xl border border-border/70 bg-muted/30 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("employees")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === "employees"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>By Employee ({employeeRows.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tasks")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === "tasks"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListTodo className="h-3.5 w-3.5" />
              <span>Per Task ({taskTimeList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2.5 animate-pulse">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : viewMode === "employees" ? (
        employeeRows.length > 0 ? (
          <div className="space-y-2.5">
            {employeeRows.map((emp) => {
              const isExpanded = expandedEmpId === emp.empId;
              return (
                <div
                  key={emp.empId}
                  className={`rounded-xl border transition-all ${
                    emp.hasActiveTimer
                      ? "border-red-500/30 bg-red-500/[0.02]"
                      : "border-border/70 bg-background/50"
                  }`}
                >
                  {/* Employee Summary Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedEmpId(isExpanded ? null : emp.empId)
                      }
                      className="flex items-center gap-3 min-w-0 text-left flex-1 cursor-pointer"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs">
                        {getInitials(emp.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                            {emp.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] capitalize px-1.5 py-0"
                          >
                            {emp.role}
                          </Badge>
                          {emp.hasActiveTimer && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/30 px-1.5 py-0.2 rounded-full">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                              </span>
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {emp.email || `${emp.completedCount} of ${emp.tasksCount} completed`}
                        </p>
                      </div>
                    </button>

                    {/* Metrics & Actions */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 pl-12 sm:pl-0">
                      <div className="px-2.5 py-1 rounded-lg bg-muted/50 border border-border/50 text-[11px] flex items-center gap-1.5">
                        <ListTodo className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">Tasks:</span>
                        <strong className="font-mono text-foreground">
                          {emp.tasksCount}
                        </strong>
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/20 text-[11px] flex items-center gap-1.5">
                        <Clock3 className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">Today:</span>
                        <strong
                          className={`font-mono ${
                            emp.hasActiveTimer
                              ? "text-red-600 dark:text-red-400"
                              : "text-foreground"
                          }`}
                        >
                          {formatSecondsToHHMMSS(emp.todaySeconds)}
                        </strong>
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-muted/40 border border-border/50 text-[11px] flex items-center gap-1.5">
                        <Timer className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Total:</span>
                        <strong className="font-mono text-foreground">
                          {formatSecondsToHHMMSS(emp.totalSeconds)}
                        </strong>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedEmpId(isExpanded ? null : emp.empId)
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted cursor-pointer"
                        title="Toggle per-task time breakdown"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline">Tasks</span>
                      </button>

                      <Link
                        href={`/employee/${emp.empId}/taskpanel?orgId=${orgId}`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        title="Open Employee Task Panel"
                      >
                        Panel <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Expanded Per-Task Breakdown for this Employee */}
                  {isExpanded && (
                    <div className="border-t border-border/50 bg-muted/20 px-3.5 py-3">
                      {emp.tasks.length > 0 ? (
                        <div className="space-y-1.5">
                          <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-1">
                            Time Logged Per Task ({emp.tasks.length})
                          </div>
                          <div className="divide-y divide-border/40 rounded-lg border border-border/60 bg-card overflow-hidden">
                            {emp.tasks.map((t) => (
                              <div
                                key={t.taskId}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 text-xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  {t.isRunning && (
                                    <span className="relative flex h-2 w-2 shrink-0">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                    </span>
                                  )}
                                  <span className="font-medium text-foreground truncate">
                                    {t.taskname}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1 shrink-0">
                                    <FolderKanban className="h-2.5 w-2.5" />
                                    {t.streamName}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0 text-[11px]">
                                  <Badge
                                    variant="outline"
                                    className={`text-[9px] uppercase px-1.5 py-0 ${getStatusBadgeClass(
                                      t.status
                                    )}`}
                                  >
                                    {t.status.replace("_", " ")}
                                  </Badge>
                                  <span className="font-mono text-muted-foreground">
                                    Today:{" "}
                                    <strong
                                      className={
                                        t.isRunning
                                          ? "text-red-600 dark:text-red-400"
                                          : "text-foreground"
                                      }
                                    >
                                      {formatSecondsToHHMMSS(t.todaySeconds)}
                                    </strong>
                                  </span>
                                  <span className="font-mono text-muted-foreground">
                                    Total:{" "}
                                    <strong className="text-foreground">
                                      {formatSecondsToHHMMSS(t.totalSeconds)}
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          No tasks assigned or logged yet for {emp.name}.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No employees found in this organization.
          </div>
        )
      ) : taskTimeList.length > 0 ? (
        /* Per-Task Time Logged Table */
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border/50 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-2.5 px-3.5">Task</th>
                <th className="py-2.5 px-3">Stream</th>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Today</th>
                <th className="py-2.5 px-3.5 text-right">Total Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {taskTimeList.map((task) => (
                <tr
                  key={task.taskId}
                  className={`hover:bg-muted/30 transition-colors ${
                    task.isRunning ? "bg-red-500/[0.03]" : ""
                  }`}
                >
                  <td className="py-2.5 px-3.5 font-medium text-foreground max-w-[260px]">
                    <div className="flex items-center gap-2 min-w-0">
                      {task.isRunning && (
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                      )}
                      <span className="truncate">{task.taskname}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground truncate max-w-[140px]">
                    {task.streamName}
                  </td>
                  <td className="py-2.5 px-3 text-foreground truncate max-w-[140px]">
                    {task.assigneeName}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase px-1.5 py-0 ${getStatusBadgeClass(
                        task.status
                      )}`}
                    >
                      {task.status === "completed" && (
                        <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                      )}
                      {task.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td
                    className={`py-2.5 px-3 font-mono whitespace-nowrap ${
                      task.isRunning
                        ? "text-red-600 dark:text-red-400 font-semibold"
                        : "text-foreground"
                    }`}
                  >
                    {formatSecondsToHHMMSS(task.todaySeconds)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-foreground whitespace-nowrap">
                    {formatSecondsToHHMMSS(task.totalSeconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-muted-foreground">
          No tasks logged in this organization yet.
        </div>
      )}
    </section>
  );
}

export default OrganizationEmployeeActivity;
