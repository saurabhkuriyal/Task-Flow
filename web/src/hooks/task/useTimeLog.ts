"use client";

import * as React from "react";
import { useUser } from "@/context/UserContext";
import { timelogService } from "@/services/timelog.service";
import type { ITimeLog } from "@/models/tasks.model";

/**
 * Helper to format raw seconds into standard HH:MM:SS format.
 */
export function formatSecondsToHHMMSS(totalSeconds: number): string {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const remainingSeconds = secs % 60;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    remainingSeconds.toString().padStart(2, "0"),
  ].join(":");
}

export interface UseTimeLogOptions {
  taskId: string;
  initialTotalTimeSpent?: number; // in seconds
  initialTimeLogs?: ITimeLog[];
  onTimeSaved?: (newTotal: number) => void;
}

export function useTimeLog({
  taskId,
  initialTotalTimeSpent = 0,
  initialTimeLogs = [],
  onTimeSaved,
}: UseTimeLogOptions) {
  const { userId } = useUser();

  // Find if a timer session is already running from the initial logs
  const activeExistingLog = React.useMemo(() => {
    return initialTimeLogs.find((log) => log.isRunning);
  }, [initialTimeLogs]);

  const [isRunning, setIsRunning] = React.useState<boolean>(Boolean(activeExistingLog));
  const [activeLogId, setActiveLogId] = React.useState<string | null>(
    activeExistingLog?._id ? String(activeExistingLog._id) : null
  );
  const [sessionSeconds, setSessionSeconds] = React.useState<number>(0);
  const [persistedTotalSeconds, setPersistedTotalSeconds] = React.useState<number>(initialTotalTimeSpent);
  const [timeLogs, setTimeLogs] = React.useState<ITimeLog[]>(initialTimeLogs);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Derived total seconds: persistedTotalSeconds + sessionSeconds
  const totalSeconds = persistedTotalSeconds + sessionSeconds;

  // Interval timer tick
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isRunning) {
      intervalId = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning]);

  /**
   * Starts a new timer session and saves start time to backend.
   */
  const startTimer = React.useCallback(async () => {
    if (isRunning) return;
    setError(null);

    const now = new Date();
    setIsRunning(true);

    try {
      if (taskId && userId) {
        const response = await timelogService.startTimeLog({
          taskId,
          userId,
          startTime: now,
        });

        if (response.success && response.data) {
          if (response.data.timeLog?._id) {
            setActiveLogId(String(response.data.timeLog._id));
          }
          if (Array.isArray(response.data.timeLogs)) {
            setTimeLogs(response.data.timeLogs);
          }
          if (typeof response.data.totalTimeSpent === "number") {
            setPersistedTotalSeconds(response.data.totalTimeSpent);
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to record start time.";
      console.warn("Timer started locally:", msg);
      // Keep running locally even if network hiccups
    }
  }, [isRunning, taskId, userId]);

  /**
   * Stops the active timer session and saves end time & duration to backend.
   */
  const stopTimer = React.useCallback(async () => {
    if (!isRunning) return;
    setIsSaving(true);
    setError(null);

    const capturedDuration = sessionSeconds;
    const now = new Date();
    const currentActiveLogId = activeLogId;

    setIsRunning(false);

    try {
      if (taskId) {
        const response = await timelogService.stopTimeLog({
          taskId,
          userId: userId || undefined,
          timeLogId: currentActiveLogId || undefined,
          endTime: now,
          duration: capturedDuration,
        });

        if (response.success && response.data) {
          if (Array.isArray(response.data.timeLogs)) {
            setTimeLogs(response.data.timeLogs);
          }
          if (typeof response.data.totalTimeSpent === "number") {
            setPersistedTotalSeconds(response.data.totalTimeSpent);
            onTimeSaved?.(response.data.totalTimeSpent);
          }
        } else {
          onTimeSaved?.(persistedTotalSeconds + capturedDuration);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to record end time.";
      setError(msg);
      onTimeSaved?.(persistedTotalSeconds + capturedDuration);
    } finally {
      setIsSaving(false);
      setSessionSeconds(0);
      setActiveLogId(null);
    }
  }, [isRunning, sessionSeconds, activeLogId, taskId, userId, persistedTotalSeconds, onTimeSaved]);

  /**
   * Refetches time logs and cumulative total duration from the server.
   */
  const refetchLogs = React.useCallback(async () => {
    if (!taskId) return;
    try {
      const res = await timelogService.getTimeLogs(taskId);
      if (res.success) {
        setTimeLogs(res.timeLogs);
        setPersistedTotalSeconds(res.totalTimeSpent);
      }
    } catch (err) {
      console.warn("Failed to refetch timelogs:", err);
    }
  }, [taskId]);

  return {
    isRunning,
    sessionSeconds,
    totalSeconds,
    formattedSessionTime: formatSecondsToHHMMSS(sessionSeconds),
    formattedTotalTime: formatSecondsToHHMMSS(totalSeconds),
    timeLogs,
    isSaving,
    error,
    startTimer,
    stopTimer,
    refetchLogs,
  };
}

// Backward-compatible aliases
export const useTimelog = useTimeLog;
export default useTimeLog;
