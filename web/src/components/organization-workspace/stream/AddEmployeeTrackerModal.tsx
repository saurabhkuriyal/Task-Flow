"use client";

import * as React from "react";
import {
  X,
  UserCheck,
  Search,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddEmployeeTracker } from "@/hooks/stream/useAddEmployeeTracker";
import type { User } from "@/types/auth";

export interface AddEmployeeTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  organisationId?: string;
  organisationName?: string;
}

export function AddEmployeeTrackerModal({
  isOpen,
  onClose,
  onSuccess,
  organisationId,
  organisationName,
}: AddEmployeeTrackerModalProps) {
  const {
    filteredMembers,
    searchMember,
    setSearchMember,
    isLoadingMembers,
    isSubmitting,
    serverError,
    isSuccess,
    selectMember,
    reset,
  } = useAddEmployeeTracker({
    organisationId,
    organisationName,
    onSuccess,
  });

  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(
    null
  );

  // Auto-close on success
  React.useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onClose();
        reset();
        setSelectedMemberId(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onClose, reset]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  const handleMemberClick = (member: User) => {
    const id = member.id || member._id || "";
    setSelectedMemberId(id);
    selectMember(member);
  };

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
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Add Employee Tracker
              </h2>
              <p className="text-xs text-muted-foreground">
                Select a member to create an employee tracking stream
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

        {/* Server Error Alert */}
        {serverError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Success Alert */}
        {isSuccess && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Employee tracker stream created! Closing...</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search members by name or email..."
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            disabled={isSubmitting || isSuccess}
            className="pl-9 h-9 text-xs"
            autoFocus
          />
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[340px]">
          {isLoadingMembers ? (
            // Skeleton while fetching members
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
              {searchMember
                ? `No members match "${searchMember}".`
                : "No members available in this organization."}
            </div>
          ) : (
            filteredMembers.map((member) => {
              const id = member.id || member._id || member.email;
              const isSelected = selectedMemberId === id && isSubmitting;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleMemberClick(member)}
                  disabled={isSubmitting || isSuccess}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border/70 hover:border-primary/50 hover:bg-muted/40 transition-all text-left cursor-pointer group disabled:pointer-events-none disabled:opacity-60"
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
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-wider"
                    >
                      {member.role || "employee"}
                    </Badge>
                    {isSelected && (
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

export default AddEmployeeTrackerModal;
