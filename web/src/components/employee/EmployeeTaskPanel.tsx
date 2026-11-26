"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  FolderKanban,
  LayoutList,
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
  Plus,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeTaskPanel } from "@/hooks/member/useEmployeeTaskPanel";
import { formatSecondsToHHMMSS } from "@/hooks/task/useTimeLog";
import { ViewTaskModal } from "@/components/organization-workspace/task/ViewTaskModal";
import { CreateEmployeeTaskModal } from "./CreateEmployeeTaskModal";
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

interface DropdownOption {
  label: string;
  value: string;
  dotColor?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  className = "",
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (val: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-1.5 h-8 px-2.5 rounded-lg border border-border/70 bg-card text-xs font-medium text-foreground hover:bg-muted/50 transition-colors cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-primary/40"
      >
        <span className="inline-flex items-center gap-1.5 truncate">
          {Icon && (
            <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          )}
          <span className="text-muted-foreground">{label}:</span>
          {selectedOption.dotColor && (
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${selectedOption.dotColor}`}
            />
          )}
          <span className="font-semibold text-foreground truncate">
            {selectedOption.label}
          </span>
        </span>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 z-30 mt-1 w-44 rounded-xl border border-border/80 bg-card p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                opt.value === value
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted/60"
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                {opt.dotColor && (
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${opt.dotColor}`}
                  />
                )}
                {opt.icon && (
                  <opt.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="truncate">{opt.label}</span>
              </span>
              {opt.value === value && (
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function EmployeeTaskPanel({ userId, orgId }: EmployeeTaskPanelProps) {
  const router = useRouter();

  const {
    tasks,
    filteredTasks,
    employee,
    categorizedByStream,
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
    refetch,
  } = useEmployeeTaskPanel({ userId, orgId });

  // Side panel navigation selection: "all" (default) | "direct" | [streamId]
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  // Selected task for ViewTaskModal
  const [selectedTask, setSelectedTask] = React.useState<TaskItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState<boolean>(false);
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

  // Stream groups excluding streamless tasks
  const regularStreamGroups = React.useMemo(() => {
    return categorizedByStream.filter(
      (g) => g.streamId && g.streamType !== "direct"
    );
  }, [categorizedByStream]);

  // Direct tasks count
  const directTasksCount = React.useMemo(() => {
    return tasks.filter((t) => !t.streamId || t.streamType === "direct").length;
  }, [tasks]);

  // Tasks to display based on the selected category in the side panel
  const displayedTasks = React.useMemo(() => {
    if (selectedCategory === "all") {
      return filteredTasks;
    }
    if (selectedCategory === "direct") {
      return filteredTasks.filter(
        (t) => !t.streamId || t.streamType === "direct"
      );
    }
    // Specific stream
    return filteredTasks.filter((t) => t.streamId === selectedCategory);
  }, [filteredTasks, selectedCategory]);

  // Active stream details if a specific stream is chosen
  const activeStreamGroup = React.useMemo(() => {
    if (selectedCategory === "all" || selectedCategory === "direct") return null;
    return categorizedByStream.find((g) => g.streamId === selectedCategory);
  }, [categorizedByStream, selectedCategory]);

  // Dropdown filter options
  const statusOptions: DropdownOption[] = [
    { label: "All Statuses", value: "all" },
    { label: "To Do", value: "todo", dotColor: "bg-slate-400" },
    { label: "In Progress", value: "in_progress", dotColor: "bg-blue-500" },
    { label: "In Review", value: "in_review", dotColor: "bg-purple-500" },
    { label: "Completed", value: "completed", dotColor: "bg-emerald-500" },
    { label: "Blocked", value: "blocked", dotColor: "bg-rose-500" },
  ];

  const priorityOptions: DropdownOption[] = [
    { label: "All Priorities", value: "all" },
    { label: "Urgent", value: "urgent", dotColor: "bg-rose-500", icon: Flame },
    { label: "High", value: "high", dotColor: "bg-amber-500" },
    { label: "Medium", value: "medium", dotColor: "bg-blue-500" },
    { label: "Low", value: "low", dotColor: "bg-slate-400" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-3.5 sm:space-y-5">
        {/* Navigation & Header Breadcrumb */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 min-w-0">
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
              className="h-8 px-2 sm:px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <Link
                href={backUrl}
                className="hover:text-primary transition-colors hover:underline shrink-0"
              >
                Streams
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium truncate">
                Task Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefreshing || isLoading}
              className="h-8 px-2 sm:px-2.5 text-xs cursor-pointer"
              title="Refresh tasks"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  isRefreshing ? "animate-spin text-primary" : ""
                } sm:mr-1.5`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? "Syncing..." : "Refresh"}
              </span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-8 px-2.5 sm:px-3 text-xs cursor-pointer shadow-xs gap-1 font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Task</span>
            </Button>
          </div>
        </div>

        {/* Employee Profile Header Banner */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/70 bg-card p-3.5 sm:p-5 shadow-xs">
          {isLoading ? (
            <div className="flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 sm:h-5 sm:w-40" />
                  <Skeleton className="h-3 w-24 sm:h-3.5 sm:w-28" />
                </div>
              </div>
              <Skeleton className="h-8 w-24 sm:h-9 sm:w-32 rounded-lg" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-blue-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm sm:text-base border border-indigo-500/30 shadow-inner">
                  {getInitials(employee?.name)}
                </div>

                <div className="space-y-0.5 sm:space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h1 className="text-base sm:text-xl font-bold text-foreground tracking-tight truncate">
                      {employee?.name || "Employee"}
                    </h1>
                    <Badge
                      variant="outline"
                      className="text-[9px] sm:text-[10px] uppercase font-semibold capitalize border-primary/30 text-primary bg-primary/5 px-1.5 py-0"
                    >
                      {employee?.role || "employee"}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {employee?.status || "active"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-muted-foreground">
                    {employee?.email && (
                      <span className="flex items-center gap-1 truncate max-w-[180px] sm:max-w-none">
                        <Mail className="h-3 w-3 text-muted-foreground/80 shrink-0" />
                        <span className="truncate">{employee.email}</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleCopyUserId}
                      className="inline-flex items-center gap-1 text-[10px] font-mono bg-muted/60 hover:bg-muted px-1.5 py-0.5 rounded border border-border/60 text-foreground transition-colors cursor-pointer"
                      title="Click to copy User ID"
                    >
                      <Hash className="h-2.5 w-2.5 text-primary/70 shrink-0" />
                      <span className="truncate max-w-[80px] sm:max-w-[130px]">{userId}</span>
                      {copiedId ? (
                        <Check className="h-2.5 w-2.5 text-emerald-500 ml-0.5" />
                      ) : (
                        <Copy className="h-2.5 w-2.5 text-muted-foreground ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Total Time Logged Pill */}
              <div className="flex items-center gap-2 bg-muted/40 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-border/60 self-start sm:self-auto shrink-0">
                <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                <div className="text-[11px] sm:text-xs">
                  <span className="text-muted-foreground mr-1">Time Logged:</span>
                  <span className="font-mono font-bold text-foreground">
                    {formatSecondsToHHMMSS(metrics.totalTimeSpent)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-center justify-between">
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

        {/* Mobile Horizontal Category Pills (Hidden on desktop) */}
        <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-1 -mx-3 px-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "bg-muted/70 text-muted-foreground hover:bg-muted"
            }`}
          >
            <LayoutList className="h-3.5 w-3.5" />
            <span>All Tasks</span>
            <span className="text-[10px] font-mono opacity-80">({tasks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("direct")}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              selectedCategory === "direct"
                ? "bg-indigo-600 text-white shadow-xs font-semibold"
                : "bg-muted/70 text-muted-foreground hover:bg-muted"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Direct Tasks</span>
            <span className="text-[10px] font-mono opacity-80">({directTasksCount})</span>
          </button>

          {regularStreamGroups.map((group) => {
            const isSelected = selectedCategory === group.streamId;
            return (
              <button
                key={group.streamId}
                type="button"
                onClick={() => setSelectedCategory(group.streamId)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted"
                }`}
              >
                <FolderKanban className="h-3.5 w-3.5" />
                <span className="max-w-[120px] truncate">{group.streamName}</span>
                <span className="text-[10px] font-mono opacity-80">({group.totalTasks})</span>
              </button>
            );
          })}
        </div>

        {/* Main Side Panel + Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ======================================================== */}
          {/* Left Side Panel: Views, Streams & Direct Member Tasks    */}
          {/* (Visible on Desktop only: Mobile uses top horizontal pill bar) */}
          {/* ======================================================== */}
          <div className="hidden lg:block lg:col-span-3 space-y-3">
            <div className="rounded-xl border border-border/70 bg-card p-3 shadow-xs space-y-4">
              {/* Primary Views Section */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground px-2 py-1">
                  Views
                </div>

                {/* All Tasks Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                    selectedCategory === "all"
                      ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <LayoutList className="h-3.5 w-3.5 text-primary" />
                    <span>All Tasks</span>
                  </span>
                  <Badge
                    variant={selectedCategory === "all" ? "default" : "secondary"}
                    className="text-[10px] h-4 px-1.5 font-normal"
                  >
                    {tasks.length}
                  </Badge>
                </button>

                {/* Direct Member Tasks Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory("direct")}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                    selectedCategory === "direct"
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Direct Member Tasks</span>
                  </span>
                  <Badge
                    variant={selectedCategory === "direct" ? "default" : "secondary"}
                    className="text-[10px] h-4 px-1.5 font-normal"
                  >
                    {directTasksCount}
                  </Badge>
                </button>
              </div>

              {/* Streams & Projects Section */}
              <div className="space-y-1 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                    Streams & Projects
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    ({regularStreamGroups.length})
                  </span>
                </div>

                {regularStreamGroups.length > 0 ? (
                  regularStreamGroups.map((group) => {
                    const isSelected = selectedCategory === group.streamId;

                    return (
                      <button
                        key={group.streamId}
                        type="button"
                        onClick={() => setSelectedCategory(group.streamId)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                          isSelected
                            ? "bg-primary/10 text-primary font-semibold border border-primary/20"
                            : "text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <FolderKanban className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{group.streamName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40">
                            {group.streamType === "project" ? "Proj" : "Dept"}
                          </span>
                          <Badge
                            variant={isSelected ? "default" : "secondary"}
                            className="text-[10px] h-4 px-1 font-normal"
                          >
                            {group.totalTasks}
                          </Badge>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-2 py-3 text-center text-[11px] text-muted-foreground">
                    No streams associated
                  </div>
                )}
              </div>

              {/* Side Panel Quick Action */}
              <div className="pt-2 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full h-8 text-xs cursor-pointer border-dashed border-border hover:border-primary/50"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Assign Task
                </Button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* Right Main Content Area: Filter Bar & Selected Task List */}
          {/* ======================================================== */}
          <div className="lg:col-span-9 space-y-3">
            {/* Header of the Active Selection & Control Filters */}
            <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-3.5 space-y-2.5 sm:space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                {/* Active Category Title */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    {selectedCategory === "all" ? (
                      <LayoutList className="h-4 w-4" />
                    ) : selectedCategory === "direct" ? (
                      <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <FolderKanban className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <h2 className="text-sm font-bold text-foreground truncate">
                        {selectedCategory === "all"
                          ? "All Assigned Tasks"
                          : selectedCategory === "direct"
                          ? "Direct Tasks (No Stream)"
                          : activeStreamGroup?.streamName || "Stream Tasks"}
                      </h2>
                      {activeStreamGroup && (
                        <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0">
                          {activeStreamGroup.streamType}
                        </Badge>
                      )}
                    </div>
                    <p className="hidden sm:block text-[11px] text-muted-foreground truncate">
                      {selectedCategory === "all"
                        ? `Showing all tasks across streams and direct assignments (${displayedTasks.length} total)`
                        : selectedCategory === "direct"
                        ? "Tasks assigned directly to this member with no stream attached"
                        : activeStreamGroup?.description || "Tasks assigned within this stream"}
                    </p>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tasks..."
                    className="pl-8 h-8 text-xs"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Clean Filter Dropdowns Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs">
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                  {/* Status Dropdown */}
                  <FilterDropdown
                    label="Status"
                    value={statusFilter}
                    options={statusOptions}
                    onChange={setStatusFilter}
                    icon={Filter}
                  />

                  {/* Priority / Impact Dropdown */}
                  <FilterDropdown
                    label="Priority"
                    value={priorityFilter}
                    options={priorityOptions}
                    onChange={setPriorityFilter}
                    icon={Flame}
                  />

                  {/* Reset Filters button */}
                  {(searchTerm ||
                    statusFilter !== "all" ||
                    priorityFilter !== "all") && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setPriorityFilter("all");
                      }}
                      className="col-span-2 sm:col-span-1 h-7 sm:h-8 px-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      Reset Filters
                    </Button>
                  )}
                </div>

                {/* Compact Task Stats Summary */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1.5 sm:pt-0 border-t sm:border-t-0 border-border/40 justify-between sm:justify-start">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>In Progress:</span>
                    <strong className="text-foreground">
                      {displayedTasks.filter((t) => t.status === "in_progress").length}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Completed:</span>
                    <strong className="text-foreground">
                      {displayedTasks.filter((t) => t.status === "completed").length}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Tasks Table / Content */}
            <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
              {isLoading ? (
                <div className="p-4 sm:p-6 space-y-3 animate-pulse">
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                  <Skeleton className="h-8 w-full rounded-lg" />
                </div>
              ) : displayedTasks.length > 0 ? (
                <>
                  {/* Desktop Table View (>= md) */}
                  <div className="hidden md:block">
                    <TaskTable
                      tasks={displayedTasks}
                      onViewTask={handleOpenViewModal}
                      showStreamColumn={selectedCategory === "all"}
                      showAssignerColumn={true}
                    />
                  </div>

                  {/* Mobile Touch-Friendly Card View (< md) */}
                  <div className="block md:hidden">
                    <TaskCardList
                      tasks={displayedTasks}
                      onViewTask={handleOpenViewModal}
                      showStreamColumn={selectedCategory === "all"}
                      showAssignerColumn={true}
                    />
                  </div>
                </>
              ) : (
                <div className="p-6 sm:p-10 text-center space-y-2.5 sm:space-y-3">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <LayoutList className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                      ? "No Tasks Match Your Filters"
                      : selectedCategory === "direct"
                      ? "No Direct Tasks Assigned Yet"
                      : "No Tasks Found in this Selection"}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                      ? "Try resetting your search query or filters to view more tasks."
                      : selectedCategory === "direct"
                      ? "Create direct tasks for this member without tying them to a specific stream."
                      : "Assign tasks to this member for this stream using the button below."}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-xs h-8 cursor-pointer mt-2"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    {selectedCategory === "direct"
                      ? "Create Direct Task"
                      : "Assign New Task"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
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

      {/* Create Task Modal specifically for this Member */}
      <CreateEmployeeTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch();
        }}
        memberId={userId}
        employee={employee}
        orgId={orgId}
        streamId={
          selectedCategory !== "all" && selectedCategory !== "direct"
            ? selectedCategory
            : null
        }
        streamName={
          selectedCategory !== "all" && selectedCategory !== "direct"
            ? activeStreamGroup?.streamName
            : null
        }
      />
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
            {showStreamColumn && (
              <th className="py-2.5 px-3 font-semibold">Stream</th>
            )}
            {showAssignerColumn && (
              <th className="py-2.5 px-3 font-semibold">Assigned By</th>
            )}
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
                        {task.streamName || "Direct Task"}
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

function TaskCardList({
  tasks,
  onViewTask,
  showStreamColumn = true,
  showAssignerColumn = true,
}: TaskTableProps) {
  return (
    <div className="divide-y divide-border/40">
      {tasks.map((task) => {
        const taskId = task.id || task._id || "";

        return (
          <div
            key={taskId}
            onClick={() => onViewTask(task)}
            className="p-3.5 hover:bg-muted/30 active:bg-muted/50 transition-colors cursor-pointer space-y-2 group"
          >
            {/* Row 1: Task Title & Status Badge */}
            <div className="flex items-start justify-between gap-2.5">
              <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {task.taskname}
              </h4>
              <div className="shrink-0 pt-0.5">
                {getStatusBadge(task.status)}
              </div>
            </div>

            {/* Row 2: Optional Description */}
            {task.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {task.description}
              </p>
            )}

            {/* Row 3: Meta (Stream & Assigner) */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              {showStreamColumn && (
                <span className="flex items-center gap-1 min-w-0">
                  <FolderKanban className="h-3 w-3 text-primary/70 shrink-0" />
                  <span className="truncate max-w-[140px] font-medium text-foreground/80">
                    {task.streamName || "Direct Task"}
                  </span>
                </span>
              )}
              {showAssignerColumn && task.assignerName && (
                <span className="flex items-center gap-1 min-w-0">
                  <UserIcon className="h-3 w-3 text-indigo-500/80 shrink-0" />
                  <span className="truncate max-w-[120px]">
                    {task.assignerName}
                  </span>
                </span>
              )}
            </div>

            {/* Row 4: Priority, Due Date, Time Logged */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2 flex-wrap">
                {getPriorityBadge(task.priority)}

                {task.dueDate && (
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Calendar className="h-2.5 w-2.5 text-muted-foreground/70" />
                    <span>{task.dueDate}</span>
                  </span>
                )}

                {(task.totalTimeSpent || 0) > 0 && (
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Clock3 className="h-2.5 w-2.5 text-primary/70" />
                    <span>
                      {formatSecondsToHHMMSS(task.totalTimeSpent || 0)}
                    </span>
                  </span>
                )}
              </div>

              <span className="text-[11px] font-medium text-primary flex items-center gap-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform">
                View <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default EmployeeTaskPanel;
