"use client";

import * as React from "react";
import { useUser } from "@/context/UserContext";
import { taskService } from "@/services/task.service";
import type { ITimeLog } from "@/models/tasks.model";

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

export interface UseTaskTimerOptions {
  taskId: string;
  initialTotalTimeSpent?: number; // in seconds
  timeLogs?: ITimeLog[];
  onTimeSaved?: (newTotal: number) => void;
}

export function useTaskTimer({
  taskId,
  initialTotalTimeSpent = 0,
  timeLogs = [],
  onTimeSaved,
}: UseTaskTimerOptions) {
  const { userId } = useUser();

  // Determine if there is already an active running session from logs
  const activeLog = React.useMemo(() => {
    return timeLogs.find((log) => log.isRunning);
  }, [timeLogs]);

  const [isRunning, setIsRunning] = React.useState<boolean>(Boolean(activeLog));
  const [sessionSeconds, setSessionSeconds] = React.useState<number>(0);
  const [startTime, setStartTime] = React.useState<Date | null>(null);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Derived total seconds: initialTotalTimeSpent + sessionSeconds (avoids setState in effect)
  const totalSeconds = initialTotalTimeSpent + sessionSeconds;

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
   * Start timer session.
   */
  const startTimer = React.useCallback(async () => {
    if (isRunning) return;
    setError(null);

    const now = new Date();
    setStartTime(now);
    setIsRunning(true);

    try {
      if (taskId && userId) {
        // Dispatches to service. If API route doesn't exist yet, fails gracefully
        await taskService.startTimer({
          taskId,
          userId,
          startTime: now,
        }).catch((err) => {
          // Keep local timer active even if API is not yet built
          console.info("Timer started locally (backend API pending):", err?.message);
        });
      }
    } catch {
      // Non-fatal for timer UI
    }
  }, [isRunning, taskId, userId]);

  /**
   * Stop / End timer session and record accumulated time.
   */
  const stopTimer = React.useCallback(async () => {
    if (!isRunning) return;
    setIsSaving(true);
    setError(null);

    const capturedDuration = sessionSeconds;
    const now = new Date();
    setIsRunning(false);

    try {
      if (taskId && userId) {
        await taskService.stopTimer({
          taskId,
          userId,
          endTime: now,
          duration: capturedDuration,
        }).catch((err) => {
          console.info("Timer stopped locally (backend API pending):", err?.message);
        });
      }

      const updatedTotal = totalSeconds;
      onTimeSaved?.(updatedTotal);
    } catch {
      // Local timer state preserved
    } finally {
      setIsSaving(false);
      setSessionSeconds(0);
      setStartTime(null);
    }
  }, [isRunning, sessionSeconds, taskId, userId, totalSeconds, onTimeSaved]);

  /**
   * Reset the current timer session.
   */
  const resetTimer = React.useCallback(() => {
    setIsRunning(false);
    setSessionSeconds(0);
    setStartTime(null);
  }, []);

  return {
    isRunning,
    sessionSeconds,
    totalSeconds,
    formattedSessionTime: formatSecondsToHHMMSS(sessionSeconds),
    formattedTotalTime: formatSecondsToHHMMSS(totalSeconds),
    startTime,
    isSaving,
    error,
    startTimer,
    stopTimer,
    resetTimer,
  };
}

export default useTaskTimer;
