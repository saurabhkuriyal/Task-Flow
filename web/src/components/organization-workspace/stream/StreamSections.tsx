"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Building2,
  FolderKanban,
  User,
  Plus,
  Calendar,
  ListTodo,
  Mail,
  ArrowRight,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StreamItem } from "@/services/stream.service";
import type { User as UserType } from "@/types/auth";
import type { StreamDirectoryTab } from "./StreamToolbar";

export interface StreamSectionsProps {
  isLoading?: boolean;
  departments?: StreamItem[];
  projects?: StreamItem[];
  members?: UserType[];
  searchTerm?: string;
  activeTab?: StreamDirectoryTab;
  orgId?: string;
  onAddDepartment?: () => void;
  onAddProject?: () => void;
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

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getRoleBadgeStyle(role?: string): string {
  switch ((role || "employee").toLowerCase()) {
    case "owner":
    case "admin":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "manager":
      return "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400";
    case "lead":
      return "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400";
    default:
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }
}

export function StreamSections({
  isLoading = true,
  departments = [],
  projects = [],
  members = [],
  searchTerm = "",
  activeTab = "all",
  orgId,
  onAddDepartment,
  onAddProject,
}: StreamSectionsProps) {
  const params = useParams();
  const currentOrgId = orgId || (params?.orgId as string) || "";

  const showDepartments = activeTab === "all" || activeTab === "departments";
  const showProjects = activeTab === "all" || activeTab === "projects";
  const showMembers = activeTab === "all" || activeTab === "members";

  return (
    <div className="space-y-6">
      {/* 1. Departments Section */}
      {showDepartments && (
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    Departments
                  </h2>
                  {!isLoading && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4.5 px-1.5 font-mono"
                    >
                      {departments.length}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Core organizational divisions and cross-functional teams
                </p>
              </div>
            </div>

            {onAddDepartment && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddDepartment}
                className="text-xs h-7.5 px-2.5 cursor-pointer gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Dept</span>
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border/60 bg-muted/20 animate-pulse space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : departments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const leadName = dept.lead?.[0]?.name;
                const managerName = dept.manager?.[0]?.name;
                const memberCount = dept.members?.length || 0;
                const dateCreated = formatDate(dept.createdAt);
                const streamId = dept._id || dept.id || dept.name;
                const streamHref = currentOrgId
                  ? `/organizations/${currentOrgId}/streams/${streamId}`
                  : `/organizations/streams/${streamId}`;

                return (
                  <Link
                    key={streamId}
                    href={streamHref}
                    className="group relative overflow-hidden flex flex-col justify-between rounded-xl border border-border/70 bg-background/60 hover:bg-card hover:border-blue-500/40 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    {/* Subtle top accent bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-75 group-hover:opacity-100 transition-opacity" />

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {dept.name}
                              </h3>
                              {dateCreated && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {dateCreated}
                                </span>
                              )}
                            </div>
                          </div>

                          <Badge
                            variant="outline"
                            className="text-[10px] shrink-0 gap-1 font-mono"
                          >
                            <Users className="h-2.5 w-2.5 text-muted-foreground" />
                            {memberCount}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]">
                          {dept.description || (
                            <span className="italic text-muted-foreground/60">
                              No description provided.
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-border/50 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-2 min-w-0 truncate">
                          {leadName ? (
                            <span className="inline-flex items-center gap-1 truncate">
                              <User className="h-3 w-3 text-blue-500 shrink-0" />
                              <span className="truncate font-medium text-foreground/80">
                                {leadName}
                              </span>
                            </span>
                          ) : managerName ? (
                            <span className="inline-flex items-center gap-1 truncate">
                              <ShieldCheck className="h-3 w-3 text-purple-500 shrink-0" />
                              <span className="truncate font-medium text-foreground/80">
                                {managerName}
                              </span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">
                              No lead assigned
                            </span>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium shrink-0 group-hover:translate-x-0.5 transition-transform">
                          Open <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center space-y-2.5">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                <Building2 className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground">
                {searchTerm
                  ? `No departments match "${searchTerm}".`
                  : "No departments created yet."}
              </p>
              {!searchTerm && onAddDepartment && (
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
        </section>
      )}

      {/* 2. Projects Section */}
      {showProjects && (
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FolderKanban className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    Projects
                  </h2>
                  {!isLoading && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4.5 px-1.5 font-mono"
                    >
                      {projects.length}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active delivery initiatives, sprints, and milestones
                </p>
              </div>
            </div>

            {onAddProject && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddProject}
                className="text-xs h-7.5 px-2.5 cursor-pointer gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Project</span>
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border/60 bg-muted/20 animate-pulse space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => {
                const dateCreated = formatDate(proj.createdAt);
                const leadName = proj.lead?.[0]?.name;
                const managerName = proj.manager?.[0]?.name;
                const memberCount = proj.members?.length || 0;
                const streamId = proj._id || proj.id || proj.name;
                const streamHref = currentOrgId
                  ? `/organizations/${currentOrgId}/streams/${streamId}`
                  : `/organizations/streams/${streamId}`;

                return (
                  <Link
                    key={streamId}
                    href={streamHref}
                    className="group relative overflow-hidden flex flex-col justify-between rounded-xl border border-border/70 bg-background/60 hover:bg-card hover:border-amber-500/40 hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    {/* Subtle top accent bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-75 group-hover:opacity-100 transition-opacity" />

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <FolderKanban className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                {proj.name}
                              </h3>
                              {dateCreated && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {dateCreated}
                                </span>
                              )}
                            </div>
                          </div>

                          <Badge
                            variant="outline"
                            className="text-[10px] shrink-0 gap-1 font-mono"
                          >
                            <Users className="h-2.5 w-2.5 text-muted-foreground" />
                            {memberCount}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]">
                          {proj.description || (
                            <span className="italic text-muted-foreground/60">
                              No description provided.
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-border/50 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-2 min-w-0 truncate">
                          {managerName ? (
                            <span className="inline-flex items-center gap-1 truncate">
                              <ShieldCheck className="h-3 w-3 text-purple-500 shrink-0" />
                              <span className="truncate font-medium text-foreground/80">
                                {managerName}
                              </span>
                            </span>
                          ) : leadName ? (
                            <span className="inline-flex items-center gap-1 truncate">
                              <User className="h-3 w-3 text-amber-500 shrink-0" />
                              <span className="truncate font-medium text-foreground/80">
                                {leadName}
                              </span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">
                              No owner assigned
                            </span>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium shrink-0 group-hover:translate-x-0.5 transition-transform">
                          Open <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center space-y-2.5">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <FolderKanban className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground">
                {searchTerm
                  ? `No projects match "${searchTerm}".`
                  : "No projects created yet."}
              </p>
              {!searchTerm && onAddProject && (
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
        </section>
      )}

      {/* 3. Employee Tasks Directory Section */}
      {showMembers && (
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <ListTodo className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    Employee Task Panels
                  </h2>
                  {!isLoading && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-4.5 px-1.5 font-mono"
                    >
                      {members.length}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click any member to inspect tasks, time logs, or assign direct
                  work
                </p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              ))}
            </div>
          ) : members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => {
                const userId = member.id || member._id || "";
                const memberName = member.name || "Member";
                const userRole = member.role || "employee";
                const taskPanelHref = `/employee/${userId}/taskpanel${
                  currentOrgId ? `?orgId=${currentOrgId}` : ""
                }`;

                return (
                  <Link
                    key={userId || member.email}
                    href={taskPanelHref}
                    className="group flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-background/60 hover:bg-card hover:border-indigo-500/40 hover:shadow-md transition-all duration-200 cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/20 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          {getInitials(memberName)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {memberName}
                          </h3>
                          {member.email && (
                            <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize shrink-0 font-medium ${getRoleBadgeStyle(
                          userRole
                        )}`}
                      >
                        {userRole}
                      </Badge>
                    </div>

                    <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        View assigned & direct tasks
                      </span>
                      <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
                        Task Panel
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-muted-foreground">
              {searchTerm
                ? `No members match "${searchTerm}".`
                : "No members found in this organization."}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default StreamSections;
