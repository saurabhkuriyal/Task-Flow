"use client";

import * as React from "react";
import { useWorkspaces } from "@/hooks/workspace";
import { WorkspaceHero } from "./WorkspaceHero";
import { OrganizationList } from "./OrganizationList";
import { CreateOrganizationModal } from "./CreateOrganizationModal";

export function WorkspaceView() {
  const {
    filteredOrganizations,
    searchQuery,
    setSearchQuery,
    filterRole,
    setFilterRole,
    isCreateModalOpen,
    setIsCreateModalOpen,
    handleCreateOrganization,
    toggleFavorite,
    stats,
  } = useWorkspaces();

  return (
    <div className="min-h-full w-full py-4 sm:py-8 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-10">
      {/* Hero Section with Create Organization Button & Key Highlights */}
      <WorkspaceHero
        onCreateClick={() => setIsCreateModalOpen(true)}
        totalOrgs={stats.totalOrgs}
        totalMembers={stats.totalMembers}
        totalTasks={stats.totalTasks}
      />

      {/* Organizations Directory & Filtering */}
      <div className="space-y-2">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
            Your Organizations
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Select an organization to enter its sprint boards, task graphs, and team settings.
          </p>
        </div>

        <OrganizationList
          organizations={filteredOrganizations}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterRole={filterRole}
          onFilterChange={setFilterRole}
          onToggleFavorite={toggleFavorite}
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
      </div>

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOrganization}
      />
    </div>
  );
}

export default WorkspaceView;
