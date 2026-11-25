"use client";

import * as React from "react";
import {
  taskService,
  type TaskItem,
  type CategorizedStreamGroup,
  type CategorizedAssignerGroup,
  type EmployeeInfo,
} from "@/services/task.service";
import type { TaskStatus } from "@/models/tasks.model";

export type TaskPanelViewMode = "by_stream" | "by_assigner" | "all_tasks";

export interface UseEmployeeTaskPanelOptions {
  userId: string;
  orgId?: string;
  autoFetch?: boolean;
}

export interface TaskMetrics {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  blocked: number;
  inReview: number;
  totalTimeSpent: number; // in seconds
  completionPercentage: number;
}

export function useEmployeeTaskPanel({
  userId,
  orgId,
  autoFetch = true,
}: UseEmployeeTaskPanelOptions) {
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [employee, setEmployee] = React.useState<EmployeeInfo | null>(null);
  const [categorizedByStream, setCategorizedByStream] = React.useState<
    CategorizedStreamGroup[]
  >([]);
  const [categorizedByAssigner, setCategorizedByAssigner] = React.useState<
    CategorizedAssignerGroup[]
  >([]);

  const [isLoading, setIsLoading] = React.useState<boolean>(Boolean(autoFetch && userId));
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filters & View state
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<TaskPanelViewMode>("by_stream");

  const fetchTasks = React.useCallback(
    async (silent = false) => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await taskService.getTasksByUserId(userId, orgId);
        setTasks(response.tasks || []);
        setEmployee(response.employee || null);
        setCategorizedByStream(response.categorizedByStream || []);
        setCategorizedByAssigner(response.categorizedByAssigner || []);
      } catch (err) {
        console.error("useEmployeeTaskPanel error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load employee tasks."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [userId, orgId]
  );

  React.useEffect(() => {
    let isMounted = true;

    if (autoFetch && userId) {
      taskService
        .getTasksByUserId(userId, orgId)
        .then((response) => {
          if (!isMounted) return;
          setTasks(response.tasks || []);
          setEmployee(response.employee || null);
          setCategorizedByStream(response.categorizedByStream || []);
          setCategorizedByAssigner(response.categorizedByAssigner || []);
          setIsLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error("useEmployeeTaskPanel error:", err);
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load employee tasks."
          );
          setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [userId, orgId, autoFetch]);

  // Derived filtered tasks
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = task.taskname?.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        const matchesStream = task.streamName?.toLowerCase().includes(query);
        const matchesAssigner = task.assignerName?.toLowerCase().includes(query);
        const matchesNote = task.note?.toLowerCase().includes(query);

        if (!matchesName && !matchesDesc && !matchesStream && !matchesAssigner && !matchesNote) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // Filtered streams
  const filteredCategorizedByStream = React.useMemo(() => {
    return categorizedByStream
      .map((group) => {
        const matchingTasks = group.tasks.filter((task) => {
          if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            const matchesName = task.taskname?.toLowerCase().includes(query);
            const matchesDesc = task.description?.toLowerCase().includes(query);
            const matchesAssigner = task.assignerName?.toLowerCase().includes(query);
            const matchesStream = group.streamName.toLowerCase().includes(query);
            if (!matchesName && !matchesDesc && !matchesAssigner && !matchesStream) {
              return false;
            }
          }
          if (statusFilter !== "all" && task.status !== statusFilter) return false;
          if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
          return true;
        });

        const completed = matchingTasks.filter((t) => t.status === "completed").length;
        const inProgress = matchingTasks.filter((t) => t.status === "in_progress").length;
        const timeSpent = matchingTasks.reduce((acc, t) => acc + (t.totalTimeSpent || 0), 0);

        return {
          ...group,
          tasks: matchingTasks,
          totalTasks: matchingTasks.length,
          completedTasks: completed,
          inProgressTasks: inProgress,
          totalTimeSpent: timeSpent,
        };
      })
      .filter((group) => group.tasks.length > 0);
  }, [categorizedByStream, searchTerm, statusFilter, priorityFilter]);

  // Filtered assigners
  const filteredCategorizedByAssigner = React.useMemo(() => {
    return categorizedByAssigner
      .map((group) => {
        const matchingTasks = group.tasks.filter((task) => {
          if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            const matchesName = task.taskname?.toLowerCase().includes(query);
            const matchesDesc = task.description?.toLowerCase().includes(query);
            const matchesAssigner = group.assignerName.toLowerCase().includes(query);
            const matchesStream = task.streamName?.toLowerCase().includes(query);
            if (!matchesName && !matchesDesc && !matchesAssigner && !matchesStream) {
              return false;
            }
          }
          if (statusFilter !== "all" && task.status !== statusFilter) return false;
          if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
          return true;
        });

        const completed = matchingTasks.filter((t) => t.status === "completed").length;
        const inProgress = matchingTasks.filter((t) => t.status === "in_progress").length;
        const timeSpent = matchingTasks.reduce((acc, t) => acc + (t.totalTimeSpent || 0), 0);

        return {
          ...group,
          tasks: matchingTasks,
          totalTasks: matchingTasks.length,
          completedTasks: completed,
          inProgressTasks: inProgress,
          totalTimeSpent: timeSpent,
        };
      })
      .filter((group) => group.tasks.length > 0);
  }, [categorizedByAssigner, searchTerm, statusFilter, priorityFilter]);

  // Calculated overall metrics
  const metrics = React.useMemo<TaskMetrics>(() => {
    const total = tasks.length;
    let completed = 0;
    let inProgress = 0;
    let todo = 0;
    let blocked = 0;
    let inReview = 0;
    let totalTimeSpent = 0;

    tasks.forEach((t) => {
      totalTimeSpent += t.totalTimeSpent || 0;
      switch (t.status as TaskStatus) {
        case "completed":
          completed += 1;
          break;
        case "in_progress":
          inProgress += 1;
          break;
        case "todo":
        case "backlog":
          todo += 1;
          break;
        case "blocked":
          blocked += 1;
          break;
        case "in_review":
          inReview += 1;
          break;
      }
    });

    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      todo,
      blocked,
      inReview,
      totalTimeSpent,
      completionPercentage,
    };
  }, [tasks]);

  return {
    tasks,
    filteredTasks,
    employee,
    categorizedByStream,
    filteredCategorizedByStream,
    categorizedByAssigner,
    filteredCategorizedByAssigner,
    metrics,
    isLoading,
    isRefreshing,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    viewMode,
    setViewMode,
    refetch: () => fetchTasks(true),
    reload: () => fetchTasks(false),
  };
}

export default useEmployeeTaskPanel;
