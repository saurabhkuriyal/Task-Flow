"use client";

import * as React from "react";
import { X, UserPlus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddMember } from "@/hooks/member/useAddMember";

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  organisationId?: string;
  organisationName?: string;
}

export function AddMemberModal({
  isOpen,
  onClose,
  onSuccess,
  organisationId,
  organisationName,
}: AddMemberModalProps) {
  const { form, isLoading, serverError, isSuccess, onSubmit, reset, currentOrgName } =
    useAddMember({ organisationId, organisationName });

  const {
    register,
    formState: { errors },
  } = form;

  // Auto-close on successful signup
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
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Add Member</h2>
              <p className="text-xs text-muted-foreground">
                Register a new member to {currentOrgName || "this organization"}
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
            <span>Member successfully registered! Closing...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="member-name">Name *</Label>
            <Input
              id="member-name"
              placeholder="e.g. John Doe"
              {...register("name", { required: "Name is required" })}
              disabled={isLoading || isSuccess}
              className="h-9 text-xs"
              autoFocus
            />
            {errors.name && (
              <p className="text-[11px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="member-email">Email *</Label>
            <Input
              id="member-email"
              type="email"
              placeholder="e.g. john@company.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              disabled={isLoading || isSuccess}
              className="h-9 text-xs"
            />
            {errors.email && (
              <p className="text-[11px] text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone No */}
          <div className="space-y-1.5">
            <Label htmlFor="member-phone">Phone No. *</Label>
            <Input
              id="member-phone"
              type="tel"
              placeholder="e.g. +1 555-0199"
              {...register("phoneNumber", {
                required: "Phone number is required",
              })}
              disabled={isLoading || isSuccess}
              className="h-9 text-xs"
            />
            {errors.phoneNumber && (
              <p className="text-[11px] text-destructive">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Create Passcode */}
          <div className="space-y-1.5">
            <Label htmlFor="member-passcode">Create Passcode *</Label>
            <Input
              id="member-passcode"
              type="password"
              placeholder="Minimum 8 characters"
              {...register("createPasscode", {
                required: "Passcode is required",
                minLength: {
                  value: 8,
                  message: "Passcode must be at least 8 characters",
                },
              })}
              disabled={isLoading || isSuccess}
              className="h-9 text-xs"
            />
            {errors.createPasscode && (
              <p className="text-[11px] text-destructive">
                {errors.createPasscode.message}
              </p>
            )}
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
              <span>{isLoading ? "Adding..." : "Add Member"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMemberModal;
