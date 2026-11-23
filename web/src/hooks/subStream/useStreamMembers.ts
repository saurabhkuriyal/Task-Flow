"use client";

import * as React from "react";
import {
  streamService,
  type StreamMemberDetail,
  type StreamLeadItem,
  type StreamManagerItem,
} from "@/services/stream.service";

export interface UseStreamMembersOptions {
  streamId?: string;
  organisationId?: string;
  enabled?: boolean;
}

export function useStreamMembers({
  streamId,
  organisationId,
  enabled = true,
}: UseStreamMembersOptions) {
  const [members, setMembers] = React.useState<StreamMemberDetail[]>([]);
  const [lead, setLead] = React.useState<StreamLeadItem[]>([]);
  const [manager, setManager] = React.useState<StreamManagerItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(Boolean(enabled && streamId));
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    if (!enabled || !streamId) {
      return;
    }

    let isCancelled = false;

    async function fetchStreamMembers() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await streamService.getStreamMembers(
          streamId!,
          organisationId
        );

        if (!isCancelled) {
          if (res.success && Array.isArray(res.members)) {
            setMembers(res.members);
            setLead(res.lead || []);
            setManager(res.manager || []);
          } else {
            setMembers([]);
            setError(res.message || "No members found.");
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load stream members."
          );
          setMembers([]);
          setIsLoading(false);
        }
      }
    }

    fetchStreamMembers();

    return () => {
      isCancelled = true;
    };
  }, [streamId, organisationId, enabled, refreshKey]);

  const refetch = React.useCallback(() => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  const filteredMembers = React.useMemo(() => {
    if (!searchTerm.trim()) return members;
    const term = searchTerm.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.role?.toLowerCase().includes(term)
    );
  }, [members, searchTerm]);

  return {
    members,
    filteredMembers,
    lead,
    manager,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    refetch,
  };
}

export default useStreamMembers;
