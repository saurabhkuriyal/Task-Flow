"use client";

import * as React from "react";
import { X, Building2, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddDepartment } from "@/hooks/stream/useAddDepartment";

export interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  organisationId?: string;
  organisationName?: string;
}

export function AddDepartmentModal({
  isOpen,
  onClose,
  onSuccess,
  organisationId,
  organisationName,
}: AddDepartmentModalProps) {
  const { form, isLoading, serverError, isSuccess, onSubmit, reset } =
    useAddDepartment({ organisationId, organisationName });

  const {
    register,
    formState: { errors },
  } = form;

  // Auto-close on success
  React.useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
      const timer = setTimeout(() => {
        onClose();
        reset();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess, onClose, reset]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Add Department</h2>
              <p className="text-xs text-muted-foreground">
                Create a new department stream in your organization
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Success Alert */}
        {isSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Department created successfully! Closing...</span>
          </div>
        )}

        {/* Form with name and description only */}
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="dept-name">Name *</Label>
            <Input
              id="dept-name"
              placeholder="e.g. Engineering, Sales, Marketing"
              {...register("name", { required: "Department name is required" })}
              disabled={isLoading || isSuccess}
              className="h-9 text-xs"
              autoFocus
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="dept-description">Description</Label>
            <Input
              id="dept-description"
              placeholder="e.g. Core product architecture and platform engineering"
              {...register("description")}
              disabled={isLoading || isSuccess}
              className="h-9 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || isSuccess}
              className="text-xs cursor-pointer gap-1.5"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isLoading ? "Adding..." : "Add Department"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDepartmentModal;
