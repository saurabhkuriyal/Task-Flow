"use client";

import * as React from "react";
import { taskService, type TaskItem } from "@/services/task.service";

export interface UseStreamTasksOptions {
  streamId?: string;
  orgId?: string;
  enabled?: boolean;
}

/**
 * Hook to fetch and filter tasks for a specific stream.
 */
export function useStreamTasks({
  streamId,
  orgId,
  enabled = true,
}: UseStreamTasksOptions) {
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(Boolean(enabled && streamId));
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    if (!enabled || !streamId) {
      return;
    }

    let isCancelled = false;

    async function fetchTasks() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await taskService.getTasksByStream(streamId!, orgId);
        if (!isCancelled) {
          if (res.success && Array.isArray(res.tasks)) {
            setTasks(res.tasks);
          } else {
            setTasks([]);
            if (res.message) setError(res.message);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load tasks."
          );
          setTasks([]);
          setIsLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      isCancelled = true;
    };
  }, [streamId, orgId, enabled, refreshKey]);

  const refetch = React.useCallback(() => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  const filteredTasks = React.useMemo(() => {
    if (!searchTerm.trim()) return tasks;
    const term = searchTerm.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title?.toLowerCase().includes(term) ||
        t.taskname?.toLowerCase().includes(term) ||
        t.assigneeName?.toLowerCase().includes(term) ||
        t.status?.toLowerCase().includes(term) ||
        t.priority?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
    );
  }, [tasks, searchTerm]);

  return {
    tasks,
    filteredTasks,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    refetch,
  };
}

export default useStreamTasks;
