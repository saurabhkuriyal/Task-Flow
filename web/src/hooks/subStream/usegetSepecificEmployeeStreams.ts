"use client";

import * as React from "react";
import {
  streamService,
  type StreamItem,
} from "@/services/stream.service";

export interface UseGetSpecificEmployeeStreamsOptions {
  streamId?: string;
  organisationId?: string;
  enabled?: boolean;
}

export function useGetSpecificEmployeeStreams({
  streamId,
  organisationId,
  enabled = true,
}: UseGetSpecificEmployeeStreamsOptions) {
  const [employeeStreams, setEmployeeStreams] = React.useState<StreamItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(Boolean(enabled && streamId));
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    if (!enabled || !streamId) {
      return;
    }

    let isCancelled = false;

    async function fetchEmployeeStreams() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await streamService.getSpecificEmployeeStreams(
          streamId!,
          organisationId
        );

        if (!isCancelled) {
          if (res.success && Array.isArray(res.streams)) {
            setEmployeeStreams(res.streams);
          } else {
            setEmployeeStreams([]);
            if (res.message) setError(res.message);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load employee tracker streams."
          );
          setEmployeeStreams([]);
          setIsLoading(false);
        }
      }
    }

    fetchEmployeeStreams();

    return () => {
      isCancelled = true;
    };
  }, [streamId, organisationId, enabled, refreshKey]);

  const refetch = React.useCallback(() => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  const filteredStreams = React.useMemo(() => {
    if (!searchTerm.trim()) return employeeStreams;
    const term = searchTerm.toLowerCase();
    return employeeStreams.filter((s) => {
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
  }, [employeeStreams, searchTerm]);

  return {
    employeeStreams,
    filteredStreams,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    refetch,
  };
}

// Named alias matching user specification
export const usegetSepecificEmployeeStreams = useGetSpecificEmployeeStreams;
export default useGetSpecificEmployeeStreams;
