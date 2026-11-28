"use client";

import * as React from "react";
import { taskService, type TaskItem } from "@/services/task.service";

export interface UseTasksByOrgOptions {
  orgId: string;
  status?: string;
  priority?: string;
  directOnly?: boolean;
  enabled?: boolean;
}

/**
 * Fetches all tasks for an organization in a single API call,
 * including both stream-attached tasks and direct member tasks.
 */
export function useTasksByOrg({
  orgId,
  status,
  priority,
  directOnly,
  enabled = true,
}: UseTasksByOrgOptions) {
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [directTasksCount, setDirectTasksCount] = React.useState<number>(0);
  const [streamTasksCount, setStreamTasksCount] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(
    Boolean(enabled && orgId)
  );
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState<number>(0);

  React.useEffect(() => {
    if (!enabled || !orgId) return;
    let isCancelled = false;

    taskService
      .getTasksByOrg(orgId, { status, priority, directOnly })
      .then((res) => {
        if (isCancelled) return;
        if (res.success) {
          setTasks(Array.isArray(res.tasks) ? res.tasks : []);
          setDirectTasksCount(res.directTasksCount || 0);
          setStreamTasksCount(res.streamTasksCount || 0);
          setError(null);
        } else {
          setTasks([]);
          setError(res.message || "Failed to fetch organization tasks.");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to fetch organization tasks.";
        setError(msg);
        setTasks([]);
        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [orgId, status, priority, directOnly, enabled, refreshKey]);

  const refetch = React.useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    tasks,
    count: tasks.length,
    directTasksCount,
    streamTasksCount,
    isLoading,
    error,
    refetch,
  };
}

export default useTasksByOrg;
