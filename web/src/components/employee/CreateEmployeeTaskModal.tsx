"use client";

import * as React from "react";
import {
  X,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Hash,
  Flame,
  CheckSquare,
  FileText,
  StickyNote,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/UserContext";
import { taskService } from "@/services/task.service";
import type { TaskPriority, TaskImpact, TaskStatus } from "@/models/tasks.model";
import type { EmployeeInfo } from "@/services/task.service";

export interface CreateEmployeeTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  memberId: string;
  employee?: EmployeeInfo | null;
  orgId?: string;
  streamId?: string | null;
  streamName?: string | null;
}

export function CreateEmployeeTaskModal({
  isOpen,
  onClose,
  onSuccess,
  memberId,
  employee,
  orgId,
  streamId,
  streamName,
}: CreateEmployeeTaskModalProps) {
  const { userId: currentUserId, userName, organizationId: contextOrgId } = useUser();

  const effectiveOrgId = orgId || contextOrgId || "";
  const assignerId = currentUserId || "";
  const assignerName = userName || "You (Current User)";

  // Form states
  const [taskname, setTaskname] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [impact, setImpact] = React.useState<TaskImpact>("medium");
  const [status, setStatus] = React.useState<TaskStatus>("todo");
  const [recurring, setRecurring] = React.useState(false);
  const [dueDate, setDueDate] = React.useState("");
  const [note, setNote] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const resetForm = () => {
    setTaskname("");
    setDescription("");
    setPriority("medium");
    setImpact("medium");
    setStatus("todo");
    setRecurring(false);
    setDueDate("");
    setNote("");
    setError(null);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskname.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!effectiveOrgId) {
      setError("Organization ID is missing. Please make sure you are in an organization.");
      return;
    }

    if (!assignerId) {
      setError("Assigner User ID is missing. Please log in first.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await taskService.createTask({
        taskname: taskname.trim(),
        orgId: effectiveOrgId,
        streamId: streamId || null, // streamId or null for direct member task
        userId: assignerId,
        assignedId: memberId, // "assigned to member will be that member id"
        status,
        priority,
        impact,
        recurring,
        dueDate: dueDate ? dueDate : null,
        description: description.trim(),
        note: note.trim(),
      });

      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err) {
      console.error("Failed to create employee task:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while creating task."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Assign Task to Member
              </h2>
              <p className="text-xs text-muted-foreground">
                Direct assignment to {employee?.name || "Member"} (No stream attached)
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Member & Stream Assignment Summary Card */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <User className="h-3.5 w-3.5 text-primary" />
                Assigned Member:
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <span>{employee?.name || "Member"}</span>
                <span className="text-muted-foreground font-mono text-[10px]">
                  ({memberId})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <Hash className="h-3.5 w-3.5 text-muted-foreground/80" />
                Stream Association:
              </span>
              <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">
                {streamName || (streamId ? "Selected Stream" : "None (Direct Member Task)")}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <CheckSquare className="h-3.5 w-3.5 text-muted-foreground/80" />
                Assigned By:
              </span>
              <span className="text-foreground font-medium">{assignerName}</span>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Task created and assigned successfully!</span>
            </div>
          )}

          {/* Task Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              <span>Task Title</span>
              <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder="e.g., Complete code review for PR #42"
              value={taskname}
              onChange={(e) => setTaskname(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Description</span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide context or instructions for this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Priority & Impact Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Priority</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {priorityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className={`py-1.5 px-1 rounded-md text-[11px] font-medium border text-center transition-all cursor-pointer ${
                      priority === opt.value
                        ? `${opt.color} ring-1 ring-primary/40 font-semibold shadow-xs`
                        : "border-border/60 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Impact */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <span>Impact</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {impactOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setImpact(opt.value)}
                    className={`py-1.5 px-1 rounded-md text-[11px] font-medium border text-center transition-all cursor-pointer ${
                      impact === opt.value
                        ? `${opt.color} ring-1 ring-primary/40 font-semibold shadow-xs`
                        : "border-border/60 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due Date & Recurring */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Due Date</span>
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* Recurring Toggle Switch */}
            <div className="p-2 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between h-9">
              <div className="flex items-center gap-1.5">
                <Repeat className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Recurring</span>
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

          {/* Initial Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="backlog">Backlog</option>
              <option value="in_review">In Review</option>
            </select>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1">
              <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Initial Note</span>
              <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Add an internal note or quick comment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-xs h-8 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !taskname.trim()}
              className="text-xs h-8 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Assign Task
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEmployeeTaskModal;
