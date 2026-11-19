"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Building2,
  FolderKanban,
  UserCheck,
  User,
  Plus,
  Calendar,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StreamItem } from "@/services/stream.service";

export interface StreamSectionsProps {
  isLoading?: boolean;
  departments?: StreamItem[];
  projects?: StreamItem[];
  empTrackers?: StreamItem[];
  searchTerm?: string;
  orgId?: string;
  onAddDepartment?: () => void;
  onAddProject?: () => void;
  onAddEmployeeTracker?: () => void;
}

export function StreamSections({
  isLoading = true,
  departments = [],
  projects = [],
  empTrackers = [],
  searchTerm = "",
  orgId,
  onAddDepartment,
  onAddProject,
  onAddEmployeeTracker,
}: StreamSectionsProps) {
  const params = useParams();
  const currentOrgId = orgId || (params?.orgId as string) || "";
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

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* 1. Departments Section */}
      <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  Departments
                </h2>
                {!isLoading && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                    {departments.length}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Organizational divisions and team structures
              </p>
            </div>
          </div>
          {onAddDepartment && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onAddDepartment}
              className="text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          )}
        </div>

        {/* Shadow Loading for Departments */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/20 animate-pulse"
              >
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : departments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {departments.map((dept) => {
              const leadName = dept.lead?.[0]?.name;
              const dateCreated = formatDate(dept.createdAt);
              const streamId = dept._id || dept.id || dept.name;
              const streamHref = currentOrgId
                ? `/organizations/${currentOrgId}/streams/${streamId}`
                : `/organizations/streams/${streamId}`;

              return (
                <Link
                  key={streamId}
                  href={streamHref}
                  className="group relative flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all text-left cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {dept.name}
                        </h3>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase shrink-0">
                        Dept
                      </Badge>
                    </div>

                    {dept.description ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {dept.description}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground/60 italic">
                        No description provided.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 truncate">
                      {leadName ? (
                        <>
                          <User className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                          <span className="truncate">Lead: {leadName}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground/60">No lead assigned</span>
                      )}
                    </div>
                    {dateCreated && (
                      <div className="flex items-center gap-1 shrink-0 text-muted-foreground/70">
                        <Calendar className="h-3 w-3" />
                        <span>{dateCreated}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground">
            {searchTerm ? (
              <p>No departments match &quot;{searchTerm}&quot;.</p>
            ) : (
              <div className="space-y-2">
                <p>No departments available yet.</p>
                {onAddDepartment && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAddDepartment}
                    className="text-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create First Department
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Projects Section */}
      <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Projects</h2>
                {!isLoading && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                    {projects.length}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Active projects, milestones, and deliverables
              </p>
            </div>
          </div>
          {onAddProject && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onAddProject}
              className="text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          )}
        </div>

        {/* Shadow Loading for Projects */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2.5 p-3.5 rounded-lg border border-border/60 bg-muted/20 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2 w-full rounded-full mt-1" />
              </div>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((proj) => {
              const dateCreated = formatDate(proj.createdAt);
              const creatorName = proj.creator?.[0]?.name;
              const streamId = proj._id || proj.id || proj.name;
              const streamHref = currentOrgId
                ? `/organizations/${currentOrgId}/streams/${streamId}`
                : `/organizations/streams/${streamId}`;

              return (
                <Link
                  key={streamId}
                  href={streamHref}
                  className="group relative flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all text-left cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                          <FolderKanban className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {proj.name}
                        </h3>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase shrink-0">
                        Project
                      </Badge>
                    </div>

                    {proj.description ? (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {proj.description}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground/60 italic">
                        No description provided.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 truncate">
                      {creatorName ? (
                        <>
                          <User className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                          <span className="truncate">By: {creatorName}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground/60">Active project</span>
                      )}
                    </div>
                    {dateCreated && (
                      <div className="flex items-center gap-1 shrink-0 text-muted-foreground/70">
                        <Calendar className="h-3 w-3" />
                        <span>{dateCreated}</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground">
            {searchTerm ? (
              <p>No projects match &quot;{searchTerm}&quot;.</p>
            ) : (
              <div className="space-y-2">
                <p>No projects available yet.</p>
                {onAddProject && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAddProject}
                    className="text-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create First Project
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Employee Tracker Section */}
      <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  Employee Tracker
                </h2>
                {!isLoading && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-normal">
                    {empTrackers.length}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Activity logs, productivity metrics, and work allocation
              </p>
            </div>
          </div>
          {onAddEmployeeTracker && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onAddEmployeeTracker}
              className="text-xs h-7 px-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          )}
        </div>

        {/* Shadow Loading for Employee Tracker */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-lg border border-border/60 bg-muted/20 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : empTrackers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {empTrackers.map((emp) => {
              const employeeName = emp.lead?.[0]?.name || emp.name;
              const dateCreated = formatDate(emp.createdAt);

              const streamId = emp._id || emp.id || emp.name;
              const streamHref = currentOrgId
                ? `/organizations/${currentOrgId}/streams/${streamId}`
                : `/organizations/streams/${streamId}`;

              return (
                <Link
                  key={streamId}
                  href={streamHref}
                  className="group relative flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-md transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {getInitials(employeeName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {employeeName}
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                        <span>Tracked {dateCreated ? `since ${dateCreated}` : ""}</span>
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px] uppercase shrink-0 ml-2">
                    Active
                  </Badge>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground">
            {searchTerm ? (
              <p>No tracked employees match &quot;{searchTerm}&quot;.</p>
            ) : (
              <div className="space-y-2">
                <p>No tracked employee data available yet.</p>
                {onAddEmployeeTracker && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAddEmployeeTracker}
                    className="text-xs cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Track First Employee
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StreamSections;
