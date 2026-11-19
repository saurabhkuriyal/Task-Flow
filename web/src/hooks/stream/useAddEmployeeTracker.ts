"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  streamService,
  type CreateStreamPayload,
} from "@/services/stream.service";
import { userService } from "@/services/user.service";
import { useUser } from "@/context/UserContext";
import type { User } from "@/types/auth";

export interface UseAddEmployeeTrackerOptions {
  organisationId?: string;
  organisationName?: string;
  creatorId?: string;
  creatorName?: string;
  subStreamId?: string;
  subStreamName?: string;
  substreamId?: string;
  substreamName?: string;
  parentStreamId?: string;
  parentStreamName?: string;
  onSuccess?: () => void;
}

export function useAddEmployeeTracker(options?: UseAddEmployeeTrackerOptions) {
  const params = useParams();
  const { userId, userName, organizationId, organizationName } = useUser();

  const currentOrgId =
    options?.organisationId ||
    (params?.orgId as string) ||
    organizationId ||
    "";

  const currentOrgName =
    options?.organisationName ||
    organizationName ||
    (typeof params?.orgId === "string" ? decodeURIComponent(params.orgId) : "") ||
    "Organization";

  const currentCreatorId = options?.creatorId || userId || "";
  const currentCreatorName = options?.creatorName || userName || "User";

  const [members, setMembers] = React.useState<User[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [searchMember, setSearchMember] = React.useState("");

  // Fetch members of the organization
  React.useEffect(() => {
    let isCancelled = false;

    async function loadMembers() {
      try {
        const res = await userService.getUsers(currentOrgId);
        if (!isCancelled) {
          if (res.success && Array.isArray(res.users)) {
            setMembers(res.users);
          } else {
            setMembers([]);
          }
          setIsLoadingMembers(false);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          console.error("Failed to load members for employee tracker:", err);
          setMembers([]);
          setIsLoadingMembers(false);
        }
      }
    }

    loadMembers();

    return () => {
      isCancelled = true;
    };
  }, [currentOrgId]);

  const filteredMembers = React.useMemo(() => {
    if (!searchMember.trim()) return members;
    const term = searchMember.toLowerCase();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term) ||
        m.role?.toLowerCase().includes(term)
    );
  }, [members, searchMember]);

  const selectMember = React.useCallback(
    async (member: User) => {
      setIsSubmitting(true);
      setServerError(null);
      setIsSuccess(false);

      try {
        const memberId = member.id || member._id || "";
        const memberName = member.name?.trim() || "Employee";

        const payload: CreateStreamPayload = {
          name: memberName,
          description: "",
          leadId: memberId,
          leadName: memberName,
          organisationId: currentOrgId,
          organisationName: currentOrgName,
          creatorId: currentCreatorId,
          creatorName: currentCreatorName,
          subStreamId: options?.subStreamId || options?.substreamId,
          subStreamName: options?.subStreamName || options?.substreamName,
          parentStreamId: options?.parentStreamId,
          parentStreamName: options?.parentStreamName,
          type: "empTracker",
        };

        const response = await streamService.createEmployeeTracker(payload);

        if (response.success) {
          setIsSuccess(true);
          options?.onSuccess?.();
        } else {
          setServerError(
            response.message || "Failed to create employee tracker."
          );
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to create employee tracker.";
        setServerError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      currentOrgId,
      currentOrgName,
      currentCreatorId,
      currentCreatorName,
      options,
    ]
  );

  const reset = React.useCallback(() => {
    setServerError(null);
    setIsSuccess(false);
    setSearchMember("");
  }, []);

  return {
    members,
    filteredMembers,
    searchMember,
    setSearchMember,
    isLoadingMembers,
    isSubmitting,
    serverError,
    isSuccess,
    selectMember,
    reset,
    currentOrgId,
    currentOrgName,
    currentCreatorId,
    currentCreatorName,
  };
}

export default useAddEmployeeTracker;
