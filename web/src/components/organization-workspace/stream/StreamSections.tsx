"use client";

import * as React from "react";
import { Building2, FolderKanban, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface StreamSectionsProps {
  isLoading?: boolean;
}

export function StreamSections({ isLoading = true }: StreamSectionsProps) {
  return (
    <div className="space-y-6">
      {/* 1. Departments Section */}
      <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Departments</h2>
            <p className="text-xs text-muted-foreground">Organizational divisions and team structures</p>
          </div>
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
        ) : (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No departments available yet.
          </p>
        )}
      </div>

      {/* 2. Projects Section */}
      <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FolderKanban className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Projects</h2>
            <p className="text-xs text-muted-foreground">Active projects, milestones, and deliverables</p>
          </div>
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
        ) : (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No projects available yet.
          </p>
        )}
      </div>

      {/* 3. Employee Tracker Section */}
      <div className="rounded-xl border border-border/70 bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Employee Tracker</h2>
            <p className="text-xs text-muted-foreground">Activity logs, productivity metrics, and work allocation</p>
          </div>
        </div>

        {/* Shadow Loading for Employee Tracker */}
        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20 animate-pulse"
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
        ) : (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No tracked employee data available yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default StreamSections;
