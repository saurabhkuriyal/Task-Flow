"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { StreamToolbar } from "./StreamToolbar";
import { StreamSections } from "./StreamSections";
import { AddDepartmentModal } from "./AddDepartmentModal";
import { AddProjectModal } from "./AddProjectModal";
import { AddEmployeeTrackerModal } from "./AddEmployeeTrackerModal";
import { useStreams } from "@/hooks/stream";

export function StreamView() {
  const {
    departments,
    projects,
    empTrackers,
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
    isAddEmployeeTrackerOpen,
    openAddEmployeeTracker,
    closeAddEmployeeTracker,
  } = useStreams();

  return (
    <div className="py-6 px-4 sm:px-8 max-w-6xl mx-auto space-y-6">
      <StreamToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddDepartment={openAddDepartment}
        onAddProject={openAddProject}
        onAddEmployeeTracker={openAddEmployeeTracker}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <StreamSections
        isLoading={isLoading}
        departments={departments}
        projects={projects}
        empTrackers={empTrackers}
        searchTerm={searchTerm}
        orgId={currentOrgId}
        onAddDepartment={openAddDepartment}
        onAddProject={openAddProject}
        onAddEmployeeTracker={openAddEmployeeTracker}
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

      <AddEmployeeTrackerModal
        isOpen={isAddEmployeeTrackerOpen}
        onClose={closeAddEmployeeTracker}
        onSuccess={refetch}
        organisationId={currentOrgId}
        organisationName={currentOrgName}
      />
    </div>
  );
}

export default StreamView;
