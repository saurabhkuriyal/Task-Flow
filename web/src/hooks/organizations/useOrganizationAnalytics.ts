"use client";

import * as React from "react";
import {
  organizationService,
  type OrganizationAnalyticsData,
} from "@/services/organization.service";

export interface UseOrganizationAnalyticsOptions {
  orgId: string;
  enabled?: boolean;
}

/**
 * Fetches server-aggregated organization analytics including streams,
 * team role counts, task status/priority breakdowns, stream workload, and 7-day trend.
 */
export function useOrganizationAnalytics({
  orgId,
  enabled = true,
}: UseOrganizationAnalyticsOptions) {
  const [analytics, setAnalytics] =
    React.useState<OrganizationAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(
    Boolean(enabled && orgId)
  );
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState<number>(0);

  React.useEffect(() => {
    if (!enabled || !orgId) return;
    let isCancelled = false;

    organizationService
      .getOrganizationAnalytics(orgId)
      .then((res) => {
        if (isCancelled) return;
        if (res.success && res.analytics) {
          setAnalytics(res.analytics);
          setError(null);
        } else {
          setError(res.message || "Failed to load organization analytics.");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to load organization analytics.";
        setError(msg);
        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [orgId, enabled, refreshKey]);

  const refetch = React.useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    analytics,
    isLoading,
    error,
    refetch,
  };
}

export default useOrganizationAnalytics;
