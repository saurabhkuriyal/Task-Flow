"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  FolderKanban,
  Users,
  LayoutList,
  CheckCircle2,
  Clock3,
  AlertOctagon,
  Timer,
  Mail,
  Hash,
  RefreshCw,
  Eye,
  Calendar,
  X,
  User as UserIcon,
  Flame,
  Check,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeTaskPanel } from "@/hooks/member/useEmployeeTaskPanel";
import { formatSecondsToHHMMSS } from "@/hooks/task/useTimeLog";
import { ViewTaskModal } from "@/components/organization-workspace/task/ViewTaskModal";
import type { TaskItem } from "@/services/task.service";
import type { TaskStatus, TaskPriority } from "@/models/tasks.model";

export interface EmployeeTaskPanelProps {
  userId: string;
  orgId?: string;
}

function getInitials(name?: string): string {
  if (!name) return "EM";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getStatusBadge(status?: TaskStatus | string) {
  switch (status) {
    case "completed":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium uppercase"
        >
          Completed
        </Badge>
      );
    case "in_progress":
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium uppercase"
        >
          In Progress
        </Badge>
      );
    case "in_review":
      return (
        <Badge
          variant="outline"
          className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-medium uppercase"
        >
          In Review
        </Badge>
      );
    case "blocked":
      return (
        <Badge
          variant="outline"
          className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-medium uppercase"
        >
          Blocked
        </Badge>
      );
    case "backlog":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium uppercase"
        >
          Backlog
        </Badge>
      );
    case "todo":
    default:
      return (
        <Badge
          variant="outline"
          className="border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-medium uppercase"
        >
          To Do
        </Badge>
      );
  }
}

function getPriorityBadge(priority?: TaskPriority | string) {
  switch (priority) {
    case "urgent":
      return (
        <Badge
          variant="outline"
          className="border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-semibold flex items-center gap-1"
        >
          <Flame className="h-3 w-3 text-rose-500" /> Urgent
        </Badge>
      );
    case "high":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-semibold"
        >
          High
        </Badge>
      );
    case "medium":
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium"
        >
          Medium
        </Badge>
      );
    case "low":
    default:
      return (
        <Badge
          variant="outline"
          className="border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-medium"
        >
          Low
        </Badge>
      );
  }
}

export function EmployeeTaskPanel({ userId, orgId }: EmployeeTaskPanelProps) {
  const router = useRouter();

  const {
    tasks,
    filteredTasks,
    employee,
    filteredCategorizedByStream,
    filteredCategorizedByAssigner,
    metrics,
    isLoading,
    isRefreshing,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    viewMode,
    setViewMode,
    refetch,
  } = useEmployeeTaskPanel({ userId, orgId });

  // Selected task for ViewTaskModal
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState<boolean>(false);
  const [copiedId, setCopiedId] = React.useState<boolean>(false);

  const handleOpenViewModal = (task: TaskItem) => {
    setSelectedTask(task);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTask(null);
  };

  const handleCopyUserId = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (err) {
      console.error("Failed to copy ID:", err);
    }
  };

  const backUrl = orgId ? `/organizations/${orgId}/streams` : "/organizations";

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation & Header Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push(backUrl);
                }
              }}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link
                href={backUrl}
                className="hover:text-primary transition-colors hover:underline"
              >
                Streams
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">Employee Task Panel</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefreshing || isLoading}
              className="h-8 px-2.5 text-xs cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${
                  isRefreshing ? "animate-spin text-primary" : ""
                }`}
              />
              {isRefreshing ? "Syncing..." : "Refresh Tasks"}
            </Button>
          </div>
        </div>

        {/* Employee Profile Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          {isLoading ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
              <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-blue-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xl border border-indigo-500/30 shadow-inner">
                  {getInitials(employee?.name)}
                </div>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                      {employee?.name || "Employee"}
                    </h1>
                    <Badge
                      variant="outline"
                      className="text-xs uppercase font-semibold capitalize border-primary/30 text-primary bg-primary/5"
                    >
                      {employee?.role || "employee"}
                    </Badge>
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {employee?.status || "active"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {employee?.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                        <span className="truncate">{employee.email}</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleCopyUserId}
                      className="inline-flex items-center gap-1 text-[11px] font-mono bg-muted/60 hover:bg-muted px-2 py-0.5 rounded border border-border/60 text-foreground transition-colors cursor-pointer"
                      title="Click to copy User ID"
                    >
                      <Hash className="h-3 w-3 text-primary/70 shrink-0" />
                      <span className="truncate max-w-[140px]">{userId}</span>
                      {copiedId ? (
                        <Check className="h-3 w-3 text-emerald-500 ml-1" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground ml-1" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Stat Pill */}
              <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border/60 self-start sm:self-auto">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Timer className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Total Time Logged
                  </div>
                  <div className="font-mono text-base font-bold text-foreground">
                    {formatSecondsToHHMMSS(metrics.totalTimeSpent)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs h-7 px-2 border-destructive/30"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
            <div className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
              <span>Total Assigned</span>
              <LayoutList className="h-3.5 w-3.5 text-muted-foreground/70" />
            </div>
            <div className="text-xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-6 w-8" /> : metrics.total}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
            <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 flex items-center justify-between">
              <span>In Progress</span>
              <Clock3 className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-6 w-8" /> : metrics.inProgress}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
            <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>Completed</span>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-6 w-8" /> : metrics.completed}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span>To Do</span>
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-6 w-8" /> : metrics.todo}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
            <div className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <span>Blocked</span>
              <AlertOctagon className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-6 w-8" /> : metrics.blocked}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1">
            <div className="text-[11px] font-medium text-purple-600 dark:text-purple-400 flex items-center justify-between">
              <span>Completion Rate</span>
              <span className="text-[10px] font-mono">{metrics.completionPercentage}%</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* View Controls & Filter Bar */}
        <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks by title, description, stream, assigner, note..."
                className="pl-9 h-9 text-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 border border-border/70 rounded-lg p-1 bg-muted/30 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setViewMode("by_stream")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "by_stream"
                    ? "bg-card text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderKanban className="h-3.5 w-3.5 text-primary" />
                <span>By Streams</span>
                {!isLoading && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-0.5">
                    {filteredCategorizedByStream.length}
                  </Badge>
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewMode("by_assigner")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "by_assigner"
                    ? "bg-card text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>By Assigners</span>
                {!isLoading && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-0.5">
                    {filteredCategorizedByAssigner.length}
                  </Badge>
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewMode("all_tasks")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  viewMode === "all_tasks"
                    ? "bg-card text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutList className="h-3.5 w-3.5 text-primary" />
                <span>All Tasks</span>
                {!isLoading && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-0.5">
                    {filteredTasks.length}
                  </Badge>
                )}
              </button>
            </div>
          </div>

          {/* Secondary Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs">
            <span className="text-muted-foreground font-medium text-[11px]">Filter:</span>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: "All Statuses", value: "all" },
                { label: "To Do", value: "todo" },
                { label: "In Progress", value: "in_progress" },
                { label: "In Review", value: "in_review" },
                { label: "Completed", value: "completed" },
                { label: "Blocked", value: "blocked" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    statusFilter === opt.value
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <span className="text-border">|</span>

            {/* Priority Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: "All Priorities", value: "all" },
                { label: "Urgent", value: "urgent" },
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriorityFilter(opt.value)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    priorityFilter === opt.value
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {(searchTerm || statusFilter !== "all" || priorityFilter !== "all") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
                className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive cursor-pointer ml-auto"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        {/* Content Area Based on Active View Mode */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-border/70 bg-card space-y-3 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-card p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <LayoutList className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No Tasks Assigned Yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              There are currently no tasks assigned to {employee?.name || "this employee"}.
              When team leads or managers assign tasks in any stream, they will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Categorized by Streams View */}
            {viewMode === "by_stream" && (
              <div className="space-y-5">
                {filteredCategorizedByStream.length > 0 ? (
                  filteredCategorizedByStream.map((streamGroup) => {
                    const streamHref = orgId
                      ? `/organizations/${orgId}/streams/${streamGroup.streamId}`
                      : `/organizations/streams/${streamGroup.streamId}`;

                    return (
                      <div
                        key={streamGroup.streamId}
                        className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm"
                      >
                        {/* Stream Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted/20 border-b border-border/60">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <FolderKanban className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Link
                                  href={streamHref}
                                  className="text-sm font-bold text-foreground hover:text-primary transition-colors hover:underline"
                                >
                                  {streamGroup.streamName}
                                </Link>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] uppercase font-medium"
                                >
                                  {streamGroup.streamType}
                                </Badge>
                              </div>
                              {streamGroup.description && (
                                <p className="text-[11px] text-muted-foreground line-clamp-1">
                                  {streamGroup.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 text-xs">
                            <Badge
                              variant="secondary"
                              className="text-[11px] font-normal h-6 px-2"
                            >
                              {streamGroup.tasks.length} {streamGroup.tasks.length === 1 ? "task" : "tasks"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[11px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 h-6 px-2"
                            >
                              {streamGroup.completedTasks} completed
                            </Badge>
                            {streamGroup.totalTimeSpent > 0 && (
                              <Badge
                                variant="outline"
                                className="font-mono text-[11px] text-muted-foreground h-6 px-2"
                              >
                                <Timer className="h-3 w-3 mr-1" />
                                {formatSecondsToHHMMSS(streamGroup.totalTimeSpent)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Stream Task Items Table */}
                        <TaskTable
                          tasks={streamGroup.tasks}
                          onViewTask={handleOpenViewModal}
                          showStreamColumn={false}
                          showAssignerColumn={true}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-xs text-muted-foreground rounded-xl border border-border/70 bg-card p-6">
                    <p>No tasks matching the selected filters in this stream.</p>
                  </div>
                )}
              </div>
            )}

            {/* 2. Categorized by Assigners View */}
            {viewMode === "by_assigner" && (
              <div className="space-y-5">
                {filteredCategorizedByAssigner.length > 0 ? (
                  filteredCategorizedByAssigner.map((assignerGroup) => (
                    <div
                      key={assignerGroup.assignerId}
                      className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm"
                    >
                      {/* Assigner Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted/20 border-b border-border/60">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-xs border border-indigo-500/20">
                            {getInitials(assignerGroup.assignerName)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-foreground">
                                {assignerGroup.assignerName}
                              </h3>
                              {assignerGroup.assignerRole && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] uppercase font-medium capitalize"
                                >
                                  {assignerGroup.assignerRole}
                                </Badge>
                              )}
                            </div>
                            {assignerGroup.assignerEmail && (
                              <p className="text-[11px] text-muted-foreground">
                                {assignerGroup.assignerEmail}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-xs">
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-normal h-6 px-2"
                          >
                            {assignerGroup.tasks.length} {assignerGroup.tasks.length === 1 ? "task" : "tasks"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[11px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 h-6 px-2"
                          >
                            {assignerGroup.completedTasks} completed
                          </Badge>
                          {assignerGroup.totalTimeSpent > 0 && (
                            <Badge
                              variant="outline"
                              className="font-mono text-[11px] text-muted-foreground h-6 px-2"
                            >
                              <Timer className="h-3 w-3 mr-1" />
                              {formatSecondsToHHMMSS(assignerGroup.totalTimeSpent)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Assigner Task Items Table */}
                      <TaskTable
                        tasks={assignerGroup.tasks}
                        onViewTask={handleOpenViewModal}
                        showStreamColumn={true}
                        showAssignerColumn={false}
                      />
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-xs text-muted-foreground rounded-xl border border-border/70 bg-card p-6">
                    <p>No tasks matching the selected filters for this assigner.</p>
                  </div>
                )}
              </div>
            )}

            {/* 3. All Tasks Table View */}
            {viewMode === "all_tasks" && (
              <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-4 bg-muted/20 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <LayoutList className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      All Assigned Tasks
                    </h3>
                  </div>
                  <Badge variant="secondary" className="text-xs h-6 px-2 font-normal">
                    {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
                  </Badge>
                </div>

                {filteredTasks.length > 0 ? (
                  <TaskTable
                    tasks={filteredTasks}
                    onViewTask={handleOpenViewModal}
                    showStreamColumn={true}
                    showAssignerColumn={true}
                  />
                ) : (
                  <div className="py-12 text-center text-xs text-muted-foreground p-6">
                    <p>No tasks match the active filters or search terms.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* View Task Modal with Live Stopwatch, Session Log, Status & Note */}
      {selectedTask && (
        <ViewTaskModal
          key={selectedTask.id || selectedTask._id}
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          task={selectedTask}
          onTaskUpdated={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
}

interface TaskTableProps {
  tasks: TaskItem[];
  onViewTask: (task: TaskItem) => void;
  showStreamColumn?: boolean;
  showAssignerColumn?: boolean;
}

function TaskTable({
  tasks,
  onViewTask,
  showStreamColumn = true,
  showAssignerColumn = true,
}: TaskTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/40 text-muted-foreground border-b border-border/50 uppercase tracking-wider text-[10px] font-semibold">
          <tr>
            <th className="py-2.5 px-4 font-semibold">Task Name</th>
            {showStreamColumn && <th className="py-2.5 px-3 font-semibold">Stream</th>}
            {showAssignerColumn && <th className="py-2.5 px-3 font-semibold">Assigned By</th>}
            <th className="py-2.5 px-3 font-semibold">Status</th>
            <th className="py-2.5 px-3 font-semibold">Priority</th>
            <th className="py-2.5 px-3 font-semibold">Due Date</th>
            <th className="py-2.5 px-3 font-semibold">Time Logged</th>
            <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {tasks.map((task) => {
            const taskId = task.id || task._id || "";

            return (
              <tr
                key={taskId}
                className="hover:bg-muted/30 transition-colors group cursor-pointer"
                onClick={() => onViewTask(task)}
              >
                {/* Task Name & Description */}
                <td className="py-3 px-4 min-w-[200px] max-w-[320px]">
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {task.taskname}
                  </div>
                  {task.description && (
                    <div className="text-[11px] text-muted-foreground truncate max-w-[280px]">
                      {task.description}
                    </div>
                  )}
                </td>

                {/* Stream Name */}
                {showStreamColumn && (
                  <td className="py-3 px-3 min-w-[120px]">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <FolderKanban className="h-3 w-3 text-primary/70 shrink-0" />
                      <span className="font-medium text-foreground truncate max-w-[120px]">
                        {task.streamName || "Stream"}
                      </span>
                    </div>
                  </td>
                )}

                {/* Assigner Name */}
                {showAssignerColumn && (
                  <td className="py-3 px-3 min-w-[120px]">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <UserIcon className="h-3 w-3 text-indigo-500/80 shrink-0" />
                      <span className="font-medium text-foreground truncate max-w-[120px]">
                        {task.assignerName || "Assigner"}
                      </span>
                    </div>
                  </td>
                )}

                {/* Status */}
                <td className="py-3 px-3 shrink-0">
                  {getStatusBadge(task.status)}
                </td>

                {/* Priority */}
                <td className="py-3 px-3 shrink-0">
                  {getPriorityBadge(task.priority)}
                </td>

                {/* Due Date */}
                <td className="py-3 px-3 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                  {task.dueDate ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground/70" />
                      {task.dueDate}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50 italic">None</span>
                  )}
                </td>

                {/* Time Logged */}
                <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3 w-3 text-primary/70" />
                    {formatSecondsToHHMMSS(task.totalTimeSpent || 0)}
                  </span>
                </td>

                {/* Action Button */}
                <td
                  className="py-3 px-4 text-right shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onViewTask(task)}
                    className="h-7 px-2 text-xs cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                    title="View task details and track time"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTaskPanel;
