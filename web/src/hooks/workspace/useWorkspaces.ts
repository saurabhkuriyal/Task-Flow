"use client";

import * as React from "react";
import type {
  WorkspaceOrganization,
  OrganizationRole,
} from "@/types/workspace";

const INITIAL_ORGANIZATIONS: WorkspaceOrganization[] = [
  {
    id: "org-1",
    name: "Acme Product Engineering",
    slug: "acme-engineering",
    description: "Core cloud infrastructure, unified microservices, and design systems for enterprise scale.",
    role: "OWNER",
    plan: "Enterprise",
    membersCount: 32,
    projectsCount: 8,
    activeTasksCount: 46,
    gradient: "from-blue-600 to-indigo-600",
    avatarText: "AP",
    updatedAt: "Active 5m ago",
    isFavorite: true,
  },
  {
    id: "org-2",
    name: "Nova AI Labs",
    slug: "nova-ai-labs",
    description: "Agentic workflow automation, LLM telemetry evaluations, and autonomous coding task engines.",
    role: "OWNER",
    plan: "Pro",
    membersCount: 14,
    projectsCount: 5,
    activeTasksCount: 28,
    gradient: "from-violet-600 to-fuchsia-600",
    avatarText: "NL",
    updatedAt: "Active 18m ago",
    isFavorite: true,
  },
  {
    id: "org-3",
    name: "Pulse Mobile & Design",
    slug: "pulse-design",
    description: "Next-gen iOS and Android design sprints, design tokens, and user experience telemetry.",
    role: "ADMIN",
    plan: "Growth",
    membersCount: 19,
    projectsCount: 4,
    activeTasksCount: 17,
    gradient: "from-emerald-600 to-teal-600",
    avatarText: "PM",
    updatedAt: "Active 2h ago",
  },
  {
    id: "org-4",
    name: "HyperScale DevOps",
    slug: "hyperscale-devops",
    description: "Distributed Kubernetes clusters, GitOps continuous pipelines, and security observability.",
    role: "MEMBER",
    plan: "Enterprise",
    membersCount: 45,
    projectsCount: 12,
    activeTasksCount: 63,
    gradient: "from-amber-600 to-orange-600",
    avatarText: "HS",
    updatedAt: "Active 1d ago",
  },
];

export function useWorkspaces() {
  const [organizations, setOrganizations] = React.useState<WorkspaceOrganization[]>(INITIAL_ORGANIZATIONS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterRole, setFilterRole] = React.useState<"ALL" | OrganizationRole>("ALL");

  // Filter organizations by search text and selected role
  const filteredOrganizations = React.useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch =
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.slug.toLowerCase().includes(searchQuery.toLowerCase());

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
  };
}

export default useWorkspaces;
