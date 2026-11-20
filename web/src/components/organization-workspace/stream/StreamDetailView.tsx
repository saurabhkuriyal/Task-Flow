"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Building2,
  FolderKanban,
  UserCheck,
  UserCog,
  UserPlus,
  User,
  AlertCircle,
  Calendar,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStreamDetail } from "@/hooks/stream/useStreamDetail";
import { AddDepartmentModal } from "./AddDepartmentModal";
import { AddProjectModal } from "./AddProjectModal";
import { AddEmployeeTrackerModal } from "./AddEmployeeTrackerModal";
import { AddStreamMemberModal } from "./AddStreamMemberModal";

export function StreamDetailView() {
  const {
    stream,
    tasks,
    isLoading,
    error,
    currentOrgId,
    currentOrgName,
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
    isAddSubDepartmentOpen,
    openAddSubDepartment,
    closeAddSubDepartment,
    isAddProjectOpen,
    openAddProject,
    closeAddProject,
    isAddEmployeeTrackerOpen,
    openAddEmployeeTracker,
    closeAddEmployeeTracker,
  } = useStreamDetail();

  const getStreamIcon = (type?: string) => {
    switch (type) {
      case "project":
        return <FolderKanban className="h-5 w-5" />;
      case "empTracker":
        return <UserCheck className="h-5 w-5" />;
      case "department":
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  const getStreamTypeLabel = (type?: string) => {
    switch (type) {
      case "project":
        return "Project";
      case "empTracker":
        return "Employee Tracker";
      case "department":
      default:
        return "Department";
    }
  };

  const isEmpTracker = stream?.type === "empTracker";

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

  const leadNames = stream?.lead
    ?.map((l) => l.name)
    .filter(Boolean)
    .join(", ");
  const managerNames = stream?.manager
    ?.map((m) => m.name)
    .filter(Boolean)
    .join(", ");
  const creatorName = stream?.creator?.[0]?.name;
  const createdDate = formatDate(stream?.createdAt);

  return (
    <div className="py-6 px-4 sm:px-8 max-w-6xl mx-auto space-y-6">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          href={`/organizations/${currentOrgId}/streams`}
          className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
        >
          <FolderKanban className="h-3.5 w-3.5" />
          <span>Streams</span>
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        {isLoading ? (
          <Skeleton className="h-3.5 w-24" />
        ) : (
          <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-md">
            {stream?.name || "Stream Detail"}
          </span>
        )}
      </nav>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Stream Header and Description */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-4 shadow-sm">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-full max-w-lg mt-2" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {getStreamIcon(stream?.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                      {stream?.name}
                    </h1>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      {getStreamTypeLabel(stream?.type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                    {leadNames && (
                      <span className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-muted-foreground/70" />
                        <span>Lead: {leadNames}</span>
                      </span>
                    )}
                    {managerNames && (
                      <span className="flex items-center gap-1">
                        <UserCog className="h-3 w-3 text-muted-foreground/70" />
                        <span>Manager: {managerNames}</span>
                      </span>
                    )}
                    {creatorName && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground/70" />
                        <span>Creator: {creatorName}</span>
                      </span>
                    )}
                    {createdDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground/70" />
                        <span>Created: {createdDate}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-2 text-xs sm:text-sm text-muted-foreground">
              {stream?.description ? (
                <p className="leading-relaxed">{stream.description}</p>
              ) : (
                <p className="italic text-muted-foreground/60">
                  No description provided for this stream.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 3. Action Buttons */}
        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-2">
          {isLoading ? (
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-8 w-28 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-28 rounded-lg" />
              <Skeleton className="h-8 w-36 rounded-lg" />
              <Skeleton className="h-8 w-28 rounded-lg" />
              <Skeleton className="h-8 w-40 rounded-lg" />
            </div>
          ) : (
            <>
              {!isEmpTracker && (
                <>
                  {/* Option to Add Members */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openAddMember}
                    className="text-xs h-8 cursor-pointer gap-1.5"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-primary" />
                    <span>Add Member</span>
                  </Button>

                  {/* Button to Add Lead */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openAddLead}
                    className="text-xs h-8 cursor-pointer gap-1.5"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                    <span>Add Lead</span>
                  </Button>

                  {/* Button to Add Manager */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openAddManager}
                    className="text-xs h-8 cursor-pointer gap-1.5"
                  >
                    <UserCog className="h-3.5 w-3.5 text-primary" />
                    <span>Add Manager</span>
                  </Button>

                  {/* Add Sub-department */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openAddSubDepartment}
                    className="text-xs h-8 cursor-pointer gap-1.5"
                  >
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span>Add Sub-department</span>
                  </Button>
                </>
              )}

              {/* Add Project */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openAddProject}
                className="text-xs h-8 cursor-pointer gap-1.5"
              >
                <FolderKanban className="h-3.5 w-3.5 text-primary" />
                <span>Add Project</span>
              </Button>

              {/* Add Employee Tracker */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openAddEmployeeTracker}
                className="text-xs h-8 cursor-pointer gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                <span>Add Employee Tracker</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 4. Table to Show Tasks in That Stream */}
      <div className="rounded-2xl border border-border/70 bg-card shadow-sm overflow-hidden">
        {/* Table Header / Title */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ListTodo className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Tasks</h2>
                {!isLoading && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                    {tasks.length}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Tasks tracked and managed inside this stream
              </p>
            </div>
          </div>
        </div>

        {/* Shadow Loader (Skeleton Table) */}
        {isLoading ? (
          <div className="p-4 sm:p-5 space-y-3">
            {/* Table Header Skeleton */}
            <div className="grid grid-cols-5 gap-4 pb-2 border-b border-border/60">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-20" />
            </div>
            {/* Table Rows Skeleton */}
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="grid grid-cols-5 gap-4 py-3 items-center border-b border-border/40 last:border-b-0 animate-pulse"
              >
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            ))}
          </div>
        ) : tasks.length > 0 ? (
          /* Tasks Table */
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
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium truncate max-w-xs">
                      {task.title}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {task.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {task.priority || "normal"}
                      </Badge>
                    </td>
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
          /* Empty State */
          <div className="py-12 px-4 text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <ListTodo className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium text-foreground">
              No tasks in this stream yet
            </p>
            <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
              Tasks created for or assigned to this stream will appear in this table.
            </p>
          </div>
        )}
      </div>

      {/* 5. Modals */}
      {/* Add Member Modal */}
      <AddStreamMemberModal
        isOpen={isAddMemberOpen}
        onClose={closeAddMember}
        onSuccess={refetch}
        organisationId={currentOrgId}
        streamId={streamId}
        role="member"
        title="Add Member to Stream"
        subtitle="Select an organization member to add to this stream"
      />

      {/* Add Lead Modal */}
      <AddStreamMemberModal
        isOpen={isAddLeadOpen}
        onClose={closeAddLead}
        onSuccess={refetch}
        organisationId={currentOrgId}
        streamId={streamId}
        role="lead"
        title="Add Stream Lead"
        subtitle="Select an organization member to assign as lead of this stream"
      />

      {/* Add Manager Modal */}
      <AddStreamMemberModal
        isOpen={isAddManagerOpen}
        onClose={closeAddManager}
        onSuccess={refetch}
        organisationId={currentOrgId}
        streamId={streamId}
        role="manager"
        title="Add Stream Manager"
        subtitle="Select an organization member to assign as manager of this stream"
      />

      {/* Add Sub-department Modal */}
      <AddDepartmentModal
        isOpen={isAddSubDepartmentOpen}
        onClose={closeAddSubDepartment}
        onSuccess={refetch}
        organisationId={currentOrgId}
        organisationName={currentOrgName}
        parentStreamId={streamId}
        parentStreamName={stream?.name}
        title="Add Sub-department"
        subtitle="Create a sub-department within this stream"
      />

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={closeAddProject}
        onSuccess={refetch}
        organisationId={currentOrgId}
        organisationName={currentOrgName}
        parentStreamId={streamId}
        parentStreamName={stream?.name}
      />

      {/* Add Employee Tracker Modal */}
      <AddEmployeeTrackerModal
        isOpen={isAddEmployeeTrackerOpen}
        onClose={closeAddEmployeeTracker}
        onSuccess={refetch}
        organisationId={currentOrgId}
        organisationName={currentOrgName}
        parentStreamId={streamId}
        parentStreamName={stream?.name}
      />
    </div>
  );
}

export default StreamDetailView;
