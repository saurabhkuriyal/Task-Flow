"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  TrendingUp,
  Users,
  FileBadge2,
  RefreshCw,
  FolderKanban,
  ArrowUpRight,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrganizationDocumentData } from "@/types/organization";

export interface OrganizationInfoBannerProps {
  orgId: string;
  organizationName: string;
  organization?: OrganizationDocumentData | null;
  actualMembersCount: number;
  departmentsCount: number;
  projectsCount: number;
  isLoading?: boolean;
  onRefresh?: () => void;
}

function getOrgInitials(name?: string): string {
  if (!name) return "OR";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function OrganizationInfoBanner({
  orgId,
  organizationName,
  organization,
  actualMembersCount,
  departmentsCount,
  projectsCount,
  isLoading = false,
  onRefresh,
}: OrganizationInfoBannerProps) {
  const gstNo = organization?.gstNo;
  const establishedYear = organization?.establishedYear;
  const declaredTeamSize = organization?.teamSize;
  const mrr = organization?.mrr ?? 0;
  const arr = organization?.arr ?? 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-card to-indigo-500/5 p-5 sm:p-6 shadow-xs">
      {/* Decorative subtle glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Organization Identity & Metadata */}
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground font-bold text-lg sm:text-xl shadow-md">
            {getOrgInitials(organizationName)}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {organizationName}
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-semibold border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1"
              >
                <Sparkles className="h-2.5 w-2.5" />
                Active Workspace
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {gstNo && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-foreground/90 bg-background/70 px-2 py-0.5 rounded-md border border-border/60">
                  <FileBadge2 className="h-3 w-3 text-primary" />
                  GST: {gstNo}
                </span>
              )}

              {establishedYear ? (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary/80" />
                  Est. {establishedYear}
                </span>
              ) : null}

              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-primary/80" />
                {isLoading ? (
                  <Skeleton className="h-3.5 w-16 inline-block" />
                ) : (
                  <span>
                    {actualMembersCount} active{" "}
                    {actualMembersCount === 1 ? "member" : "members"}
                    {declaredTeamSize ? ` (${declaredTeamSize} org size)` : ""}
                  </span>
                )}
              </span>

              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary/80" />
                <span>
                  {departmentsCount}{" "}
                  {departmentsCount === 1 ? "dept" : "depts"} ·{" "}
                  {projectsCount}{" "}
                  {projectsCount === 1 ? "project" : "projects"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Financial Metrics (MRR / ARR) + Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
          {(mrr > 0 || arr > 0) && (
            <div className="flex items-center gap-2.5">
              {mrr > 0 && (
                <div className="rounded-xl border border-emerald-500/20 bg-background/80 px-3 py-2 backdrop-blur-xs">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    MRR
                  </div>
                  <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ${mrr.toLocaleString()}/mo
                  </div>
                </div>
              )}

              {arr > 0 && (
                <div className="rounded-xl border border-blue-500/20 bg-background/80 px-3 py-2 backdrop-blur-xs">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <DollarSign className="h-3 w-3 text-blue-500" />
                    ARR
                  </div>
                  <div className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                    ${arr.toLocaleString()}/yr
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {onRefresh && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="h-8.5 px-2.5 text-xs cursor-pointer bg-background/80"
                title="Refresh organization metrics"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 sm:mr-1.5 ${
                    isLoading ? "animate-spin text-primary" : ""
                  }`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            )}

            <Link href={`/organizations/${orgId}/streams`}>
              <Button
                type="button"
                size="sm"
                className="h-8.5 px-3 text-xs cursor-pointer gap-1.5 shadow-xs"
              >
                <FolderKanban className="h-3.5 w-3.5" />
                <span>Streams</span>
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>

            <Link href={`/organizations/${orgId}/members`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8.5 px-3 text-xs cursor-pointer gap-1.5 bg-background/80"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Team</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizationInfoBanner;
