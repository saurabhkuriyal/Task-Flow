"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { streamService, type StreamItem } from "@/services/stream.service";
import { useUser } from "@/context/UserContext";

export interface UseStreamsOptions {
  organisationId?: string;
}

export function useStreams(options?: UseStreamsOptions) {
  const params = useParams();
  const { organizationId, organizationName } = useUser();

  const currentOrgId =
    options?.organisationId ||
    (params?.orgId as string) ||
    organizationId ||
    "";

  const currentOrgName =
    organizationName ||
    (typeof params?.orgId === "string" ? decodeURIComponent(params.orgId) : "") ||
    "Organization";

  const [streams, setStreams] = React.useState<StreamItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);

  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = React.useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = React.useState(false);
  const [isAddEmployeeTrackerOpen, setIsAddEmployeeTrackerOpen] =
    React.useState(false);

  React.useEffect(() => {
    let isCancelled = false;

    async function fetchStreams() {
      try {
        const res = await streamService.getStreams(currentOrgId);
        if (!isCancelled) {
          if (res.success && Array.isArray(res.streams)) {
            setStreams(res.streams);
          } else {
            setStreams([]);
          }
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg =
            err instanceof Error ? err.message : "Failed to load streams.";
          setError(msg);
          setStreams([]);
          setIsLoading(false);
        }
      }
    }

    fetchStreams();

    return () => {
      isCancelled = true;
    };
  }, [currentOrgId, refreshKey]);

  const refetch = React.useCallback(() => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  const filteredStreams = React.useMemo(() => {
    if (!searchTerm.trim()) return streams;
    const term = searchTerm.toLowerCase();
    return streams.filter((s) => {
      const matchName = s.name?.toLowerCase().includes(term);
      const matchDesc = s.description?.toLowerCase().includes(term);
      const matchLead = s.lead?.some((l) =>
        l.name?.toLowerCase().includes(term)
      );
      const matchCreator = s.creator?.some((c) =>
        c.name?.toLowerCase().includes(term)
      );
      return matchName || matchDesc || matchLead || matchCreator;
    });
  }, [streams, searchTerm]);

  const departments = React.useMemo(
    () => filteredStreams.filter((s) => s.type === "department"),
    [filteredStreams]
  );

  const projects = React.useMemo(
    () => filteredStreams.filter((s) => s.type === "project"),
    [filteredStreams]
  );

  const empTrackers = React.useMemo(
    () => filteredStreams.filter((s) => s.type === "empTracker"),
    [filteredStreams]
  );

  const openAddDepartment = React.useCallback(() => {
    setIsAddDepartmentOpen(true);
  }, []);

  const closeAddDepartment = React.useCallback(() => {
    setIsAddDepartmentOpen(false);
  }, []);

  const openAddProject = React.useCallback(() => {
    setIsAddProjectOpen(true);
  }, []);

  const closeAddProject = React.useCallback(() => {
    setIsAddProjectOpen(false);
  }, []);

  const openAddEmployeeTracker = React.useCallback(() => {
    setIsAddEmployeeTrackerOpen(true);
  }, []);

  const closeAddEmployeeTracker = React.useCallback(() => {
    setIsAddEmployeeTrackerOpen(false);
  }, []);

  return {
    streams,
    filteredStreams,
    departments,
    projects,
    empTrackers,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    refetch,
    currentOrgId,
    currentOrgName,
    isAddDepartmentOpen,
    openAddDepartment,
    closeAddDepartment,
    isAddProjectOpen,
    openAddProject,
    closeAddProject,
    isAddEmployeeTrackerOpen,
    openAddEmployeeTracker,
    closeAddEmployeeTracker,
  };
}

export default useStreams;
