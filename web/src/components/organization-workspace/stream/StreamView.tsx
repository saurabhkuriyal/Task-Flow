"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { StreamToolbar, type StreamDirectoryTab } from "./StreamToolbar";
import { StreamSections } from "./StreamSections";
import { AddDepartmentModal } from "./AddDepartmentModal";
import { AddProjectModal } from "./AddProjectModal";
import { useStreams } from "@/hooks/stream";

export function StreamView() {
  const {
    departments,
    projects,
    filteredMembers,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    refetch,
    currentOrgId,
    currentOrgName,
    isAddDepartmentOpen,
    openAddDepartment,
    closeAddDepartment,
    isAddProjectOpen,
    openAddProject,
    closeAddProject,
  } = useStreams();

  const [activeTab, setActiveTab] = React.useState<StreamDirectoryTab>("all");

  return (
    <div className="py-6 px-4 sm:px-8 max-w-7xl mx-auto space-y-6 pb-16">
      <StreamToolbar
        orgName={currentOrgName}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        departmentsCount={departments.length}
        projectsCount={projects.length}
        membersCount={filteredMembers.length}
        isLoading={isLoading}
        onRefresh={refetch}
        onAddDepartment={openAddDepartment}
        onAddProject={openAddProject}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <StreamSections
        isLoading={isLoading}
        departments={departments}
        projects={projects}
        members={filteredMembers}
        searchTerm={searchTerm}
        activeTab={activeTab}
        orgId={currentOrgId}
        onAddDepartment={openAddDepartment}
        onAddProject={openAddProject}
      />

      <AddDepartmentModal
        isOpen={isAddDepartmentOpen}
        onClose={closeAddDepartment}
        onSuccess={refetch}
        organisationId={currentOrgId}
        organisationName={currentOrgName}
      />

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={closeAddProject}
        onSuccess={refetch}
        organisationId={currentOrgId}
        organisationName={currentOrgName}
      />
    </div>
  );
}

export default StreamView;
