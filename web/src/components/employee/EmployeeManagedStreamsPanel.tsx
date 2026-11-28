"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  FolderKanban,
  Hash,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  AlertOctagon,
  ListTodo,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFetchStreamByEmpId,
  isEmployeeManagerOfStream,
  isEmployeeLeadOfStream,
  type StreamTypeFilter,
  type StreamEmpRoleFilter,
} from "@/hooks/stream/useFetchStreamByEmpId";
import type { StreamItem } from "@/services/stream.service";

export interface EmployeeManagedStreamsPanelProps {
  empId: string;
  orgId?: string;
}

function getInitials(name?: string): string {
  if (!name) return "EM";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateString?: string): string | null {
  if (!dateString) return null;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export function EmployeeManagedStreamsPanel({
  empId,
  orgId,
}: EmployeeManagedStreamsPanelProps) {
  const router = useRouter();

  const {
    filteredStreams,
    employee,
    stats,
    isLoading,
    isRefreshing,
    error,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    roleFilter,
    setRoleFilter,
    refetch,
  } = useFetchStreamByEmpId({ empId, organisationId: orgId });

  const taskPanelHref = orgId
    ? `/employee/${empId}/taskpanel?orgId=${orgId}`
    : `/employee/${empId}/taskpanel`;
  const backUrl = orgId ? `/organizations/${orgId}/streams` : "/organizations";

  const typeTabs: { label: string; value: StreamTypeFilter; count: number }[] = [
    { label: "All", value: "all", count: stats.total },
    { label: "Departments", value: "department", count: stats.departmentCount },
    { label: "Projects", value: "project", count: stats.projectCount },
  ];

  const roleTabs: { label: string; value: StreamEmpRoleFilter; count: number }[] =
    [
      { label: "All Roles", value: "all", count: stats.total },
      { label: "Manager", value: "manager", count: stats.managerCount },
      { label: "Lead", value: "lead", count: stats.leadCount },
    ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4 sm:space-y-5">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
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
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              <span>Back</span>
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
                Managed Streams & Projects
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefreshing || isLoading}
              className="h-8 px-2.5 text-xs cursor-pointer"
              title="Refresh streams"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 sm:mr-1.5 ${
                  isRefreshing ? "animate-spin text-primary" : ""
                }`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? "Syncing..." : "Refresh"}
              </span>
            </Button>

            <Link href={taskPanelHref}>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="h-8 px-3 text-xs cursor-pointer gap-1.5 shadow-xs font-medium"
              >
                <ListTodo className="h-3.5 w-3.5" />
                <span>Your Tasks</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Employee Header Card */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs">
          {isLoading ? (
            <div className="flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-3.5 w-32" />
                </div>
              </div>
              <Skeleton className="h-9 w-40 rounded-lg" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-blue-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-base border border-indigo-500/30 shadow-inner">
                  {getInitials(employee?.name)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">
                      {employee?.name || "Employee"}
                    </h1>
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-semibold border-primary/30 text-primary bg-primary/5"
                    >
                      {employee?.role || "employee"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {employee?.email && (
                      <span className="flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{employee.email}</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-muted/60 px-2 py-0.5 rounded border border-border/60 text-foreground">
                      <Hash className="h-2.5 w-2.5 text-primary/70" />
                      <span className="truncate max-w-[140px] sm:max-w-none">
                        {empId}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Role & Stream Summary Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl border border-border/60 bg-muted/30 text-xs flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground">Total:</span>
                  <strong className="text-foreground">{stats.total}</strong>
                </div>
                <div className="px-3 py-1.5 rounded-xl border border-purple-500/20 bg-purple-500/5 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="text-muted-foreground">Manager:</span>
                  <strong className="text-foreground">{stats.managerCount}</strong>
                </div>
                <div className="px-3 py-1.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-muted-foreground">Lead:</span>
                  <strong className="text-foreground">{stats.leadCount}</strong>
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
              className="text-xs h-7 px-2 border-destructive/30 cursor-pointer"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search departments or projects..."
                className="pl-8 h-8.5 text-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Type and Role Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="inline-flex items-center rounded-lg border border-border/70 bg-muted/30 p-0.5">
                {typeTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setTypeFilter(tab.value)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      typeFilter === tab.value
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              <div className="inline-flex items-center rounded-lg border border-border/70 bg-muted/30 p-0.5">
                {roleTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setRoleFilter(tab.value)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      roleFilter === tab.value
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Streams & Projects Grid */}
        <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3"
                >
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredStreams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStreams.map((stream) => (
                <ManagedStreamCard
                  key={stream._id || stream.id}
                  stream={stream}
                  empId={empId}
                  fallbackOrgId={orgId}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 px-4 text-center space-y-2.5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <FolderKanban className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {searchTerm || typeFilter !== "all" || roleFilter !== "all"
                  ? "No Matching Streams or Projects"
                  : "No Streams or Projects Assigned as Manager or Lead"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {searchTerm || typeFilter !== "all" || roleFilter !== "all"
                  ? "Try clearing your search or changing the filters to view more items."
                  : "This employee is not currently assigned as a manager or lead on any department or project."}
              </p>
              {(searchTerm || typeFilter !== "all" || roleFilter !== "all") && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setTypeFilter("all");
                    setRoleFilter("all");
                  }}
                  className="text-xs h-8 mt-2 cursor-pointer"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ManagedStreamCard({
  stream,
  empId,
  fallbackOrgId,
}: {
  stream: StreamItem;
  empId: string;
  fallbackOrgId?: string;
}) {
  const streamId = stream._id || stream.id || "";
  const targetOrgId = stream.organisationId || fallbackOrgId || "";
  const streamHref = targetOrgId
    ? `/employee/${empId}/empStream/${streamId}?orgId=${targetOrgId}`
    : `/employee/${empId}/empStream/${streamId}`;

  const isManager = isEmployeeManagerOfStream(stream, empId);
  const isLead = isEmployeeLeadOfStream(stream, empId);
  const isProject = stream.type === "project";
  const membersCount = Array.isArray(stream.members) ? stream.members.length : 0;
  const createdDate = formatDate(stream.createdAt);

  return (
    <Link
      href={streamHref}
      className="group flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="space-y-3">
        {/* Card Header: Icon, Name, Type Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isProject
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isProject ? (
                <FolderKanban className="h-4.5 w-4.5" />
              ) : (
                <Building2 className="h-4.5 w-4.5" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {stream.name}
              </h3>
              {stream.organisationName && (
                <p className="text-[11px] text-muted-foreground truncate">
                  {stream.organisationName}
                </p>
              )}
            </div>
          </div>

          <Badge variant="outline" className="text-[10px] uppercase shrink-0">
            {isProject ? "Project" : "Department"}
          </Badge>
        </div>

        {/* Description */}
        {stream.description ? (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {stream.description}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/60 italic">
            No description provided.
          </p>
        )}

        {/* Employee Role Badges on this Stream */}
        <div className="flex flex-wrap items-center gap-1.5">
          {isManager && (
            <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] font-semibold gap-1">
              <ShieldCheck className="h-3 w-3" />
              Manager
            </Badge>
          )}
          {isLead && (
            <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] font-semibold gap-1">
              <UserCheck className="h-3 w-3" />
              Lead
            </Badge>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>
              {membersCount} {membersCount === 1 ? "member" : "members"}
            </span>
          </span>
          {createdDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{createdDate}</span>
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-primary font-medium group-hover:translate-x-0.5 transition-transform">
          Open <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

export default EmployeeManagedStreamsPanel;
