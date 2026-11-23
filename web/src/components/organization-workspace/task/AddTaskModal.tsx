"use client";

import * as React from "react";
import {
  X,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  CornerDownRight,
  User,
  ShieldAlert,
  Flame,
  CheckSquare,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAddTask } from "@/hooks/task";
import type { StreamItem } from "@/services/stream.service";
import type { TaskPriority, TaskImpact } from "@/models/tasks.model";

export interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  stream?: StreamItem | null;
  streamId?: string;
  organisationId?: string;
}

export function AddTaskModal({
  isOpen,
  onClose,
  onSuccess,
  stream,
  streamId,
  organisationId,
}: AddTaskModalProps) {
  const {
    assignerName,
    isEmpTracker,
    trackedEmployeeName,
    taskname,
    setTaskname,
    description,
    setDescription,
    priority,
    setPriority,
    impact,
    setImpact,
    recurring,
    setRecurring,
    dueDate,
    setDueDate,
    assignedId,
    setAssignedId,
    streamMembers,
    isLoadingMembers,
    canCreateSubtask,
    isSubmitting,
    isSuccess,
    successMessage,
    error,
    handleSubmit,
  } = useAddTask({
    isOpen,
    onClose,
    onSuccess,
    stream,
    streamId,
    organisationId,
  });

  if (!isOpen) return null;

  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: "low", label: "Low", color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
    { value: "medium", label: "Medium", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
    { value: "high", label: "High", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
    { value: "urgent", label: "Urgent", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
  ];

  const impactOptions: { value: TaskImpact; label: string; color: string }[] = [
    { value: "low", label: "Low", color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
    { value: "medium", label: "Medium", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
    { value: "high", label: "High", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
    { value: "critical", label: "Critical", color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Add New Task
              </h2>
              <p className="text-xs text-muted-foreground">
                Assign and track work in {stream?.name || "this stream"}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* 1. Task Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Task Name <span className="text-destructive">*</span></span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Implement user authentication workflow"
              value={taskname}
              onChange={(e) => setTaskname(e.target.value)}
              disabled={isSubmitting || isSuccess}
              required
              autoFocus
              className="text-xs h-9"
            />
          </div>

          {/* 2. Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Add key deliverables, acceptance criteria, or context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting || isSuccess}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-2xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* 3. Priority & Impact Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                <span>Priority</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    disabled={isSubmitting || isSuccess}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer ${
                      priority === opt.value
                        ? `${opt.color} ring-1 ring-primary/40 font-semibold shadow-2xs`
                        : "border-border/60 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Impact Score */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-purple-500" />
                <span>Impact Score</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {impactOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setImpact(opt.value)}
                    disabled={isSubmitting || isSuccess}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer ${
                      impact === opt.value
                        ? `${opt.color} ring-1 ring-primary/40 font-semibold shadow-2xs`
                        : "border-border/60 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Due Date & Recurring Switch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Due Date</span>
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting || isSuccess}
                className="text-xs h-9"
              />
            </div>

            {/* Recurring Toggle Switch */}
            <div className="p-2.5 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between h-9">
              <div className="flex items-center gap-1.5">
                <Repeat className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Recurring</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={recurring}
                onClick={() => setRecurring(!recurring)}
                disabled={isSubmitting || isSuccess}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  recurring ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                    recurring ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 5. Member Assignment (Restricted to members of this specific stream only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Assign To Member</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                {isEmpTracker ? "Employee Tracker Stream" : "Members of this stream only"}
              </span>
            </label>

            {isEmpTracker ? (
              /* If Employee Tracker: Pre-assigned to that tracked employee */
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 font-semibold text-[11px]">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">
                      {trackedEmployeeName}
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      Auto-assigned to this tracked employee
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                  Tracked Employee
                </Badge>
              </div>
            ) : (
              /* If Department or Project: Dropdown among stream members only */
              <select
                value={assignedId}
                onChange={(e) => setAssignedId(e.target.value)}
                disabled={isSubmitting || isSuccess || isLoadingMembers}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-2xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {streamMembers.length === 0 ? (
                  <option value="" disabled>
                    {isLoadingMembers ? "Loading members..." : "No members found in this stream"}
                  </option>
                ) : (
                  streamMembers.map((m) => (
                    <option key={m.memberId} value={m.memberId}>
                      {m.name} {m.email ? `(${m.email})` : ""} {m.role ? `• ${m.role}` : ""}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          {/* 6. Assigner & Stream Reference (Autofilled in hook) */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-muted/10 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-3 w-3 text-primary" />
              <span>Assigner: <strong>{assignerName}</strong></span>
            </span>
            <span>Stream: <strong>{stream?.name || "Current Stream"}</strong></span>
          </div>

          {/* 7. Create Subtask Button (Kept INACTIVE as specified) */}
          <div className="pt-1">
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-border/80 bg-muted/10">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground/70" />
                  <span>Subtask</span>
                </span>
                <p className="text-[10px] text-muted-foreground/70">
                  Subtasks can be created after the parent task is saved
                </p>
              </div>

              {/* Inactive Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canCreateSubtask}
                className="text-xs h-7 gap-1 opacity-50 cursor-not-allowed"
                title="Subtasks can only be added to an existing task"
              >
                <Plus className="h-3 w-3" />
                <span>Create Subtask</span>
              </Button>
            </div>
          </div>
        </form>

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

          <Button
            type="button"
            size="sm"
            onClick={() => handleSubmit()}
            disabled={isSubmitting || isSuccess || !taskname.trim()}
            className="text-xs cursor-pointer gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Creating Task...</span>
              </>
            ) : (
              <>
                <CheckSquare className="h-3.5 w-3.5" />
                <span>Create Task</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AddTaskModal;
