"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  UserCheck,
  Search,
  Calendar,
  User,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usegetSepecificEmployeeStreams } from "@/hooks/subStream";

export interface SpecificEmployeeStreamsViewProps {
  streamId?: string;
  organisationId?: string;
  isEmpTracker?: boolean;
  className?: string;
}

export function SpecificEmployeeStreamsView({
  streamId,
  organisationId,
  isEmpTracker = false,
  className = "",
}: SpecificEmployeeStreamsViewProps) {
  const params = useParams();
  const currentOrgId =
    organisationId || (params?.orgId as string) || "";

  const {
    employeeStreams,
    filteredStreams,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    refetch,
  } = usegetSepecificEmployeeStreams({
    streamId,
    organisationId: currentOrgId,
    enabled: !isEmpTracker && Boolean(streamId),
  });

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

  // If the parent stream itself is an Employee Tracker, do not render nested employee trackers
  if (isEmpTracker) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border border-border/70 bg-card p-5 sm:p-6 space-y-5 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Employee Trackers
              </h3>
              {!isLoading && (
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4.5 px-2 font-normal"
                >
                  {employeeStreams.length}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Individual tracking streams linked to members of this stream
            </p>
          </div>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search trackers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            title="Refresh trackers"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : filteredStreams.length > 0 ? (
        /* Trackers Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStreams.map((tracker) => {
            const trackerId = tracker._id || tracker.id || "";
            const leadName = tracker.lead?.[0]?.name;
            const creatorName = tracker.creator?.[0]?.name;
            const displayName = leadName || tracker.name || "Employee Tracker";
            const dateCreated = formatDate(tracker.createdAt);

            const streamHref = currentOrgId
              ? `/organizations/${currentOrgId}/streams/${trackerId}`
              : `/organizations/streams/${trackerId}`;

            return (
              <Link
                key={trackerId}
                href={streamHref}
                className="group relative flex flex-col justify-between p-4 rounded-xl border border-border/70 bg-card hover:border-emerald-500/50 hover:shadow-md transition-all text-left cursor-pointer"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        {getInitials(displayName)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {displayName}
                        </h4>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {tracker.name !== displayName
                            ? tracker.name
                            : "Tracked Employee"}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase shrink-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                    >
                      Active
                    </Badge>
                  </div>

                  {tracker.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tracker.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    {creatorName ? (
                      <span className="flex items-center gap-1 truncate text-muted-foreground/80">
                        <User className="h-3 w-3 shrink-0" />
                        <span className="truncate">By: {creatorName}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">
                        Tracked Member
                      </span>
                    )}
                    {creatorName && dateCreated && <span>•</span>}
                    {dateCreated && (
                      <span className="flex items-center gap-1 text-muted-foreground/70 shrink-0">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{dateCreated}</span>
                      </span>
                    )}
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                    <span>View</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-8 text-center text-xs text-muted-foreground">
          {searchTerm ? (
            <p>No employee trackers match &quot;{searchTerm}&quot;.</p>
          ) : (
            <div className="space-y-1.5 max-w-sm mx-auto">
              <p className="font-medium text-foreground">
                No employee trackers yet
              </p>
              <p className="text-[11px] text-muted-foreground">
                Tracked employees are automatically created when members are
                added to this stream.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const StreamEmployeeTrackersView = SpecificEmployeeStreamsView;
export default SpecificEmployeeStreamsView;
