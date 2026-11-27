"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { streamService, type StreamItem } from "@/services/stream.service";
import { useUser } from "@/context/UserContext";

export interface TaskItem {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "completed" | "backlog";
  priority?: "low" | "medium" | "high" | "urgent";
  assigneeName?: string;
  dueDate?: string;
  createdAt?: string;
}

export interface UseStreamDetailOptions {
  streamId?: string;
  organisationId?: string;
}

export function useStreamDetail(options?: UseStreamDetailOptions) {
  const params = useParams();
  const { organizationId, organizationName } = useUser();

  const currentOrgId =
    options?.organisationId ||
    (params?.orgId as string) ||
    organizationId ||
    "";

  const streamId =
    options?.streamId ||
    (params?.streamId as string) ||
    (params?.id as string) ||
    "";

  const currentOrgName =
    organizationName ||
    (typeof params?.orgId === "string" ? decodeURIComponent(params.orgId) : "") ||
    "Organization";

  const [stream, setStream] = React.useState<StreamItem | null>(null);
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Modal states
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = React.useState(false);
  const [isAddManagerOpen, setIsAddManagerOpen] = React.useState(false);
  const [isAddSubDepartmentOpen, setIsAddSubDepartmentOpen] =
    React.useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = React.useState(false);
  const [isAddEmployeeTrackerOpen, setIsAddEmployeeTrackerOpen] =
    React.useState(false);

  React.useEffect(() => {
    let isCancelled = false;

    async function fetchStreamDetail() {
      if (!streamId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await streamService.getStreamById(streamId);
        if (!isCancelled) {
          if (res.success && (res.stream || (Array.isArray(res.streams) && res.streams[0]))) {
            const foundStream = res.stream || res.streams[0];
            setStream(foundStream);
            setTasks([]);
          } else {
            setError(res.message || "Stream not found.");
            setStream(null);
          }
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg =
            err instanceof Error ? err.message : "Failed to load stream details.";
          setError(msg);
          setStream(null);
          setIsLoading(false);
        }
      }
    }

    fetchStreamDetail();

    return () => {
      isCancelled = true;
    };
  }, [streamId, refreshKey]);

  const refetch = React.useCallback(() => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  const openAddMember = React.useCallback(() => {
    setIsAddMemberOpen(true);
  }, []);

  const closeAddMember = React.useCallback(() => {
    setIsAddMemberOpen(false);
  }, []);

  const openAddLead = React.useCallback(() => {
    setIsAddLeadOpen(true);
  }, []);

  const closeAddLead = React.useCallback(() => {
    setIsAddLeadOpen(false);
  }, []);

  const openAddManager = React.useCallback(() => {
    setIsAddManagerOpen(true);
  }, []);

  const closeAddManager = React.useCallback(() => {
    setIsAddManagerOpen(false);
  }, []);

  const openAddSubDepartment = React.useCallback(() => {
    setIsAddSubDepartmentOpen(true);
  }, []);

  const closeAddSubDepartment = React.useCallback(() => {
    setIsAddSubDepartmentOpen(false);
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
    stream,
    tasks,
    isLoading,
    error,
    currentOrgId,
    currentOrgName,
    streamId,
    refetch,
    isAddMemberOpen,
    openAddMember,
    closeAddMember,
    isAddLeadOpen,
    openAddLead,
    closeAddLead,
    isAddManagerOpen,
    openAddManager,
    closeAddManager,
    isAddSubDepartmentOpen,
    openAddSubDepartment,
    closeAddSubDepartment,
    isAddProjectOpen,
    openAddProject,
    closeAddProject,
    isAddEmployeeTrackerOpen,
    openAddEmployeeTracker,
    closeAddEmployeeTracker,
  };
}

export default useStreamDetail;
