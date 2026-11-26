"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  Building2,
  FolderKanban,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  User,
  AlertCircle,
  Calendar,
  ListTodo,
  Shield,
  Layers,
  Search,
  CheckCircle2,
  Clock3,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useStreamDetail } from "@/hooks/stream/useStreamDetail";
import { useStreamTasks } from "@/hooks/task";
import { useStreamMembers } from "@/hooks/subStream";
import { AddStreamMemberModal } from "../stream";
import {
  AddTaskModal,
  ViewTaskModal,
  EditTaskModal,
  DeleteTaskModal,
} from "../task";
import type { TaskItem } from "@/services/task.service";
import { StreamMembersView } from "@/components/subStream";

export function SpecificStreamView() {
  const {
    stream,
    isLoading: isLoadingStream,
    error: streamError,
    currentOrgId,
    streamId,
    refetch: refetchStream,
    isAddMemberOpen,
    openAddMember,
    closeAddMember,
    isAddLeadOpen,
    openAddLead,
    closeAddLead,
    isAddManagerOpen,
    openAddManager,
    closeAddManager,
  } = useStreamDetail();

  const {
    tasks,
    filteredTasks,
    isLoading: isLoadingTasks,
    searchTerm: taskSearch,
    setSearchTerm: setTaskSearch,
    refetch: refetchTasks,
  } = useStreamTasks({
    streamId,
    orgId: currentOrgId,
    enabled: Boolean(streamId),
  });

  const {
    members: streamMembers,
    lead: streamLeadMembers,
    manager: streamManagerMembers,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useStreamMembers({
    streamId,
    organisationId: currentOrgId,
    enabled: Boolean(streamId),
  });

  const refetch = React.useCallback(() => {
    refetchStream();
    refetchTasks();
    refetchMembers();
  }, [refetchStream, refetchTasks, refetchMembers]);

  const isLoading = isLoadingStream;
  const error = streamError;

  const [activeTab, setActiveTab] = React.useState<
    "tasks" | "memberTasks" | "team" | "about"
  >("tasks");
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
  const [prefilledMemberId, setPrefilledMemberId] = React.useState<
    string | undefined
  >(undefined);
  const openAddTask = React.useCallback(() => setIsAddTaskOpen(true), []);
  const closeAddTask = React.useCallback(() => {
    setIsAddTaskOpen(false);
    setPrefilledMemberId(undefined);
  }, []);

  // Modals for task row actions: View, Edit, Delete
  const [viewingTask, setViewingTask] = React.useState<TaskItem | null>(null);
  const [editingTask, setEditingTask] = React.useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = React.useState<TaskItem | null>(null);

  const closeViewTask = React.useCallback(() => setViewingTask(null), []);
  const closeEditTask = React.useCallback(() => setEditingTask(null), []);
  const closeDeleteTask = React.useCallback(() => setDeletingTask(null), []);

  const streamType = stream?.type || "department";
  const isEmpTracker = streamType === "empTracker";

  // Dynamic theme config per stream type for an energetic vibe
  const typeConfig = React.useMemo(() => {
    switch (streamType) {
      case "project":
        return {
          label: "Project",
          colorText: "text-purple-600 dark:text-purple-400",
          bgGradient:
            "from-purple-500/10 via-fuchsia-500/5 to-transparent border-purple-500/20",
          iconBg:
            "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/25",
          badgeColor:
            "bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20",
          icon: <FolderKanban className="h-5 w-5" />,
          statusLabel: "Active Sprint",
        };
      case "empTracker":
        return {
          label: "Employee Tracker",
          colorText: "text-emerald-600 dark:text-emerald-400",
          bgGradient:
            "from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20",
          iconBg:
            "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25",
          badgeColor:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20",
          icon: <UserCheck className="h-5 w-5" />,
          statusLabel: "Live Tracking",
        };
      case "department":
      default:
        return {
          label: "Department",
          colorText: "text-blue-600 dark:text-blue-400",
          bgGradient:
            "from-blue-500/10 via-indigo-500/5 to-transparent border-blue-500/20",
          iconBg:
            "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/25",
          badgeColor:
            "bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20",
          icon: <Building2 className="h-5 w-5" />,
          statusLabel: "Active Division",
        };
    }
  }, [streamType]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const leadName = stream?.lead?.[0]?.name;
  const managerName = stream?.manager?.[0]?.name;
  const creatorName = stream?.creator?.[0]?.name;
  const createdDate = formatDate(stream?.createdAt);
  const membersList = React.useMemo(() => stream?.members || [], [stream?.members]);

  const existingMemberIds = React.useMemo(() => {
    return membersList
      .map((m) => {
        if (!m.memberId) return "";
        if (typeof m.memberId === "object" && m.memberId !== null) {
          const obj = m.memberId as { _id?: string; id?: string };
          return String(obj._id || obj.id || "");
        }
        return String(m.memberId);
      })
      .filter(Boolean);
  }, [membersList]);

  const currentLeadId = React.useMemo(() => {
    const raw = stream?.lead?.[0]?.id;
    if (!raw) return "";
    if (typeof raw === "object" && raw !== null) {
      const obj = raw as { _id?: string; id?: string };
      return String(obj._id || obj.id || "");
    }
    return String(raw);
  }, [stream?.lead]);

  const currentManagerId = React.useMemo(() => {
    const raw = stream?.manager?.[0]?.id;
    if (!raw) return "";
    if (typeof raw === "object" && raw !== null) {
      const obj = raw as { _id?: string; id?: string };
      return String(obj._id || obj.id || "");
    }
    return String(raw);
  }, [stream?.manager]);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-[10px] uppercase font-semibold">
            Urgent
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] uppercase font-semibold">
            High
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 text-[10px] uppercase font-medium">
            Low
          </Badge>
        );
      case "medium":
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] uppercase font-medium">
            Medium
          </Badge>
        );
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] uppercase gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Done
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] uppercase gap-1">
            <Clock3 className="h-3 w-3 animate-spin" />
            In Progress
          </Badge>
        );
      case "backlog":
        return (
          <Badge variant="outline" className="text-[10px] uppercase">
            Backlog
          </Badge>
        );
      case "todo":
      default:
        return (
          <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 text-[10px] uppercase">
            To Do
          </Badge>
        );
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return "-";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  interface UnifiedMember {
    id: string;
    name: string;
    email?: string;
    role: "Lead" | "Manager" | "Member" | "Assignee" | "Unassigned";
  }

  const unifiedMembers = React.useMemo(() => {
    const map = new Map<string, UnifiedMember>();

    const normalizeId = (raw: unknown): string => {
      if (!raw) return "";
      if (typeof raw === "object" && raw !== null) {
        const obj = raw as { _id?: unknown; id?: unknown };
        return String(obj._id || obj.id || "").trim();
      }
      return String(raw).trim();
    };

    // 1. Lead
    const leadObj = streamLeadMembers?.[0] || stream?.lead?.[0];
    const lId = normalizeId(leadObj?.id || currentLeadId);
    if (lId && lId !== "[object Object]" && lId !== "undefined") {
      map.set(lId, {
        id: lId,
        name:
          leadObj?.name ||
          leadName ||
          (streamType === "project" ? "Project Lead" : "Stream Lead"),
        email: leadObj?.email,
        role: "Lead",
      });
    }

    // 2. Manager
    const mgrObj = streamManagerMembers?.[0] || stream?.manager?.[0];
    const mId = normalizeId(mgrObj?.id || currentManagerId);
    if (mId && mId !== "[object Object]" && mId !== "undefined" && !map.has(mId)) {
      map.set(mId, {
        id: mId,
        name: mgrObj?.name || managerName || "Stream Manager",
        email: mgrObj?.email,
        role: "Manager",
      });
    }

    // 3. API Members
    if (Array.isArray(streamMembers)) {
      streamMembers.forEach((sm) => {
        const smId = normalizeId(sm.memberId || sm.assigneeId);
        if (smId && smId !== "[object Object]" && smId !== "undefined" && !map.has(smId)) {
          map.set(smId, {
            id: smId,
            name: sm.name || sm.assigneeName || "Stream Member",
            email: sm.email,
            role: "Member",
          });
        }
      });
    }

    // 4. Stream Prop Members
    if (Array.isArray(stream?.members)) {
      stream.members.forEach((sm) => {
        const smId = normalizeId(sm.memberId || sm.assigneeId);
        if (smId && smId !== "[object Object]" && smId !== "undefined" && !map.has(smId)) {
          map.set(smId, {
            id: smId,
            name: sm.memberName || sm.assigneeName || "Stream Member",
            role: "Member",
          });
        }
      });
    }

    // 5. Assignees from tasks
    tasks.forEach((t) => {
      const aId = normalizeId(t.assignedId);
      if (aId && aId !== "[object Object]" && aId !== "undefined") {
        if (!map.has(aId)) {
          map.set(aId, {
            id: aId,
            name: t.assigneeName || "Assigned Member",
            role: "Assignee",
          });
        } else if (t.assigneeName && map.get(aId)!.name === "Stream Member") {
          map.get(aId)!.name = t.assigneeName;
        }
      }
    });

    if (isEmpTracker && map.size === 0 && streamId) {
      map.set(streamId, {
        id: streamId,
        name: stream?.name || "Tracked Employee",
        role: "Assignee",
      });
    }

    return Array.from(map.values());
  }, [
    stream,
    streamLeadMembers,
    currentLeadId,
    leadName,
    streamType,
    streamManagerMembers,
    currentManagerId,
    managerName,
    streamMembers,
    tasks,
    isEmpTracker,
    streamId,
  ]);

  const tasksByMemberMap = React.useMemo(() => {
    const map = new Map<string, TaskItem[]>();
    tasks.forEach((task) => {
      const key = task.assignedId ? String(task.assignedId).trim() : "__unassigned__";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(task);
    });
    return map;
  }, [tasks]);

  const unassignedTasks = React.useMemo(() => {
    return tasksByMemberMap.get("__unassigned__") || [];
  }, [tasksByMemberMap]);

  const [selectedMemberId, setSelectedMemberId] = React.useState<string>("");
  const [memberSearchTerm, setMemberSearchTerm] = React.useState<string>("");

  const activeSelectedMemberId = React.useMemo(() => {
    if (selectedMemberId === "__unassigned__" && unassignedTasks.length > 0) {
      return "__unassigned__";
    }
    if (
      selectedMemberId &&
      unifiedMembers.some((m) => m.id === selectedMemberId)
    ) {
      return selectedMemberId;
    }
    if (unifiedMembers.length > 0) {
      return unifiedMembers[0].id;
    }
    if (unassignedTasks.length > 0) {
      return "__unassigned__";
    }
    return "";
  }, [selectedMemberId, unifiedMembers, unassignedTasks.length]);

  const filteredStreamMembers = React.useMemo(() => {
    if (!memberSearchTerm.trim()) return unifiedMembers;
    const term = memberSearchTerm.toLowerCase();
    return unifiedMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        (m.email && m.email.toLowerCase().includes(term)) ||
        m.role.toLowerCase().includes(term)
    );
  }, [unifiedMembers, memberSearchTerm]);

  const isSelectedUnassigned = activeSelectedMemberId === "__unassigned__";
  const selectedMember = React.useMemo(() => {
    if (isSelectedUnassigned) {
      return {
        id: "__unassigned__",
        name: "Unassigned Tasks",
        role: "Unassigned" as const,
      };
    }
    return (
      unifiedMembers.find((m) => m.id === activeSelectedMemberId) || null
    );
  }, [activeSelectedMemberId, isSelectedUnassigned, unifiedMembers]);

  const currentMemberTasks = React.useMemo(() => {
    if (!activeSelectedMemberId) return [];
    return tasksByMemberMap.get(activeSelectedMemberId) || [];
  }, [activeSelectedMemberId, tasksByMemberMap]);

  const memberCompletedCount = React.useMemo(
    () => currentMemberTasks.filter((t) => t.status === "completed").length,
    [currentMemberTasks]
  );
  const memberInProgressCount = React.useMemo(
    () => currentMemberTasks.filter((t) => t.status === "in_progress").length,
    [currentMemberTasks]
  );
  const memberTodoCount = React.useMemo(
    () =>
      currentMemberTasks.filter(
        (t) => t.status === "todo" || t.status === "backlog"
      ).length,
    [currentMemberTasks]
  );

  return (
    <div className="py-6 px-4 sm:px-8 max-w-6xl mx-auto space-y-6">
      {/* 1. Header Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <Link
            href={`/organizations/${currentOrgId}/streams`}
            className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground transition-all duration-150 cursor-pointer group font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Streams Directory</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
          {isLoading ? (
            <Skeleton className="h-4 w-28" />
          ) : (
            <span className="font-semibold text-foreground truncate max-w-[220px] sm:max-w-md">
              {stream?.name || "Stream Detail"}
            </span>
          )}
        </nav>

        {!isLoading && (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs px-2.5 py-0.5 font-medium rounded-full ${typeConfig.badgeColor}`}
            >
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
              </span>
              {typeConfig.statusLabel}
            </Badge>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* 2. Energetic Hero Card */}
      <div
        className={`rounded-2xl border p-5 sm:p-7 shadow-sm transition-all duration-200 bg-gradient-to-br ${typeConfig.bgGradient} bg-card`}
      >
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-56" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <Skeleton className="h-4 w-full max-w-lg mt-3" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Top row: Icon, Name, Type, Description */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-md ${typeConfig.iconBg}`}
                >
                  {typeConfig.icon}
                </div>
                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                      {stream?.name}
                    </h1>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md ${typeConfig.badgeColor}`}
                    >
                      {typeConfig.label}
                    </Badge>
                  </div>

                  {/* Creator and Assignee / Lead Info Row */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap font-medium">
                    <span className="flex items-center gap-1 text-foreground/80">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span>
                        Created by:{" "}
                        <strong className="text-foreground">
                          {creatorName || "Admin"}
                        </strong>
                      </span>
                    </span>

                    <span className="text-border">•</span>

                    <span className="flex items-center gap-1 text-foreground/80">
                      <UserCheck className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {isEmpTracker ? "Assignee / Employee: " : "Lead: "}
                        <strong className="text-foreground">
                          {leadName || (isEmpTracker ? stream?.name : "Not assigned")}
                        </strong>
                      </span>
                    </span>

                    {!isEmpTracker && managerName && (
                      <>
                        <span className="text-border">•</span>
                        <span className="flex items-center gap-1 text-foreground/80">
                          <UserCog className="h-3.5 w-3.5 text-primary" />
                          <span>
                            Manager:{" "}
                            <strong className="text-foreground">
                              {managerName}
                            </strong>
                          </span>
                        </span>
                      </>
                    )}
                  </div>

                  {stream?.description ? (
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl pt-0.5">
                      {stream.description}
                    </p>
                  ) : (
                    <p className="italic text-xs text-muted-foreground/60 pt-0.5">
                      No description provided for this stream.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stat Chips / Key People Grid */}
            {isEmpTracker ? (
              /* Employee Tracker: Only Employee/Assignee, Creator, and Timeline (NO Manager, NO Members) */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-border/50">
                {/* Tracked Employee Card */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/60">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-semibold text-xs">
                    {getInitials(leadName || stream?.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      Tracked Employee / Assignee
                    </p>
                    <p className="text-xs font-semibold text-foreground truncate">
                      {leadName || stream?.name || "Unassigned"}
                    </p>
                  </div>
                </div>

                {/* Stream Creator Card */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/60">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 font-semibold text-xs">
                    {creatorName ? getInitials(creatorName) : <User className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      Created By
                    </p>
                    <p className="text-xs font-semibold text-foreground truncate">
                      {creatorName || "Admin / Creator"}
                    </p>
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/60">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 font-semibold text-xs">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      Tracking Started
                    </p>
                    <p className="text-xs font-semibold text-foreground truncate">
                      {createdDate || "Recently"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Department & Project: Lead, Manager, Creator, Members Count, and Timeline */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-border/50">
                {/* Lead / Assignee Card */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/60">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 font-semibold text-xs">
                    {leadName ? getInitials(leadName) : <UserCheck className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      {streamType === "project" ? "Lead / Assignee" : "Lead"}
                    </p>
                    <p className="text-xs font-semibold text-foreground truncate">
                      {leadName || "Not assigned"}
                    </p>
                  </div>
                </div>

                {/* Manager Card */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/60">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 font-semibold text-xs">
                    {managerName ? getInitials(managerName) : <UserCog className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      Manager
                    </p>
                    <p className="text-xs font-semibold text-foreground truncate">
                      {managerName || "Not assigned"}
                    </p>
                  </div>
                </div>

                {/* Stream Creator Card */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/60">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 font-semibold text-xs">
                    {creatorName ? getInitials(creatorName) : <User className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      Created By
                    </p>
                    <p className="text-xs font-semibold text-foreground truncate">
                      {creatorName || "Admin / Creator"}
                    </p>
                  </div>
                </div>

                {/* Team Members Count Card */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/60">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-semibold text-xs">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      Members
                    </p>
                    <p className="text-xs font-semibold text-foreground">
                      {membersList.length} {membersList.length === 1 ? "person" : "people"}
                    </p>
                  </div>
                </div>

                {/* Created Timeline Card */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/60">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 font-semibold text-xs">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      Created
                    </p>
                    <p className="text-xs font-semibold text-foreground truncate">
                      {createdDate || "Recently"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons Panel (For every stream: Add Task, plus Member/Lead/Manager for Dept & Project) */}
            <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={openAddTask}
                className="text-xs h-8.5 rounded-lg transition-all cursor-pointer gap-1.5 shadow-2xs font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </Button>

              {!isEmpTracker && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openAddMember}
                    className="text-xs h-8.5 rounded-lg border-border/80 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer gap-1.5 shadow-2xs font-medium"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-primary" />
                    <span>Add Member</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openAddLead}
                    className="text-xs h-8.5 rounded-lg border-border/80 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer gap-1.5 shadow-2xs font-medium"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                    <span>Add Lead</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openAddManager}
                    className="text-xs h-8.5 rounded-lg border-border/80 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer gap-1.5 shadow-2xs font-medium"
                  >
                    <UserCog className="h-3.5 w-3.5 text-primary" />
                    <span>Add Manager</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. Navigation Tabs: Tasks vs Employee-wise Tasks vs Team vs Details */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab("tasks")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "tasks"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <ListTodo className="h-4 w-4" />
          <span>Tasks</span>
          <Badge
            variant={activeTab === "tasks" ? "outline" : "secondary"}
            className={`text-[10px] h-4 px-1.5 ${
              activeTab === "tasks"
                ? "border-primary-foreground/30 text-primary-foreground"
                : ""
            }`}
          >
            {tasks.length}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("memberTasks")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "memberTasks"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Employee-wise Tasks</span>
          <Badge
            variant={activeTab === "memberTasks" ? "outline" : "secondary"}
            className={`text-[10px] h-4 px-1.5 ${
              activeTab === "memberTasks"
                ? "border-primary-foreground/30 text-primary-foreground"
                : ""
            }`}
          >
            {unifiedMembers.length}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === "team"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
        >
          {isEmpTracker ? (
            <>
              <UserCheck className="h-4 w-4" />
              <span>Employee Info</span>
            </>
          ) : (
            <>
              <Users className="h-4 w-4" />
              <span>Team & Leadership</span>
              <Badge
                variant={activeTab === "team" ? "outline" : "secondary"}
                className={`text-[10px] h-4 px-1.5 ${activeTab === "team"
                  ? "border-primary-foreground/30 text-primary-foreground"
                  : ""
                  }`}
              >
                {membersList.length + (leadName ? 1 : 0) + (managerName ? 1 : 0)}
              </Badge>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === "about"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
        >
          <Shield className="h-4 w-4" />
          <span>Overview</span>
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB A: TASKS */}
      {activeTab === "tasks" && (
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          {/* Table Header / Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/60 bg-muted/10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ListTodo className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Stream Tasks</h2>
                <p className="text-xs text-muted-foreground">
                  Actionable work items tracked within this stream
                </p>
              </div>
            </div>

            {/* Quick search input & Add Task Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="pl-8 text-xs h-8.5 rounded-lg"
                />
              </div>

              <Button
                type="button"
                size="sm"
                onClick={openAddTask}
                className="text-xs h-8.5 gap-1.5 cursor-pointer shrink-0 font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </Button>
            </div>
          </div>

          {/* Shadow Loader */}
          {isLoadingTasks ? (
            <div className="p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-6 gap-4 pb-2 border-b border-border/60">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-16 ml-auto" />
              </div>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-6 gap-4 py-3 items-center border-b border-border/40 last:border-b-0 animate-pulse"
                >
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-5 w-16 ml-auto rounded-lg" />
                </div>
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/60">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Title</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Priority</th>
                    <th className="py-3 px-4 font-semibold">Assignee</th>
                    <th className="py-3 px-4 font-semibold">Due Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-foreground">
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium truncate max-w-xs text-foreground">
                        {task.title}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(task.status)}</td>
                      <td className="py-3 px-4">{getPriorityBadge(task.priority)}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {task.assigneeName || "Unassigned"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {task.dueDate || "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View button with Eye icon */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingTask(task)}
                            title="View Task Details & Time Tracker"
                            className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md cursor-pointer transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {/* Edit button with Pencil icon */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingTask(task)}
                            title="Edit Task"
                            className="h-7 w-7 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 rounded-md cursor-pointer transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {/* Delete button with Trash2 icon */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingTask(task)}
                            title="Delete Task"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Energetic Empty State */
            <div className="py-14 px-4 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                <ListTodo className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {taskSearch ? "No tasks matching your search" : "No tasks in this stream yet"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {taskSearch
                    ? "Try clearing the search filter to see all tasks."
                    : "Tasks created for this stream will automatically appear here."}
                </p>
                {!taskSearch && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={openAddTask}
                    className="text-xs h-8.5 gap-1.5 cursor-pointer mt-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create First Task</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: EMPLOYEE-WISE TASKS (Master-Detail) */}
      {activeTab === "memberTasks" && (
        <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border/60 bg-muted/10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Employee-wise Stream Tasks
                </h2>
                <p className="text-xs text-muted-foreground">
                  View and manage tasks filtered by each member of this stream
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs px-2.5 py-1 font-medium bg-background"
              >
                {unifiedMembers.length}{" "}
                {unifiedMembers.length === 1 ? "Member" : "Members"} •{" "}
                {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
              </Badge>
            </div>
          </div>

          {/* Master-Detail 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            {/* Left Column: Member Master List (4 of 12 cols on desktop) */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-border/60 bg-muted/5 flex flex-col">
              {/* Member Search */}
              <div className="p-3 border-b border-border/60 bg-background/50">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filter stream members..."
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                    className="pl-8 text-xs h-8 rounded-lg bg-background"
                  />
                </div>
              </div>

              {/* Members List */}
              <div className="flex-1 overflow-y-auto divide-y divide-border/40 max-h-[600px]">
                {isLoadingMembers && unifiedMembers.length === 0 ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 animate-pulse"
                      >
                        <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-3.5 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredStreamMembers.length > 0 ? (
                  <>
                    {filteredStreamMembers.map((member) => {
                      const isSelected = activeSelectedMemberId === member.id;
                      const memberTasks = tasksByMemberMap.get(member.id) || [];
                      const completedCount = memberTasks.filter(
                        (t) => t.status === "completed"
                      ).length;

                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => setSelectedMemberId(member.id)}
                          className={`w-full text-left p-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary/10 border-l-4 border-primary text-foreground shadow-2xs"
                              : "hover:bg-muted/40 text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Initials Avatar */}
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs transition-colors ${
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-xs"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {getInitials(member.name)}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-xs truncate">
                                  {member.name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] px-1.5 py-0 uppercase font-semibold shrink-0 ${
                                    member.role === "Lead"
                                      ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                      : member.role === "Manager"
                                      ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                      : member.role === "Member"
                                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  }`}
                                >
                                  {member.role}
                                </Badge>
                              </div>
                              {member.email ? (
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {member.email}
                                </p>
                              ) : (
                                <p className="text-[11px] text-muted-foreground/60 font-mono">
                                  ID: {member.id.slice(0, 8)}...
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Task Badge count */}
                          <div className="text-right shrink-0">
                            <Badge
                              variant={isSelected ? "default" : "secondary"}
                              className="text-[10px] h-5 px-1.5 font-medium"
                            >
                              {memberTasks.length}{" "}
                              {memberTasks.length === 1 ? "task" : "tasks"}
                            </Badge>
                            {memberTasks.length > 0 && (
                              <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                                {completedCount}/{memberTasks.length} done
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}

                    {/* Unassigned Tasks pseudo-member if any exist */}
                    {unassignedTasks.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedMemberId("__unassigned__")}
                        className={`w-full text-left p-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer border-t border-dashed border-border/70 ${
                          activeSelectedMemberId === "__unassigned__"
                            ? "bg-amber-500/10 border-l-4 border-amber-500 text-foreground"
                            : "hover:bg-muted/40 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                              activeSelectedMemberId === "__unassigned__"
                                ? "bg-amber-500 text-white"
                                : "bg-amber-500/10 text-amber-600"
                            }`}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-foreground truncate block">
                              Unassigned Tasks
                            </span>
                            <p className="text-[11px] text-muted-foreground truncate">
                              Tasks with no assigned stream member
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant="secondary"
                          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px] h-5 px-1.5 font-medium shrink-0"
                        >
                          {unassignedTasks.length} tasks
                        </Badge>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center text-muted-foreground space-y-2">
                    <User className="h-7 w-7 mx-auto opacity-40" />
                    <p className="text-xs font-medium">No members found</p>
                    <p className="text-[11px]">
                      {memberSearchTerm
                        ? "Try clearing your member search term."
                        : "No members currently enrolled in this stream."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Detail Panel for Selected Member Tasks (8 of 12 cols on desktop) */}
            <div className="lg:col-span-8 flex flex-col bg-card">
              {selectedMember ? (
                <>
                  {/* Selected Member Header Card */}
                  <div className="p-4 sm:p-5 border-b border-border/60 bg-muted/5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold text-sm shadow-xs ${
                            isSelectedUnassigned
                              ? "bg-amber-500 text-white"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {isSelectedUnassigned ? (
                            <AlertCircle className="h-5 w-5" />
                          ) : (
                            getInitials(selectedMember.name)
                          )}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-bold text-foreground truncate">
                              {selectedMember.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0 uppercase font-semibold ${
                                selectedMember.role === "Lead"
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                  : selectedMember.role === "Manager"
                                  ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                  : selectedMember.role === "Member"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : selectedMember.role === "Unassigned"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              }`}
                            >
                              {selectedMember.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                            {selectedMember.email && (
                              <span>{selectedMember.email}</span>
                            )}
                            {selectedMember.email &&
                              !isSelectedUnassigned && <span>•</span>}
                            {!isSelectedUnassigned && (
                              <span className="font-mono text-muted-foreground/70">
                                ID: {selectedMember.id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!isSelectedUnassigned && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                setPrefilledMemberId(selectedMember.id);
                                openAddTask();
                              }}
                              className="text-xs h-8 gap-1.5 cursor-pointer font-medium"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Assign Task</span>
                            </Button>

                            <Link
                              href={`/employee/${selectedMember.id}/taskpanel?orgId=${currentOrgId || ""}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/80 hover:bg-muted/70 text-foreground transition-colors cursor-pointer"
                              title="Open global task panel for this employee"
                            >
                              <span>Employee Panel</span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </Link>
                          </>
                        )}
                        {isSelectedUnassigned && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={openAddTask}
                            className="text-xs h-8 gap-1.5 cursor-pointer font-medium"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Create Task</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Task Progress & Metrics Chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl border border-border/60 bg-background/60">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                          Total Tasks
                        </span>
                        <p className="text-sm font-bold text-foreground">
                          {currentMemberTasks.length}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl border border-border/60 bg-background/60">
                        <span className="text-[10px] uppercase font-semibold text-emerald-600">
                          Completed
                        </span>
                        <p className="text-sm font-bold text-emerald-600">
                          {memberCompletedCount}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl border border-border/60 bg-background/60">
                        <span className="text-[10px] uppercase font-semibold text-amber-600">
                          In Progress
                        </span>
                        <p className="text-sm font-bold text-amber-600">
                          {memberInProgressCount}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl border border-border/60 bg-background/60">
                        <span className="text-[10px] uppercase font-semibold text-sky-600">
                          To Do
                        </span>
                        <p className="text-sm font-bold text-sky-600">
                          {memberTodoCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tasks Table for this member */}
                  <div className="flex-1 overflow-x-auto">
                    {currentMemberTasks.length > 0 ? (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/60">
                          <tr>
                            <th className="py-3 px-4 font-semibold">Title</th>
                            <th className="py-3 px-4 font-semibold">Status</th>
                            <th className="py-3 px-4 font-semibold">Priority</th>
                            <th className="py-3 px-4 font-semibold">Assigner</th>
                            <th className="py-3 px-4 font-semibold">Due Date</th>
                            <th className="py-3 px-4 font-semibold">Time Logged</th>
                            <th className="py-3 px-4 font-semibold text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-foreground">
                          {currentMemberTasks.map((task) => (
                            <tr
                              key={task.id}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <td className="py-3 px-4 font-medium truncate max-w-xs text-foreground">
                                <div>
                                  <span className="font-semibold block truncate">
                                    {task.title || task.taskname}
                                  </span>
                                  {task.description && (
                                    <span className="text-[11px] text-muted-foreground truncate block max-w-xs">
                                      {task.description}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {getStatusBadge(task.status)}
                              </td>
                              <td className="py-3 px-4">
                                {getPriorityBadge(task.priority)}
                              </td>
                              <td className="py-3 px-4 text-muted-foreground">
                                {task.assignerName || "Admin"}
                              </td>
                              <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                                {task.dueDate || "-"}
                              </td>
                              <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                                {formatDuration(task.totalTimeSpent)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewingTask(task)}
                                    title="View Task Details & Time Tracker"
                                    className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md cursor-pointer transition-colors"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingTask(task)}
                                    title="Edit Task"
                                    className="h-7 w-7 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 rounded-md cursor-pointer transition-colors"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeletingTask(task)}
                                    title="Delete Task"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="py-16 px-4 text-center space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                          <ListTodo className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-foreground">
                            No tasks assigned in this stream
                          </h4>
                          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            {isSelectedUnassigned
                              ? "All tasks in this stream have been assigned to members."
                              : `There are currently no tasks assigned to ${selectedMember.name} in this stream.`}
                          </p>
                          {!isSelectedUnassigned && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                setPrefilledMemberId(selectedMember.id);
                                openAddTask();
                              }}
                              className="text-xs h-8.5 gap-1.5 cursor-pointer mt-3"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Assign First Task</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-20 px-4 text-center space-y-3">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Select a member from the left to view their tasks in this stream
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB B: TEAM / EMPLOYEE & ROLES */}
      {activeTab === "team" && (
        isEmpTracker ? (
          /* Employee Tracker: Only Tracked Employee and Creator (NO Manager, NO Members) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tracked Employee Card */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Tracked Employee</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Individual assigned to this tracker stream
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border/60 bg-muted/20">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xs">
                  {getInitials(leadName || stream?.name)}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                    Employee / Assignee
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    {leadName || stream?.name || "Unassigned"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All tasks in this stream directly correlate to this employee
                  </p>
                </div>
              </div>
            </div>

            {/* Stream Creator & Supervision Card */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Supervision</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Authority who initialized this employee tracker
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border/60 bg-muted/20">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">
                  {creatorName ? getInitials(creatorName) : <User className="h-5 w-5" />}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                    Created By
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    {creatorName || "Admin / Creator"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supervising administrator
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Department & Project: Leadership Box (Lead, Manager, Creator) and Members Box */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Leadership & Creator Box */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Leadership & Governance</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Assigned Lead, Manager, and Creator
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* Lead card */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs">
                      {leadName ? getInitials(leadName) : <UserCheck className="h-4 w-4" />}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                        {streamType === "project" ? "Lead / Assignee" : "Stream Lead"}
                      </span>
                      <p className="text-xs font-semibold text-foreground">
                        {leadName || "No lead assigned"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={openAddLead}
                    className="text-xs h-7 text-primary hover:text-primary/80 cursor-pointer"
                  >
                    {leadName ? "Change" : "Assign"}
                  </Button>
                </div>

                {/* Manager card */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-xs shadow-xs">
                      {managerName ? getInitials(managerName) : <UserCog className="h-4 w-4" />}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">
                        Stream Manager
                      </span>
                      <p className="text-xs font-semibold text-foreground">
                        {managerName || "No manager assigned"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={openAddManager}
                    className="text-xs h-7 text-primary hover:text-primary/80 cursor-pointer"
                  >
                    {managerName ? "Change" : "Assign"}
                  </Button>
                </div>

                {/* Creator card */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs">
                      {creatorName ? getInitials(creatorName) : <User className="h-4 w-4" />}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                        Created By
                      </span>
                      <p className="text-xs font-semibold text-foreground">
                        {creatorName || "Admin / Creator"}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground px-2 py-0.5 rounded bg-muted/50">
                    Author
                  </span>
                </div>
              </div>
            </div>

            {/* Stream Members Component */}
            <StreamMembersView
              streamId={streamId}
              organisationId={currentOrgId}
              onAddMember={openAddMember}
              isEmpTracker={isEmpTracker}
            />
          </div>
        )
      )}

      {/* TAB C: OVERVIEW & DETAILS */}
      {activeTab === "about" && (
        <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Stream Information & Metadata
              </h3>
              <p className="text-xs text-muted-foreground">
                Detailed configuration and hierarchy of this stream
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 p-3.5 rounded-xl border border-border/60 bg-muted/10">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Stream ID
              </span>
              <p className="font-mono text-xs text-foreground select-all break-all">
                {stream?._id || streamId}
              </p>
            </div>

            <div className="space-y-1 p-3.5 rounded-xl border border-border/60 bg-muted/10">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Stream Type
              </span>
              <p className="font-semibold text-foreground capitalize">
                {typeConfig.label}
              </p>
            </div>

            <div className="space-y-1 p-3.5 rounded-xl border border-border/60 bg-muted/10">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Created By
              </span>
              <p className="font-medium text-foreground">
                {creatorName || "System / Admin"}
              </p>
            </div>

            <div className="space-y-1 p-3.5 rounded-xl border border-border/60 bg-muted/10">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                {isEmpTracker ? "Tracked Employee / Assignee" : "Lead / Assignee"}
              </span>
              <p className="font-medium text-foreground">
                {leadName || (isEmpTracker ? stream?.name : "Not assigned")}
              </p>
            </div>

            {!isEmpTracker && (
              <div className="space-y-1 p-3.5 rounded-xl border border-border/60 bg-muted/10">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Manager
                </span>
                <p className="font-medium text-foreground">
                  {managerName || "Not assigned"}
                </p>
              </div>
            )}

            <div className="space-y-1 p-3.5 rounded-xl border border-border/60 bg-muted/10">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Creation Date
              </span>
              <p className="font-medium text-foreground">{createdDate || "N/A"}</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modals (Cleanly reused from ../stream & ../task) */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={closeAddTask}
        onSuccess={refetch}
        stream={stream}
        streamId={streamId}
        organisationId={currentOrgId}
        initialAssignedId={prefilledMemberId}
      />

      <ViewTaskModal
        isOpen={Boolean(viewingTask)}
        onClose={closeViewTask}
        task={viewingTask}
        onTaskUpdated={refetchTasks}
      />

      <EditTaskModal
        isOpen={Boolean(editingTask)}
        onClose={closeEditTask}
        onSuccess={refetch}
        task={editingTask}
        stream={stream}
        streamId={streamId}
        organisationId={currentOrgId}
      />

      <DeleteTaskModal
        isOpen={Boolean(deletingTask)}
        onClose={closeDeleteTask}
        onSuccess={refetch}
        task={deletingTask}
      />

      <AddStreamMemberModal
        isOpen={isAddMemberOpen}
        onClose={closeAddMember}
        onSuccess={refetch}
        organisationId={currentOrgId}
        streamId={streamId}
        role="member"
        title="Add Member to Stream"
        subtitle="Select an organization member to add to this stream"
        existingIds={existingMemberIds}
      />

      <AddStreamMemberModal
        isOpen={isAddLeadOpen}
        onClose={closeAddLead}
        onSuccess={refetch}
        organisationId={currentOrgId}
        streamId={streamId}
        role="lead"
        title="Add Stream Lead"
        subtitle="Select an organization member to assign as lead of this stream"
        existingIds={currentLeadId ? [currentLeadId] : []}
      />

      <AddStreamMemberModal
        isOpen={isAddManagerOpen}
        onClose={closeAddManager}
        onSuccess={refetch}
        organisationId={currentOrgId}
        streamId={streamId}
        role="manager"
        title="Add Stream Manager"
        subtitle="Select an organization member to assign as manager of this stream"
        existingIds={currentManagerId ? [currentManagerId] : []}
      />
    </div>
  );
}

// Backward-compatible alias
export const StreamDetailView = SpecificStreamView;
export default SpecificStreamView;
