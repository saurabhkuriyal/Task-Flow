"use client";

import * as React from "react";
import {
  Users,
  Search,
  Plus,
  Mail,
  UserCheck,
  UserCog,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useStreamMembers } from "@/hooks/subStream";

export interface StreamMembersViewProps {
  streamId?: string;
  organisationId?: string;
  isEmpTracker?: boolean;
  onAddMember?: () => void;
  className?: string;
}

export function StreamMembersView({
  streamId,
  organisationId,
  isEmpTracker = false,
  onAddMember,
  className = "",
}: StreamMembersViewProps) {
  const {
    filteredMembers,
    members,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
  } = useStreamMembers({
    streamId,
    organisationId,
    enabled: Boolean(streamId),
  });

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isEmpTracker) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border border-border/70 bg-card p-5 space-y-4 shadow-sm ${className}`}
    >
      {/* 1. Header with Title, Count, Search, and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Stream Members
              </h3>
              {!isLoading && (
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4.5 px-1.5 font-normal rounded-full"
                >
                  {members.length}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Collaborators and team members actively participating in this stream
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick search input */}
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs h-8 rounded-lg"
            />
          </div>

          {onAddMember && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onAddMember}
              className="text-xs h-8 gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5 text-primary" />
              <span>Add</span>
            </Button>
          )}
        </div>
      </div>

      {/* Error alert if failed */}
      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg border border-destructive/30 bg-destructive/10 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Loading State */}
      {isLoading ? (
        <div className="space-y-2.5 animate-pulse">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/10"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </div>
      ) : filteredMembers.length > 0 ? (
        /* 3. Members List */
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredMembers.map((m) => (
            <div
              key={m.memberId}
              className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/20 hover:border-primary/40 transition-all text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-xs shadow-2xs">
                  {getInitials(m.name)}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {m.name}
                  </p>
                  {m.email && (
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                      <Mail className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                      <span>{m.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                {m.role === "lead" ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase gap-1 border-blue-500/30 text-blue-600 bg-blue-500/5"
                  >
                    <UserCheck className="h-3 w-3" />
                    Lead
                  </Badge>
                ) : m.role === "manager" ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase gap-1 border-purple-500/30 text-purple-600 bg-purple-500/5"
                  >
                    <UserCog className="h-3 w-3" />
                    Manager
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-[10px] capitalize font-medium"
                  >
                    {m.role || "Member"}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 4. Empty State */
        <div className="py-10 px-4 text-center space-y-2.5">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Users className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-foreground">
              {searchTerm
                ? `No members match "${searchTerm}"`
                : "No members added yet"}
            </h4>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              {searchTerm
                ? "Try searching with a different name or email."
                : "Assign team members to collaborate on tasks in this stream."}
            </p>
          </div>
          {onAddMember && !searchTerm && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onAddMember}
              className="text-xs h-7.5 mt-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1 text-primary" />
              Add First Member
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default StreamMembersView;
