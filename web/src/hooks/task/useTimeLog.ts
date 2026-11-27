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
  fallbackUserId?: string;
  initialTotalTimeSpent?: number; // in seconds
  initialTimeLogs?: ITimeLog[];
  onTimeSaved?: (newTotal: number) => void;
}

function getElapsedSecondsFromStart(startTime?: string | Date | null): number {
  if (!startTime) return 0;
  const startMs = new Date(startTime).getTime();
  if (!Number.isFinite(startMs)) return 0;
  return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
}

export function useTimeLog({
  taskId,
  fallbackUserId,
  initialTotalTimeSpent = 0,
  initialTimeLogs = [],
  onTimeSaved,
}: UseTimeLogOptions) {
  const { userId: contextUserId } = useUser();
  const effectiveUserId = contextUserId || fallbackUserId || "";

  // Find if a timer session is already running from the initial logs
  const activeExistingLog = React.useMemo(() => {
    return initialTimeLogs.find((log) => log.isRunning);
  }, [initialTimeLogs]);

  const [isRunning, setIsRunning] = React.useState<boolean>(() =>
    Boolean(activeExistingLog)
  );
  const [activeLogId, setActiveLogId] = React.useState<string | null>(() =>
    activeExistingLog?._id ? String(activeExistingLog._id) : null
  );
  const [activeStartTime, setActiveStartTime] = React.useState<number | null>(() => {
    if (!activeExistingLog?.startTime) return null;
    const ms = new Date(activeExistingLog.startTime).getTime();
    return Number.isFinite(ms) ? ms : null;
  });
  const [sessionSeconds, setSessionSeconds] = React.useState<number>(() =>
    activeExistingLog?.startTime
      ? getElapsedSecondsFromStart(activeExistingLog.startTime)
      : 0
  );
  const [persistedTotalSeconds, setPersistedTotalSeconds] =
    React.useState<number>(initialTotalTimeSpent);
  const [timeLogs, setTimeLogs] = React.useState<ITimeLog[]>(initialTimeLogs);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Derived total seconds: persistedTotalSeconds + sessionSeconds
  const totalSeconds = persistedTotalSeconds + sessionSeconds;

  // Sync latest time logs from the server whenever taskId opens/changes
  React.useEffect(() => {
    if (!taskId) return;
    let isCancelled = false;

    timelogService
      .getTimeLogs(taskId)
      .then((res) => {
        if (isCancelled || !res.success) return;
        setTimeLogs(res.timeLogs);
        setPersistedTotalSeconds(res.totalTimeSpent);

        const runningLog = res.timeLogs.find((log) => log.isRunning);
        if (runningLog) {
          const startMs = new Date(runningLog.startTime).getTime();
          setIsRunning(true);
          setActiveLogId(runningLog._id ? String(runningLog._id) : null);
          setActiveStartTime(Number.isFinite(startMs) ? startMs : Date.now());
          setSessionSeconds(getElapsedSecondsFromStart(runningLog.startTime));
        } else {
          setIsRunning(false);
          setActiveLogId(null);
          setActiveStartTime(null);
          setSessionSeconds(0);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn("Failed to sync timelogs:", err);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [taskId]);

  // Interval timer tick computed from activeStartTime so tab throttling cannot drift
  React.useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      if (activeStartTime) {
        setSessionSeconds(
          Math.max(0, Math.floor((Date.now() - activeStartTime) / 1000))
        );
      } else {
        setSessionSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning, activeStartTime]);

  /**
   * Starts a new timer session and saves start time to backend.
   */
  const startTimer = React.useCallback(async () => {
    if (isRunning) return;
    setError(null);

    if (!taskId || !effectiveUserId) {
      setError("User session not found. Please log in again to track time.");
      return;
    }

    const now = new Date();
    setActiveStartTime(now.getTime());
    setSessionSeconds(0);
    setIsRunning(true);

    try {
      const response = await timelogService.startTimeLog({
        taskId,
        userId: effectiveUserId,
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
        onTimeSaved?.(response.data.totalTimeSpent ?? persistedTotalSeconds);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to start timer session.";
      setIsRunning(false);
      setActiveStartTime(null);
      setSessionSeconds(0);
      setError(msg);
    }
  }, [isRunning, taskId, effectiveUserId, persistedTotalSeconds, onTimeSaved]);

  /**
   * Stops the active timer session and saves end time & duration to backend.
   */
  const stopTimer = React.useCallback(async () => {
    if (!isRunning) return;
    setIsSaving(true);
    setError(null);

    const capturedDuration = activeStartTime
      ? Math.max(0, Math.floor((Date.now() - activeStartTime) / 1000))
      : sessionSeconds;
    const now = new Date();
    const currentActiveLogId = activeLogId;

    setIsRunning(false);

    try {
      if (taskId) {
        const response = await timelogService.stopTimeLog({
          taskId,
          userId: effectiveUserId || undefined,
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
      const msg =
        err instanceof Error ? err.message : "Failed to record end time.";
      setError(msg);
      onTimeSaved?.(persistedTotalSeconds + capturedDuration);
    } finally {
      setIsSaving(false);
      setSessionSeconds(0);
      setActiveStartTime(null);
      setActiveLogId(null);
    }
  }, [
    isRunning,
    activeStartTime,
    sessionSeconds,
    activeLogId,
    taskId,
    effectiveUserId,
    persistedTotalSeconds,
    onTimeSaved,
  ]);

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
