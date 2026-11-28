"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  FolderKanban,
  Users,
  ShieldCheck,
  UserCheck,
  ListTodo,
  Clock3,
  CheckCircle2,
  ArrowRight,
  AlertOctagon,
  User as UserIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizationHome } from "@/hooks/organizations/useOrganizationHome";
import { OrganizationInfoBanner } from "./OrganizationInfoBanner";
import {
  OrgTaskStatusChart,
  OrgPriorityChart,
  OrgStreamWorkloadChart,
  OrgTeamStructureChart,
  OrgWeeklyTrendChart,
} from "./OrganizationCharts";
import type { OrganizationDocumentData } from "@/types/organization";

export interface OrganizationHomeViewProps {
  orgId: string;
  initialOrganization?: OrganizationDocumentData | null;
}

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function OrganizationHomeView({
  orgId,
  initialOrganization = null,
}: OrganizationHomeViewProps) {
  const {
    organization,
    organizationName,
    departments,
    projects,
    members,
    employees,
    managers,
    leads,
    taskStats,
    teamStats,
    streamWorkload,
    weeklyTrend,
    isLoading,
    isTasksLoading,
    isAnalyticsLoading,
    error,
    refetch,
  } = useOrganizationHome({ orgId, initialOrganization });

  const combinedLoading = isLoading || isTasksLoading;

  return (
    <div className="py-6 px-4 sm:px-8 max-w-7xl mx-auto space-y-6 pb-16">
      {/* 1. Organization Info Top Panel */}
      <OrganizationInfoBanner
        orgId={orgId}
        organizationName={organizationName}
        organization={organization}
        actualMembersCount={members.length}
        departmentsCount={departments.length}
        projectsCount={projects.length}
        isLoading={isLoading}
        onRefresh={refetch}
      />

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
            onClick={refetch}
            className="text-xs h-7 px-2.5 border-destructive/30 cursor-pointer"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 2. Masonry Grid Dashboard */}
      <div className="columns-1 md:columns-2 xl:columns-3 gap-4 [&>*]:break-inside-avoid [&>*]:mb-4">
        {/* Card A: Tasks & Pending Tasks Summary */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ListTodo className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Tasks Overview
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Across all departments & projects
                </p>
              </div>
            </div>
            <Link
              href={`/organizations/${orgId}/streams`}
              className="text-xs text-primary hover:underline inline-flex items-center gap-0.5 font-medium"
            >
              Streams <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {combinedLoading ? (
            <div className="grid grid-cols-2 gap-3 animate-pulse">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                    <span>Total Tasks</span>
                    <ListTodo className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-foreground">
                    {taskStats.total}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{taskStats.completed} completed</span>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    <span>Pending Tasks</span>
                    <Clock3 className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-foreground">
                    {taskStats.pending}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {taskStats.inProgress} in progress · {taskStats.todo} to do
                  </div>
                </div>
              </div>

              {/* Quick status chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <Badge variant="outline" className="font-normal">
                  In Review: {taskStats.inReview}
                </Badge>
                <Badge
                  variant="outline"
                  className="font-normal border-rose-500/30 text-rose-600 dark:text-rose-400"
                >
                  Blocked: {taskStats.blocked}
                </Badge>
                <Badge variant="outline" className="font-normal">
                  Backlog: {taskStats.backlog}
                </Badge>
                <Badge
                  variant="outline"
                  className="font-normal border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                >
                  Direct Tasks: {taskStats.directTasks}
                </Badge>
                <Badge variant="outline" className="font-normal">
                  Stream Tasks: {taskStats.streamTasks}
                </Badge>
              </div>
            </>
          )}
        </div>

        {/* Card B: Task Status Donut Graph */}
        <OrgTaskStatusChart
          taskStats={taskStats}
          isLoading={combinedLoading}
        />

        {/* Card B2: 7-Day Task Activity Trend */}
        <OrgWeeklyTrendChart
          weeklyTrend={weeklyTrend}
          isLoading={isAnalyticsLoading}
        />

        {/* Card C: Departments Masonry Card */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    Departments
                  </h2>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {departments.length}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Functional divisions & leads
                </p>
              </div>
            </div>
            <Link
              href={`/organizations/${orgId}/streams`}
              className="text-xs text-primary hover:underline inline-flex items-center gap-0.5 font-medium"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2.5 animate-pulse">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : departments.length > 0 ? (
            <div className="space-y-2">
              {departments.slice(0, 5).map((dept) => {
                const streamId = dept._id || dept.id || "";
                const leadName = dept.lead?.[0]?.name || "No lead";
                const memberCount = dept.members?.length || 0;
                return (
                  <Link
                    key={streamId}
                    href={`/organizations/${orgId}/streams/${streamId}`}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40 transition-all group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {dept.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        Lead: {leadName}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {memberCount} {memberCount === 1 ? "member" : "members"}
                    </Badge>
                  </Link>
                );
              })}
              {departments.length > 5 && (
                <div className="text-center pt-1">
                  <Link
                    href={`/organizations/${orgId}/streams`}
                    className="text-[11px] text-primary hover:underline"
                  >
                    +{departments.length - 5} more departments
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="py-5 text-center text-xs text-muted-foreground">
              No departments created yet.
            </div>
          )}
        </div>

        {/* Card D: Stream Task Workload Graph */}
        <OrgStreamWorkloadChart
          orgId={orgId}
          streamWorkload={streamWorkload}
          isLoading={combinedLoading}
        />

        {/* Card E: Projects Masonry Card */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FolderKanban className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    Projects
                  </h2>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {projects.length}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Active initiatives & delivery streams
                </p>
              </div>
            </div>
            <Link
              href={`/organizations/${orgId}/streams`}
              className="text-xs text-primary hover:underline inline-flex items-center gap-0.5 font-medium"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2.5 animate-pulse">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : projects.length > 0 ? (
            <div className="space-y-2">
              {projects.slice(0, 5).map((proj) => {
                const streamId = proj._id || proj.id || "";
                const managerName =
                  proj.manager?.[0]?.name || proj.lead?.[0]?.name || "Unassigned";
                const memberCount = proj.members?.length || 0;
                return (
                  <Link
                    key={streamId}
                    href={`/organizations/${orgId}/streams/${streamId}`}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40 transition-all group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {proj.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        Owner: {managerName}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {memberCount} {memberCount === 1 ? "member" : "members"}
                    </Badge>
                  </Link>
                );
              })}
              {projects.length > 5 && (
                <div className="text-center pt-1">
                  <Link
                    href={`/organizations/${orgId}/streams`}
                    className="text-[11px] text-primary hover:underline"
                  >
                    +{projects.length - 5} more projects
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="py-5 text-center text-xs text-muted-foreground">
              No projects created yet.
            </div>
          )}
        </div>

        {/* Card F: Employees / Members Masonry Card */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    Employees
                  </h2>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {employees.length} / {members.length}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {employees.length} employees across {members.length} total team
                  members
                </p>
              </div>
            </div>
            <Link
              href={`/organizations/${orgId}/members`}
              className="text-xs text-primary hover:underline inline-flex items-center gap-0.5 font-medium"
            >
              Team <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2.5 animate-pulse">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ) : members.length > 0 ? (
            <div className="space-y-2">
              {(employees.length > 0 ? employees : members)
                .slice(0, 6)
                .map((emp) => {
                  const empId = emp.id || emp._id || "";
                  return (
                    <Link
                      key={empId}
                      href={`/employee/${empId}/taskpanel?orgId=${orgId}`}
                      className="flex items-center justify-between gap-2.5 p-2 rounded-xl border border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40 transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-[11px]">
                          {getInitials(emp.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {emp.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {emp.email}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize shrink-0"
                      >
                        {emp.role || "employee"}
                      </Badge>
                    </Link>
                  );
                })}
            </div>
          ) : (
            <div className="py-5 text-center text-xs text-muted-foreground">
              No employees added yet.
            </div>
          )}
        </div>

        {/* Card G: Priority Breakdown Bar Graph */}
        <OrgPriorityChart
          taskStats={taskStats}
          isLoading={combinedLoading}
        />

        {/* Card H: Managers Masonry Card */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    Managers
                  </h2>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {managers.length}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Assigned stream & project managers
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ) : managers.length > 0 ? (
            <div className="space-y-2">
              {managers.map((mgr) => (
                <Link
                  key={mgr.id}
                  href={`/employee/${mgr.id}/empanel?orgId=${orgId}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-[11px]">
                      {getInitials(mgr.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {mgr.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {mgr.streams.length > 0
                          ? mgr.streams.map((s) => s.name).join(", ")
                          : mgr.email || "Manager role"}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] border-purple-500/30 text-purple-600 dark:text-purple-400 shrink-0"
                  >
                    {mgr.streams.length}{" "}
                    {mgr.streams.length === 1 ? "stream" : "streams"}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-5 text-center text-xs text-muted-foreground">
              No managers assigned yet.
            </div>
          )}
        </div>

        {/* Card I: Leads Masonry Card */}
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <UserCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    Leads
                  </h2>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {leads.length}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Department & project leads
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2 animate-pulse">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ) : leads.length > 0 ? (
            <div className="space-y-2">
              {leads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/employee/${lead.id}/empanel?orgId=${orgId}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold text-[11px]">
                      {getInitials(lead.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {lead.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {lead.streams.length > 0
                          ? lead.streams.map((s) => s.name).join(", ")
                          : lead.email || "Lead role"}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] border-sky-500/30 text-sky-600 dark:text-sky-400 shrink-0"
                  >
                    {lead.streams.length}{" "}
                    {lead.streams.length === 1 ? "stream" : "streams"}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-5 text-center text-xs text-muted-foreground flex flex-col items-center gap-1">
              <UserIcon className="h-4 w-4 text-muted-foreground/60" />
              <span>No leads assigned yet.</span>
            </div>
          )}
        </div>

        {/* Card J: Team Structure Chart */}
        <OrgTeamStructureChart teamStats={teamStats} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default OrganizationHomeView;
