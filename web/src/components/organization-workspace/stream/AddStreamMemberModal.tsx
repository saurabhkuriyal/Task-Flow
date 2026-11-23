"use client";

import * as React from "react";
import {
  X,
  UserPlus,
  UserCheck,
  UserCog,
  Search,
  CheckCircle2,
  Mail,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddStreamMember } from "@/hooks/stream/useAddStreamMember";

export interface AddStreamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  organisationId?: string;
  streamId?: string;
  role?: "member" | "lead" | "manager";
  title?: string;
  subtitle?: string;
  existingIds?: string[];
}

export function AddStreamMemberModal({
  isOpen,
  onClose,
  onSuccess,
  organisationId,
  streamId,
  role = "member",
  title,
  subtitle,
  existingIds = [],
}: AddStreamMemberModalProps) {
  const {
    filteredMembers,
    isLoadingMembers,
    searchTerm,
    setSearchTerm,
    isSubmitting,
    isSuccess,
    successMessage,
    error,
    handleSelectMember,
  } = useAddStreamMember({
    isOpen,
    onClose,
    onSuccess,
    organisationId,
    streamId,
    role,
  });

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getHeaderIcon = () => {
    switch (role) {
      case "lead":
        return <UserCheck className="h-4 w-4" />;
      case "manager":
        return <UserCog className="h-4 w-4" />;
      case "member":
      default:
        return <UserPlus className="h-4 w-4" />;
    }
  };

  const getDefaultTitle = () => {
    switch (role) {
      case "lead":
        return "Add Stream Lead";
      case "manager":
        return "Add Stream Manager";
      case "member":
      default:
        return "Add Member to Stream";
    }
  };

  const getDefaultSubtitle = () => {
    switch (role) {
      case "lead":
        return "Select an organization member to assign as lead";
      case "manager":
        return "Select an organization member to assign as manager";
      case "member":
      default:
        return "Select a member to assign to this stream";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4 max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {getHeaderIcon()}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {title || getDefaultTitle()}
              </h2>
              <p className="text-xs text-muted-foreground">
                {subtitle || getDefaultSubtitle()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success Alert */}
        {isSuccess && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isSuccess || isSubmitting}
            className="pl-9 h-9 text-xs"
            autoFocus
          />
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[320px]">
          {isLoadingMembers ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-2.5 w-36" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))
          ) : filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              {searchTerm
                ? `No members match "${searchTerm}".`
                : "No members available in this organization."}
            </div>
          ) : (
            filteredMembers.map((member) => {
              const id = member.id || member._id || member.email;
              const isAlreadyAdded = Boolean(id && existingIds.includes(String(id)));

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectMember(member)}
                  disabled={isSuccess || isSubmitting || isAlreadyAdded}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${
                    isAlreadyAdded
                      ? "border-border/40 bg-muted/20 opacity-60 cursor-not-allowed"
                      : "border-border/70 hover:border-primary/50 hover:bg-muted/40 cursor-pointer disabled:pointer-events-none disabled:opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {getInitials(member.name, member.email)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground/70" />
                        <span>{member.email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isAlreadyAdded ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-muted/80 text-muted-foreground border border-border/60"
                      >
                        {role === "lead"
                          ? "Current Lead"
                          : role === "manager"
                          ? "Current Manager"
                          : "Already Added"}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase tracking-wider"
                      >
                        {member.role || "member"}
                      </Badge>
                    )}
                    {isSubmitting && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AddStreamMemberModal;
