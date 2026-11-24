"use client";

import * as React from "react";
import {
  X,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Flame,
  Repeat,
  FileEdit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditTask } from "@/hooks/task/useEditTask";
import type { TaskItem } from "@/services/task.service";
import type { StreamItem } from "@/services/stream.service";
import type { TaskPriority, TaskImpact, TaskStatus } from "@/models/tasks.model";

export interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  task?: TaskItem | null;
  stream?: StreamItem | null;
  streamId?: string;
  organisationId?: string;
}

export function EditTaskModal({
  isOpen,
  onClose,
  onSuccess,
  task,
  stream,
  streamId,
  organisationId,
}: EditTaskModalProps) {
  const {
    taskname,
    setTaskname,
    description,
    setDescription,
    priority,
    setPriority,
    impact,
    setImpact,
    status,
    setStatus,
    recurring,
    setRecurring,
    dueDate,
    setDueDate,
    note,
    setNote,
    assignedId,
    setAssignedId,
    streamMembers,
    isLoadingMembers,
    isSubmitting,
    isSuccess,
    successMessage,
    error,
    handleSubmit,
  } = useEditTask({
    isOpen,
    onClose,
    onSuccess,
    task,
    stream,
    streamId,
    organisationId,
  });

  if (!isOpen || !task) return null;

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

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "in_review", label: "In Review" },
    { value: "completed", label: "Completed" },
    { value: "backlog", label: "Backlog" },
    { value: "blocked", label: "Blocked" },
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
              <FileEdit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Edit Task
              </h2>
              <p className="text-xs text-muted-foreground">
                Update task details and assignments
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Task Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Task Name <span className="text-destructive">*</span></span>
            </label>
            <Input
              type="text"
              value={taskname}
              onChange={(e) => setTaskname(e.target.value)}
              disabled={isSubmitting || isSuccess}
              required
              className="text-xs h-9"
            />
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              disabled={isSubmitting || isSuccess}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs shadow-2xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            >
              {statusOptions.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting || isSuccess}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-2xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Priority & Impact */}
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

            {/* Impact */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Impact</span>
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

          {/* Assign Member & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Assign to Stream Member */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>Assign To</span>
              </label>
              <select
                value={assignedId}
                onChange={(e) => setAssignedId(e.target.value)}
                disabled={isSubmitting || isSuccess}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs shadow-2xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              >
                <option value="">
                  {isLoadingMembers ? "Loading members..." : "Unassigned"}
                </option>
                {streamMembers.map((m) => (
                  <option key={m.memberId} value={m.memberId}>
                    {m.name} {m.role ? `(${m.role})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>Due Date</span>
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting || isSuccess}
                className="text-xs h-9 cursor-pointer"
              />
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Repeat className="h-3.5 w-3.5 text-primary" />
                <span>Recurring Task</span>
              </span>
              <p className="text-[11px] text-muted-foreground">
                Mark task as regular or repeating
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={recurring}
              onClick={() => setRecurring(!recurring)}
              disabled={isSubmitting || isSuccess}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
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

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Internal Note
            </label>
            <Input
              type="text"
              placeholder="e.g. Needs approval before merging"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting || isSuccess}
              className="text-xs h-9"
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-8.5 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isSuccess}
              className="text-xs h-8.5 px-4 gap-1.5 cursor-pointer font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTaskModal;
