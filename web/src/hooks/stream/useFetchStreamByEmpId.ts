"use client";

import * as React from "react";
import {
  streamService,
  type StreamItem,
  type StreamEmployeeInfo,
} from "@/services/stream.service";

export interface UseFetchStreamByEmpIdOptions {
  empId: string;
  organisationId?: string;
  autoFetch?: boolean;
}

export type StreamTypeFilter = "all" | "department" | "project";
export type StreamEmpRoleFilter = "all" | "manager" | "lead";

export function isEmployeeManagerOfStream(
  stream: StreamItem,
  empId: string
): boolean {
  if (!empId || !Array.isArray(stream.manager)) return false;
  return stream.manager.some((m) => String(m.id) === String(empId));
}

export function isEmployeeLeadOfStream(
  stream: StreamItem,
  empId: string
): boolean {
  if (!empId || !Array.isArray(stream.lead)) return false;
  return stream.lead.some((l) => String(l.id) === String(empId));
}

/**
 * Fetches all streams and projects where the employee is assigned as manager or lead.
 */
export function useFetchStreamByEmpId({
  empId,
  organisationId,
  autoFetch = true,
}: UseFetchStreamByEmpIdOptions) {
  const [streams, setStreams] = React.useState<StreamItem[]>([]);
  const [employee, setEmployee] = React.useState<StreamEmployeeInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(
    Boolean(autoFetch && empId)
  );
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [typeFilter, setTypeFilter] = React.useState<StreamTypeFilter>("all");
  const [roleFilter, setRoleFilter] =
    React.useState<StreamEmpRoleFilter>("all");

  const fetchStreams = React.useCallback(
    async (silent = false) => {
      if (!empId) {
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
        const res = await streamService.getStreamsByEmpId(
          empId,
          organisationId
        );
        if (res.success) {
          setStreams(Array.isArray(res.streams) ? res.streams : []);
          setEmployee(res.employee ?? null);
        } else {
          setStreams([]);
          setError(res.message || "Failed to load streams for employee.");
        }
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to load streams for employee.";
        setError(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [empId, organisationId]
  );

  React.useEffect(() => {
    if (!autoFetch || !empId) return;
    let isCancelled = false;

    streamService
      .getStreamsByEmpId(empId, organisationId)
      .then((res) => {
        if (isCancelled) return;
        if (res.success) {
          setStreams(Array.isArray(res.streams) ? res.streams : []);
          setEmployee(res.employee ?? null);
          setError(null);
        } else {
          setStreams([]);
          setError(res.message || "Failed to load streams for employee.");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to load streams for employee.";
        setError(msg);
        setStreams([]);
        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [empId, organisationId, autoFetch]);

  const filteredStreams = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return streams.filter((stream) => {
      if (typeFilter !== "all" && stream.type !== typeFilter) {
        return false;
      }

      if (roleFilter === "manager" && !isEmployeeManagerOfStream(stream, empId)) {
        return false;
      }

      if (roleFilter === "lead" && !isEmployeeLeadOfStream(stream, empId)) {
        return false;
      }

      if (!term) return true;

      const matchName = stream.name?.toLowerCase().includes(term);
      const matchDesc = stream.description?.toLowerCase().includes(term);
      const matchManager = stream.manager?.some((m) =>
        m.name?.toLowerCase().includes(term)
      );
      const matchLead = stream.lead?.some((l) =>
        l.name?.toLowerCase().includes(term)
      );

      return Boolean(matchName || matchDesc || matchManager || matchLead);
    });
  }, [streams, searchTerm, typeFilter, roleFilter, empId]);

  const departments = React.useMemo(
    () => filteredStreams.filter((s) => s.type === "department"),
    [filteredStreams]
  );

  const projects = React.useMemo(
    () => filteredStreams.filter((s) => s.type === "project"),
    [filteredStreams]
  );

  const stats = React.useMemo(() => {
    const total = streams.length;
    const departmentCount = streams.filter((s) => s.type === "department").length;
    const projectCount = streams.filter((s) => s.type === "project").length;
    const managerCount = streams.filter((s) =>
      isEmployeeManagerOfStream(s, empId)
    ).length;
    const leadCount = streams.filter((s) =>
      isEmployeeLeadOfStream(s, empId)
    ).length;

    return {
      total,
      departmentCount,
      projectCount,
      managerCount,
      leadCount,
    };
  }, [streams, empId]);

  return {
    streams,
    filteredStreams,
    departments,
    projects,
    employee,
    stats,
    isLoading,
    isRefreshing,
    error,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    roleFilter,
    setRoleFilter,
    refetch: () => fetchStreams(true),
    reload: () => fetchStreams(false),
  };
}

export const useferchStreamByEmpId = useFetchStreamByEmpId;
export default useFetchStreamByEmpId;
