"use client";

import * as React from "react";
import type { TaskItem } from "@/services/task.service";
import { formatSecondsToHHMMSS } from "./useTimeLog";

export interface TodayTimeSummary {
  todaySeconds: number;
  liveTotalSeconds: number;
  todaySessionsCount: number;
  hasActiveTimer: boolean;
}

/**
 * Computes total seconds logged today (including active running timers)
 * and live cumulative seconds across a list of tasks.
 */
export function computeTodayTimeSummary(
  tasks: TaskItem[],
  nowMs: number
): TodayTimeSummary {
  const nowDate = new Date(nowMs);
  const startOfTodayMs = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate(),
    0,
    0,
    0,
    0
  ).getTime();

  let todaySeconds = 0;
  let activeRunningSeconds = 0;
  let persistedTotalSeconds = 0;
  let todaySessionsCount = 0;
  let hasActiveTimer = false;

  tasks.forEach((task) => {
    persistedTotalSeconds += task.totalTimeSpent || 0;

    if (!Array.isArray(task.timeLogs)) return;

    task.timeLogs.forEach((log) => {
      if (!log?.startTime) return;
      const startMs = new Date(log.startTime).getTime();
      if (!Number.isFinite(startMs)) return;

      if (log.isRunning) {
        hasActiveTimer = true;
        const totalElapsed = Math.max(0, Math.floor((nowMs - startMs) / 1000));
        activeRunningSeconds += totalElapsed;

        const effectiveStartMs = Math.max(startMs, startOfTodayMs);
        if (nowMs >= effectiveStartMs) {
          todaySeconds += Math.max(
            0,
            Math.floor((nowMs - effectiveStartMs) / 1000)
          );
          todaySessionsCount += 1;
        }
        return;
      }

      const fallbackEndMs = startMs + (log.duration || 0) * 1000;
      const endMs = log.endTime
        ? new Date(log.endTime).getTime()
        : fallbackEndMs;
      if (!Number.isFinite(endMs) || endMs <= startOfTodayMs) return;

      todaySessionsCount += 1;

      if (startMs >= startOfTodayMs) {
        todaySeconds +=
          typeof log.duration === "number" && log.duration >= 0
            ? log.duration
            : Math.max(0, Math.round((endMs - startMs) / 1000));
      } else {
        // Session crossed midnight: count only the portion inside today
        todaySeconds += Math.max(0, Math.floor((endMs - startOfTodayMs) / 1000));
      }
    });
  });

  return {
    todaySeconds,
    liveTotalSeconds: persistedTotalSeconds + activeRunningSeconds,
    todaySessionsCount,
    hasActiveTimer,
  };
}

/**
 * Hook that computes live "Today's Time Logged" and cumulative time across tasks.
 */
export function useTodayTimeLogged(tasks: TaskItem[], externalNowMs?: number) {
  const hasActiveTimer = React.useMemo(
    () =>
      tasks.some(
        (t) => Array.isArray(t.timeLogs) && t.timeLogs.some((l) => l.isRunning)
      ),
    [tasks]
  );

  const [internalNowMs, setInternalNowMs] = React.useState<number>(() =>
    Date.now()
  );

  React.useEffect(() => {
    if (externalNowMs !== undefined || !hasActiveTimer) return;
    const id = setInterval(() => {
      setInternalNowMs(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [externalNowMs, hasActiveTimer]);

  const effectiveNowMs = externalNowMs ?? internalNowMs;

  const summary = React.useMemo(
    () => computeTodayTimeSummary(tasks, effectiveNowMs),
    [tasks, effectiveNowMs]
  );

  return {
    ...summary,
    formattedTodayTime: formatSecondsToHHMMSS(summary.todaySeconds),
    formattedLiveTotalTime: formatSecondsToHHMMSS(summary.liveTotalSeconds),
  };
}

export default useTodayTimeLogged;
