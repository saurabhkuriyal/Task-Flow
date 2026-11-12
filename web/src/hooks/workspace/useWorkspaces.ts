"use client";

import * as React from "react";
import { organizationService } from "@/services/organization.service";
import { useUser } from "@/context/UserContext";
import type {
  WorkspaceOrganization,
  OrganizationRole,
} from "@/types/workspace";
import type { OrganizationDocumentData } from "@/types/organization";

const GRADIENTS = [
  "from-blue-600 to-indigo-600",
  "from-violet-600 to-fuchsia-600",
  "from-emerald-600 to-teal-600",
  "from-amber-600 to-orange-600",
  "from-rose-600 to-pink-600",
];

function getInitials(name: string): string {
  if (!name) return "OR";
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "OR"
  );
}

function getGradient(name: string, index: number): string {
  const charCodeSum = (name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTS[(charCodeSum + index) % GRADIENTS.length];
}

function mapDocToWorkspaceOrg(
  doc: OrganizationDocumentData,
  idx: number,
  userId: string
): WorkspaceOrganization {
  const id = (doc._id || doc.id || `org-${idx}`) as string;
  const name = doc.organizationName || "Untitled Organization";
  const isOwner = String(doc.ownerId) === String(userId);
  const role: OrganizationRole = isOwner ? "OWNER" : "MEMBER";

  const membersCount =
    doc.teamSize || (Array.isArray(doc.members) ? doc.members.length : 1);
  const projectsCount = Array.isArray(doc.projects) ? doc.projects.length : 0;
  const departmentsCount = Array.isArray(doc.departments)
    ? doc.departments.length
    : 0;

  const dateStr = doc.createdAt
    ? new Date(doc.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return {
    id,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description: `GST: ${doc.gstNo || "N/A"} • Est. ${doc.establishedYear || "N/A"}`,
    role,
    plan: "Pro",
    membersCount,
    projectsCount,
    activeTasksCount: projectsCount * 3, // Realistic task estimation from projects
    gradient: getGradient(name, idx),
    avatarText: getInitials(name),
    updatedAt: `Created ${dateStr}`,
    gstNo: doc.gstNo,
    establishedYear: doc.establishedYear,
    teamSize: doc.teamSize,
    mrr: doc.mrr,
    arr: doc.arr,
    departmentsCount,
    ownerId: String(doc.ownerId),
    isFavorite: false,
  };
}

export function useWorkspaces() {
  const { userId } = useUser();
  const [organizations, setOrganizations] = React.useState<WorkspaceOrganization[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterRole, setFilterRole] = React.useState<"ALL" | OrganizationRole>("ALL");

  // Load organizations whenever userId changes
  React.useEffect(() => {
    let isCancelled = false;

    if (!userId) {
      return;
    }

    const loadData = async () => {
      try {
        const data: OrganizationDocumentData[] =
          await organizationService.getOrganizationsByUserId(userId);

        if (!isCancelled) {
          const mapped = (data || []).map((doc, idx) =>
            mapDocToWorkspaceOrg(doc, idx, userId)
          );
          setOrganizations(mapped);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error("Failed to load organizations for user:", err);
          setOrganizations([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  // Manual refetch helper for explicit triggers
  const refetch = React.useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data: OrganizationDocumentData[] =
        await organizationService.getOrganizationsByUserId(userId);
      const mapped = (data || []).map((doc, idx) =>
        mapDocToWorkspaceOrg(doc, idx, userId)
      );
      setOrganizations(mapped);
    } catch (err) {
      console.error("Failed to refetch organizations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Filter organizations by search text and selected role
  const filteredOrganizations = React.useMemo(() => {
    return organizations.filter((org) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        org.name.toLowerCase().includes(query) ||
        (org.description && org.description.toLowerCase().includes(query)) ||
        (org.slug && org.slug.toLowerCase().includes(query)) ||
        (org.gstNo && org.gstNo.toLowerCase().includes(query));

      const matchesRole =
        filterRole === "ALL" ? true : org.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [organizations, searchQuery, filterRole]);

  // Aggregate stats
  const stats = React.useMemo(() => {
    return {
      totalOrgs: organizations.length,
      totalMembers: organizations.reduce((acc, curr) => acc + curr.membersCount, 0),
      totalTasks: organizations.reduce((acc, curr) => acc + curr.activeTasksCount, 0),
    };
  }, [organizations]);

  const toggleFavorite = (id: string) => {
    setOrganizations((prev) =>
      prev.map((org) =>
        org.id === id ? { ...org, isFavorite: !org.isFavorite } : org
      )
    );
  };

  return {
    organizations,
    filteredOrganizations,
    searchQuery,
    setSearchQuery,
    filterRole,
    setFilterRole,
    toggleFavorite,
    stats,
    isLoading,
    refetch,
  };
}

export default useWorkspaces;
