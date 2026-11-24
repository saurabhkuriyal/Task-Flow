"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteTask } from "@/hooks/task/useDeleteTask";
import type { TaskItem } from "@/services/task.service";

export interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  task?: TaskItem | null;
}

export function DeleteTaskModal({
  isOpen,
  onClose,
  onSuccess,
  task,
}: DeleteTaskModalProps) {
  const { isDeleting, error, handleDelete } = useDeleteTask({
    onClose,
    onSuccess,
    task,
  });

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              Delete Task
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                &ldquo;{task.taskname || task.title}&rdquo;
              </strong>
              ? This action cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs h-8.5 px-3.5 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs h-8.5 px-3.5 gap-1.5 cursor-pointer font-medium"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Task</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeleteTaskModal;
