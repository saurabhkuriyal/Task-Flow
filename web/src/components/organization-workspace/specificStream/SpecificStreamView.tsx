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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useStreamDetail } from "@/hooks/stream/useStreamDetail";
import { AddStreamMemberModal } from "../stream";
import { StreamMembersView } from "@/components/subStream";

export function SpecificStreamView() {
  const {
    stream,
    tasks,
    isLoading,
    error,
    currentOrgId,
    streamId,
    refetch,
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

  const [activeTab, setActiveTab] = React.useState<"tasks" | "team" | "about">(
    "tasks"
  );
  const [taskSearch, setTaskSearch] = React.useState("");

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

  const filteredTasks = React.useMemo(() => {
    if (!taskSearch.trim()) return tasks;
    const term = taskSearch.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.assigneeName?.toLowerCase().includes(term) ||
        t.status.toLowerCase().includes(term)
    );
  }, [tasks, taskSearch]);

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

            {/* Action Buttons Panel (Only for Department & Project) */}
            {!isEmpTracker && (
              <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-2">
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Navigation Tabs: Tasks vs Team vs Details */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
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
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "team"
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
                className={`text-[10px] h-4 px-1.5 ${
                  activeTab === "team"
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
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "about"
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

            {/* Quick search input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="pl-8 text-xs h-8.5 rounded-lg"
              />
            </div>
          </div>

          {/* Shadow Loader */}
          {isLoading ? (
            <div className="p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-5 gap-4 pb-2 border-b border-border/60">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-20" />
              </div>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-5 gap-4 py-3 items-center border-b border-border/40 last:border-b-0 animate-pulse"
                >
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-20" />
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
              </div>
            </div>
          )}
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

      {/* 5. Modals (Cleanly reused from ../stream) */}
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
