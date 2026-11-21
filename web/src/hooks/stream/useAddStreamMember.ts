"use client";

import * as React from "react";
import { userService } from "@/services/user.service";
import { streamService } from "@/services/stream.service";
import type { User } from "@/types/auth";

export interface UseAddStreamMemberOptions {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  organisationId?: string;
  streamId?: string;
  role?: "member" | "lead" | "manager";
}

export function useAddStreamMember({
  isOpen = false,
  onClose,
  onSuccess,
  organisationId,
  streamId,
  role = "member",
}: UseAddStreamMemberOptions) {
  const [members, setMembers] = React.useState<User[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  // Fetch organization members when modal opens
  React.useEffect(() => {
    if (!isOpen || !organisationId) return;

    let isCancelled = false;

    async function fetchMembers() {
      setIsLoadingMembers(true);
      setError(null);
      try {
        const res = await userService.getUsers(organisationId);
        if (!isCancelled) {
          if (res.success && Array.isArray(res.users)) {
            setMembers(res.users);
          } else {
            setMembers([]);
          }
          setIsLoadingMembers(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to fetch organization members:", err);
          setError("Failed to fetch members.");
          setMembers([]);
          setIsLoadingMembers(false);
        }
      }
    }

    fetchMembers();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, organisationId]);

  // Filter members by search query
  const filteredMembers = React.useMemo(() => {
    if (!searchTerm.trim()) return members;
    const term = searchTerm.toLowerCase();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term) ||
        m.role?.toLowerCase().includes(term)
    );
  }, [members, searchTerm]);

  // Handle assigning member, lead, or manager
  const handleSelectMember = React.useCallback(
    async (member: User) => {
      const memberId = member.id || member._id || "";
      const memberName = member.name || "User";

      setIsSubmitting(true);
      setError(null);

      if (streamId) {
        try {
          if (role === "lead") {
            await streamService.updateStream({
              streamId,
              lead: { id: memberId },
            });
          } else if (role === "manager") {
            await streamService.updateStream({
              streamId,
              manager: { id: memberId },
            });
          } else {
            await streamService.updateStream({
              streamId,
              member: { memberId },
            });
          }
        } catch (err) {
          console.error("Failed to update stream member/role:", err);
          setError(
            err instanceof Error ? err.message : "Failed to update stream."
          );
          setIsSubmitting(false);
          return;
        }
      }

      const roleLabel =
        role === "lead" ? "Lead" : role === "manager" ? "Manager" : "Member";
      setSuccessMessage(`${memberName} assigned as ${roleLabel}!`);
      setIsSuccess(true);
      setIsSubmitting(false);

      setTimeout(() => {
        setIsSuccess(false);
        onSuccess?.();
        onClose?.();
      }, 1000);
    },
    [streamId, role, onSuccess, onClose]
  );

  return {
    members,
    filteredMembers,
    isLoadingMembers,
    searchTerm,
    setSearchTerm,
    isSubmitting,
    isSuccess,
    successMessage,
    error,
    handleSelectMember,
  };
}

export default useAddStreamMember;
