"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  streamService,
  type StreamItem,
} from "@/services/stream.service";
import { useUser } from "@/context/UserContext";

export interface UseGetStreamsOptions {
  organisationId?: string;
  type?: "department" | "project" | "empTracker";
}

export function useGetStreams(options?: UseGetStreamsOptions) {
  const params = useParams();
  const { organizationId } = useUser();

  const currentOrgId =
    options?.organisationId ||
    (params?.orgId as string) ||
    organizationId ||
    "";

  const streamType = options?.type;

  const [streams, setStreams] = React.useState<StreamItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let isCancelled = false;

    async function fetchStreams() {
      try {
        const res = await streamService.getStreams(currentOrgId, streamType);
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
  }, [currentOrgId, streamType, refreshKey]);

  const refetch = React.useCallback(() => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    streams,
    isLoading,
    error,
    refetch,
    currentOrgId,
  };
}

export default useGetStreams;
