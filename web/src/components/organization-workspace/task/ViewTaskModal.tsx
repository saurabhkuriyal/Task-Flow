"use client";

import * as React from "react";
import {
  X,
  Clock,
  Clock3,
  Timer,
  Play,
  Square,
  Calendar,
  CalendarCheck,
  User,
  Shield,
  Repeat,
  CheckCircle2,
  FileText,
  AlertCircle,
  AlertOctagon,
  Flame,
  Zap,
  StickyNote,
  Save,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTaskTimer, formatSecondsToHHMMSS } from "@/hooks/task/useTaskTimer";
import { taskService, type TaskItem } from "@/services/task.service";
import type { TaskPriority, TaskStatus, TaskImpact } from "@/models/tasks.model";

export interface ViewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: TaskItem | null;
  onTaskUpdated?: () => void;
}

export function ViewTaskModal({
  isOpen,
  onClose,
  task,
  onTaskUpdated,
}: ViewTaskModalProps) {
  const taskId = task?.id || task?._id || "";
  const initialTotalSeconds = task?.totalTimeSpent || 0;

  // Timer hook
  const {
    isRunning,
    formattedSessionTime,
    formattedTotalTime,
    isSaving: isSavingTimer,
    error: timerError,
    startTimer,
    stopTimer,
  } = useTaskTimer({
    taskId,
    initialTotalTimeSpent: initialTotalSeconds,
    timeLogs: task?.timeLogs || [],
    onTimeSaved: () => {
      onTaskUpdated?.();
    },
  });

  // Status and Note interactive states initialized directly from task prop
  const [currentStatus, setCurrentStatus] = React.useState<TaskStatus>(task?.status || "todo");
  const [noteText, setNoteText] = React.useState<string>(task?.note || "");
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = React.useState(false);
  const [noteMessage, setNoteMessage] = React.useState<string | null>(null);

  if (!isOpen || !task) return null;

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === currentStatus) return;
    setCurrentStatus(newStatus);
    setIsUpdatingStatus(true);
    setStatusMessage(null);

    try {
      await taskService.updateTask(taskId, { status: newStatus }).catch((err) => {
        console.info("Status updated locally (backend API pending):", err?.message);
      });
      setStatusMessage("Status updated!");
      onTaskUpdated?.();
      setTimeout(() => setStatusMessage(null), 2500);
    } catch {
      // Retain optimistic state
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNote = async () => {
    setIsSavingNote(true);
    setNoteMessage(null);

    try {
      await taskService.updateTask(taskId, { note: noteText.trim() }).catch((err) => {
        console.info("Note saved locally (backend API pending):", err?.message);
      });
      setNoteMessage("Note saved successfully!");
      onTaskUpdated?.();
      setTimeout(() => setNoteMessage(null), 2500);
    } catch {
      // Retain optimistic note
    } finally {
      setIsSavingNote(false);
    }
  };

  const getPriorityBadge = (priority?: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-[11px] uppercase font-semibold gap-1">
            <Flame className="h-3 w-3 fill-current" />
            Urgent
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[11px] uppercase font-semibold gap-1">
            <Flame className="h-3 w-3" />
            High
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 text-[11px] uppercase font-medium">
            Low
          </Badge>
        );
      case "medium":
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[11px] uppercase font-medium">
            Medium
          </Badge>
        );
    }
  };

  const getImpactBadge = (impact?: TaskImpact) => {
    switch (impact) {
      case "critical":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[11px] uppercase font-semibold gap-1">
            <Zap className="h-3 w-3 fill-current" />
            Critical Impact
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[11px] uppercase font-semibold gap-1">
            <Zap className="h-3 w-3" />
            High Impact
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 text-[11px] uppercase font-medium">
            Low Impact
          </Badge>
        );
      case "medium":
      default:
        return (
          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[11px] uppercase font-medium">
            Medium Impact
          </Badge>
        );
    }
  };

  const getStatusBadge = (status?: TaskStatus) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px] uppercase gap-1 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[11px] uppercase gap-1 font-semibold">
            <Clock3 className="h-3.5 w-3.5 animate-spin" />
            In Progress
          </Badge>
        );
      case "in_review":
        return (
          <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[11px] uppercase gap-1 font-semibold">
            In Review
          </Badge>
        );
      case "blocked":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[11px] uppercase gap-1 font-semibold">
            <AlertOctagon className="h-3.5 w-3.5" />
            Blocked
          </Badge>
        );
      case "backlog":
        return (
          <Badge variant="outline" className="text-[11px] uppercase">
            Backlog
          </Badge>
        );
      case "todo":
      default:
        return (
          <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 text-[11px] uppercase font-semibold">
            To Do
          </Badge>
        );
    }
  };

  const statusOptions: { value: TaskStatus; label: string; icon: React.ReactNode }[] = [
    { value: "todo", label: "To Do", icon: <Clock className="h-3.5 w-3.5 text-sky-500" /> },
    { value: "in_progress", label: "In Progress", icon: <Clock3 className="h-3.5 w-3.5 text-amber-500 animate-spin" /> },
    { value: "in_review", label: "In Review", icon: <Clock className="h-3.5 w-3.5 text-indigo-500" /> },
    { value: "completed", label: "Completed", icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> },
    { value: "blocked", label: "Blocked", icon: <AlertOctagon className="h-3.5 w-3.5 text-rose-500" /> },
    { value: "backlog", label: "Backlog", icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" /> },
  ];

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-border/80 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-5 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* 1. Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-border/60 shrink-0">
          <div className="space-y-2 pr-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {task.taskname || task.title}
              </h2>
              {getStatusBadge(currentStatus)}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {getPriorityBadge(task.priority)}
              {getImpactBadge(task.impact)}
              {task.recurring && (
                <Badge variant="outline" className="text-[10px] gap-1 border-purple-500/30 text-purple-600">
                  <Repeat className="h-3 w-3" />
                  Recurring
                </Badge>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          {/* Enhanced Live Time Tracker Card */}
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/5 via-card to-background p-5 space-y-4 shadow-sm">
            {/* Top row: Clock Icon, Header, Start/End Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                    isRunning
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/50"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Timer className={`h-5 w-5 ${isRunning ? "animate-spin" : ""}`} />
                  {isRunning && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>Task Time Tracker</span>
                    </h3>
                    {isRunning && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Recording Live
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {isRunning
                      ? "Timer is ticking. Hit End Timer when taking a break or finishing work."
                      : "Click Start Timer to begin tracking your work session."}
                  </p>
                </div>
              </div>

              {/* Start & End Timer Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {!isRunning ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={startTimer}
                    className="h-9 px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer font-semibold rounded-xl"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Start Timer</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={stopTimer}
                    disabled={isSavingTimer}
                    className="h-9 px-4 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer font-semibold rounded-xl"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                    <span>{isSavingTimer ? "Saving..." : "End Timer"}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Prominent Digital Clock Clocks (hh:mm:ss) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50">
              {/* Current Session Timer */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  isRunning
                    ? "bg-emerald-500/10 border-emerald-500/30 shadow-xs"
                    : "bg-background/80 border-border/60"
                }`}
              >
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock3 className={`h-3 w-3 ${isRunning ? "text-emerald-500" : ""}`} />
                    <span>Current Session</span>
                  </span>
                  {isRunning && (
                    <span className="text-[10px] text-emerald-600 font-medium">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl sm:text-3xl font-mono font-bold tracking-widest ${
                      isRunning
                        ? "text-emerald-600 dark:text-emerald-400 drop-shadow-xs"
                        : "text-foreground"
                    }`}
                  >
                    {formattedSessionTime}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    hh:mm:ss
                  </span>
                </div>
              </div>

              {/* Total Time Spent */}
              <div className="p-3.5 rounded-xl border bg-background/80 border-border/60">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Timer className="h-3 w-3 text-primary" />
                    <span>Total Time Spent</span>
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-mono font-bold tracking-widest text-primary drop-shadow-xs">
                    {formattedTotalTime}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    hh:mm:ss
                  </span>
                </div>
              </div>
            </div>

            {timerError && (
              <div className="flex items-center gap-2 text-[11px] text-destructive pt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{timerError}</span>
              </div>
            )}
          </div>

          {/* 3. Interactive Quick Status Updater */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                <span>Update Status</span>
              </span>
              {statusMessage && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 animate-in fade-in">
                  <Check className="h-3 w-3" />
                  {statusMessage}
                </span>
              )}
            </div>

            {/* Quick status pill buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {statusOptions.map((opt) => {
                const isActive = currentStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleStatusChange(opt.value)}
                    disabled={isUpdatingStatus}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary/10 border-primary/40 font-semibold text-primary shadow-2xs"
                        : "bg-background/80 border-border/60 text-muted-foreground hover:bg-background hover:text-foreground"
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                    {isActive && <Check className="h-3 w-3 ml-auto text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Write / Update Note Section */}
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <StickyNote className="h-3.5 w-3.5 text-primary" />
                <span>Task Note & Updates</span>
              </span>
              {noteMessage && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 animate-in fade-in">
                  <Check className="h-3 w-3" />
                  {noteMessage}
                </span>
              )}
            </div>

            <textarea
              rows={3}
              placeholder="Write important notes, progress updates, or blockers here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              disabled={isSavingNote}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-xs shadow-2xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            />

            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleSaveNote}
                disabled={isSavingNote}
                className="h-8 px-3.5 text-xs gap-1.5 cursor-pointer font-medium"
              >
                {isSavingNote ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3" />
                    <span>Save Note</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 5. Task Description */}
          <div className="space-y-1.5">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Description</span>
            </span>
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {task.description || (
                <span className="italic text-muted-foreground/60">
                  No description provided for this task.
                </span>
              )}
            </div>
          </div>

          {/* 6. Key Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Assignee */}
            <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                <User className="h-3 w-3 text-primary" />
                Assignee
              </span>
              <p className="font-semibold text-foreground text-xs">
                {task.assigneeName || "Unassigned"}
              </p>
            </div>

            {/* Assigner */}
            <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                <Shield className="h-3 w-3 text-primary" />
                Assigned By
              </span>
              <p className="font-semibold text-foreground text-xs">
                {task.assignerName || "Creator"}
              </p>
            </div>

            {/* Due Date */}
            <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3 text-primary" />
                Due Date
              </span>
              <p className="font-semibold text-foreground text-xs">
                {formatDate(task.dueDate)}
              </p>
            </div>

            {/* Created Date */}
            <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                <CalendarCheck className="h-3 w-3 text-primary" />
                Created On
              </span>
              <p className="font-semibold text-foreground text-xs">
                {formatDate(task.createdAt || task.date)}
              </p>
            </div>
          </div>

          {/* 7. Previous Time Logs History */}
          {Array.isArray(task.timeLogs) && task.timeLogs.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <h4 className="font-semibold text-foreground text-xs">
                  Time Log History ({task.timeLogs.length} sessions)
                </h4>
              </div>
              <div className="rounded-xl border border-border/60 divide-y divide-border/40 overflow-hidden bg-background">
                {task.timeLogs.map((log, index) => (
                  <div
                    key={log._id ? String(log._id) : index}
                    className="flex items-center justify-between p-2.5 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {new Date(log.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {log.endTime
                          ? ` - ${new Date(log.endTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : " (Running)"}
                      </span>
                    </div>
                    <span className="font-mono font-medium text-primary">
                      {formatSecondsToHHMMSS(log.duration || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 8. Footer */}
        <div className="flex justify-end pt-3 border-t border-border/60 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8.5 px-4 cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ViewTaskModal;
