"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { userService } from "@/services/user.service";
import { useUser } from "@/context/UserContext";
import type { User } from "@/types/auth";

export function useMembers(orgIdOverride?: string) {
  const params = useParams();
  const { organizationId } = useUser();

  const currentOrgId =
    orgIdOverride ||
    (params?.orgId as string) ||
    organizationId ||
    "";

  const [members, setMembers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let isCancelled = false;

    async function fetchUsers() {
      try {
        const res = await userService.getUsers(currentOrgId);
        if (!isCancelled) {
          if (res.success && Array.isArray(res.users)) {
            setMembers(res.users);
          } else {
            setMembers([]);
          }
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = err instanceof Error ? err.message : "Failed to load members";
          setError(msg);
          setMembers([]);
          setIsLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      isCancelled = true;
    };
  }, [currentOrgId, refreshKey]);

  const refetch = React.useCallback(() => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

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

  const openAddModal = React.useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const closeAddModal = React.useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  return {
    members,
    filteredMembers,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    isAddModalOpen,
    openAddModal,
    closeAddModal,
    refetch,
    currentOrgId,
  };
}

export default useMembers;
