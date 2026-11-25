"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { streamService, type StreamItem } from "@/services/stream.service";
import { userService } from "@/services/user.service";
import type { User } from "@/types/auth";
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
  const [members, setMembers] = React.useState<User[]>([]);
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

    async function fetchData() {
      try {
        const [streamsRes, usersRes] = await Promise.all([
          streamService.getStreams(currentOrgId),
          currentOrgId
            ? userService.getUsers(currentOrgId).catch(() => ({ success: false, users: [] }))
            : Promise.resolve({ success: false, users: [] }),
        ]);

        if (!isCancelled) {
          if (streamsRes.success && Array.isArray(streamsRes.streams)) {
            setStreams(streamsRes.streams);
          } else {
            setStreams([]);
          }

          if (usersRes.success && Array.isArray(usersRes.users)) {
            setMembers(usersRes.users);
          } else {
            setMembers([]);
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
          setMembers([]);
          setIsLoading(false);
        }
      }
    }

    fetchData();

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

  const filteredMembers = React.useMemo(() => {
    if (!searchTerm.trim()) return members;
    const term = searchTerm.toLowerCase();
    return members.filter((m) => {
      const matchName = m.name?.toLowerCase().includes(term);
      const matchEmail = m.email?.toLowerCase().includes(term);
      const matchRole = m.role?.toLowerCase().includes(term);
      const userId = m.id || m._id || "";
      const matchId = userId.toLowerCase().includes(term);
      return matchName || matchEmail || matchRole || matchId;
    });
  }, [members, searchTerm]);

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
    members,
    filteredMembers,
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
