"use client";

import * as React from "react";
import { taskService, type TaskItem } from "@/services/task.service";

export interface UseDeleteTaskOptions {
  onClose: () => void;
  onSuccess?: () => void;
  task?: TaskItem | null;
}

export function useDeleteTask({
  onClose,
  onSuccess,
  task,
}: UseDeleteTaskOptions) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDelete = React.useCallback(async () => {
    if (!task) return;
    const taskId = task.id || task._id;
    if (!taskId) {
      setError("Task identifier is missing.");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const res = await taskService.deleteTask(taskId);
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.message || "Failed to delete task.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete task.";
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  }, [task, onSuccess, onClose]);

  return {
    isDeleting,
    error,
    handleDelete,
  };
}

export default useDeleteTask;
