"use client";

import * as React from "react";
import { useUser } from "@/context/UserContext";
import { useStreams } from "@/hooks/stream/useStreams";
import { useTasksByOrg } from "@/hooks/task/useTasksByOrg";
import { useOrganizationAnalytics } from "@/hooks/organizations/useOrganizationAnalytics";
import { organizationService } from "@/services/organization.service";
import type { OrganizationDocumentData } from "@/types/organization";
import type { StreamItem } from "@/services/stream.service";
import type { User } from "@/types/auth";

export interface UseOrganizationHomeOptions {
  orgId: string;
  initialOrganization?: OrganizationDocumentData | null;
}

export interface LeaderSummaryItem {
  id: string;
  name: string;
  email?: string;
  streams: { id: string; name: string; type: StreamItem["type"] }[];
}

export interface StreamWorkloadItem {
  streamId: string;
  name: string;
  type: StreamItem["type"];
  total: number;
  completed: number;
  pending: number;
}

export interface OrganizationHomeTaskStats {
  total: number;
  completed: number;
  pending: number;
  directTasks: number;
  streamTasks: number;
  todo: number;
  inProgress: number;
  inReview: number;
  blocked: number;
  backlog: number;
  completionRate: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
}

export interface OrganizationTeamStats {
  totalMembers: number;
  employeesCount: number;
  managersCount: number;
  leadsCount: number;
  adminsCount: number;
  activeMembersCount: number;
}

function extractId(val: unknown): string {
  if (!val) return "";
  if (typeof val === "object" && val !== null && "_id" in val) {
    return String((val as { _id?: unknown })._id || "");
  }
  return String(val);
}

/**
 * Aggregates organization metadata, streams (departments & projects),
 * team members, managers, leads, and task analytics using the dedicated
 * organization, tasks-by-org, and analytics APIs.
 */
export function useOrganizationHome({
  orgId,
  initialOrganization = null,
}: UseOrganizationHomeOptions) {
  const { organizationName: contextOrgName } = useUser();

  const {
    streams,
    departments,
    projects,
    members,
    isLoading: isStreamsLoading,
    error: streamsError,
    refetch: refetchStreams,
    currentOrgName,
  } = useStreams({ organisationId: orgId });

  const {
    tasks,
    directTasksCount,
    streamTasksCount,
    isLoading: isTasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useTasksByOrg({ orgId, enabled: Boolean(orgId) });

  const {
    analytics,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useOrganizationAnalytics({ orgId, enabled: Boolean(orgId) });

  const [fetchedOrg, setFetchedOrg] =
    React.useState<OrganizationDocumentData | null>(initialOrganization);
  const [orgRefreshKey, setOrgRefreshKey] = React.useState<number>(0);

  // Sync fresh organization details directly by ID via organizationService.getOrganizationById
  React.useEffect(() => {
    if (!orgId) return;
    let isCancelled = false;

    organizationService
      .getOrganizationById(orgId)
      .then((org) => {
        if (!isCancelled && org) {
          setFetchedOrg(org);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn("Organization fetch by ID failed:", err);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [orgId, orgRefreshKey]);

  const organization = fetchedOrg || initialOrganization;

  const workStreams = React.useMemo(
    () =>
      streams.filter(
        (s) => s.type === "department" || s.type === "project"
      ),
    [streams]
  );

  const refetch = React.useCallback(() => {
    refetchStreams();
    refetchTasks();
    refetchAnalytics();
    setOrgRefreshKey((k) => k + 1);
  }, [refetchStreams, refetchTasks, refetchAnalytics]);

  // Lookup map of members by ID
  const memberById = React.useMemo(() => {
    const map = new Map<string, User>();
    members.forEach((m) => {
      const id = m.id || m._id || "";
      if (id) map.set(String(id), m);
    });
    return map;
  }, [members]);

  // Unique Managers (from stream.manager + users with role === "manager")
  const managers = React.useMemo<LeaderSummaryItem[]>(() => {
    const map = new Map<string, LeaderSummaryItem>();

    workStreams.forEach((stream) => {
      const streamId = stream._id || stream.id || "";
      if (!Array.isArray(stream.manager)) return;
      stream.manager.forEach((mgr) => {
        const id = extractId(mgr.id);
        if (!id) return;
        const userDoc = memberById.get(id);
        const existing = map.get(id) || {
          id,
          name: userDoc?.name || mgr.name || "Manager",
          email: userDoc?.email || mgr.email,
          streams: [],
        };
        if (
          streamId &&
          !existing.streams.some((s) => s.id === streamId)
        ) {
          existing.streams.push({
            id: streamId,
            name: stream.name,
            type: stream.type,
          });
        }
        map.set(id, existing);
      });
    });

    members.forEach((m) => {
      if (m.role?.toLowerCase() === "manager") {
        const id = m.id || m._id || "";
        if (id && !map.has(String(id))) {
          map.set(String(id), {
            id: String(id),
            name: m.name || "Manager",
            email: m.email,
            streams: [],
          });
        }
      }
    });

    return Array.from(map.values());
  }, [workStreams, members, memberById]);

  // Unique Leads (from stream.lead across departments/projects + users with role === "lead")
  const leads = React.useMemo<LeaderSummaryItem[]>(() => {
    const map = new Map<string, LeaderSummaryItem>();

    workStreams.forEach((stream) => {
      const streamId = stream._id || stream.id || "";
      if (!Array.isArray(stream.lead)) return;
      stream.lead.forEach((ld) => {
        const id = extractId(ld.id);
        if (!id) return;
        const userDoc = memberById.get(id);
        const existing = map.get(id) || {
          id,
          name: userDoc?.name || ld.name || "Lead",
          email: userDoc?.email || ld.email,
          streams: [],
        };
        if (
          streamId &&
          !existing.streams.some((s) => s.id === streamId)
        ) {
          existing.streams.push({
            id: streamId,
            name: stream.name,
            type: stream.type,
          });
        }
        map.set(id, existing);
      });
    });

    members.forEach((m) => {
      if (m.role?.toLowerCase() === "lead") {
        const id = m.id || m._id || "";
        if (id && !map.has(String(id))) {
          map.set(String(id), {
            id: String(id),
            name: m.name || "Lead",
            email: m.email,
            streams: [],
          });
        }
      }
    });

    return Array.from(map.values());
  }, [workStreams, members, memberById]);

  // Employees list
  const employees = React.useMemo(() => {
    return members.filter((m) => {
      const role = (m.role || "employee").toLowerCase();
      return role === "employee" || role === "employees";
    });
  }, [members]);

  // Team Stats
  const teamStats = React.useMemo<OrganizationTeamStats>(() => {
    const totalMembers = members.length;
    const employeesCount = employees.length;
    const adminsCount = members.filter((m) => {
      const r = m.role?.toLowerCase();
      return r === "admin" || r === "owner";
    }).length;
    const activeMembersCount = members.filter((m) => {
      const status =
        "status" in m && typeof m.status === "string" ? m.status : "active";
      return status.toLowerCase() === "active";
    }).length;

    return {
      totalMembers,
      employeesCount,
      managersCount: managers.length,
      leadsCount: leads.length,
      adminsCount,
      activeMembersCount,
    };
  }, [members, employees.length, managers.length, leads.length]);

  // Task Analytics (computed from single-request getTasksByOrg, including direct tasks)
  const taskStats = React.useMemo<OrganizationHomeTaskStats>(() => {
    let completed = 0;
    let todo = 0;
    let inProgress = 0;
    let inReview = 0;
    let blocked = 0;
    let backlog = 0;
    let urgent = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    tasks.forEach((task) => {
      switch (task.status) {
        case "completed":
          completed += 1;
          break;
        case "in_progress":
          inProgress += 1;
          break;
        case "in_review":
          inReview += 1;
          break;
        case "blocked":
          blocked += 1;
          break;
        case "backlog":
          backlog += 1;
          break;
        case "todo":
        default:
          todo += 1;
          break;
      }

      switch (task.priority) {
        case "urgent":
          urgent += 1;
          break;
        case "high":
          high += 1;
          break;
        case "low":
          low += 1;
          break;
        case "medium":
        default:
          medium += 1;
          break;
      }
    });

    const total = tasks.length;
    const pending = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      directTasks: directTasksCount,
      streamTasks: streamTasksCount,
      todo,
      inProgress,
      inReview,
      blocked,
      backlog,
      completionRate,
      urgent,
      high,
      medium,
      low,
    };
  }, [tasks, directTasksCount, streamTasksCount]);

  // Per-stream task workload for graphs (prefer analytics if loaded, else compute from tasks)
  const streamWorkload = React.useMemo<StreamWorkloadItem[]>(() => {
    if (analytics?.streamWorkload && analytics.streamWorkload.length > 0) {
      return analytics.streamWorkload;
    }

    const statsByStream = new Map<
      string,
      { total: number; completed: number; pending: number }
    >();

    tasks.forEach((t) => {
      const sId = extractId(t.streamId);
      if (!sId) return;
      const entry = statsByStream.get(sId) || {
        total: 0,
        completed: 0,
        pending: 0,
      };
      entry.total += 1;
      if (t.status === "completed") {
        entry.completed += 1;
      } else {
        entry.pending += 1;
      }
      statsByStream.set(sId, entry);
    });

    return workStreams
      .map((s) => {
        const streamId = s._id || s.id || "";
        const st = statsByStream.get(streamId) || {
          total: 0,
          completed: 0,
          pending: 0,
        };
        return {
          streamId,
          name: s.name,
          type: s.type,
          total: st.total,
          completed: st.completed,
          pending: st.pending,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [analytics, workStreams, tasks]);

  const weeklyTrend = React.useMemo(
    () => analytics?.weeklyTrend || [],
    [analytics]
  );

  const resolvedOrgName =
    organization?.organizationName ||
    contextOrgName ||
    currentOrgName ||
    "Organization";

  return {
    organization,
    organizationName: resolvedOrgName,
    streams: workStreams,
    departments,
    projects,
    members,
    employees,
    managers,
    leads,
    tasks,
    taskStats,
    teamStats,
    streamWorkload,
    weeklyTrend,
    isLoading: isStreamsLoading,
    isTasksLoading,
    isAnalyticsLoading,
    error: streamsError || tasksError,
    refetch,
  };
}

export default useOrganizationHome;
