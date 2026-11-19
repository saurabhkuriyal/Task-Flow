"use client";

import * as React from "react";
import { StreamToolbar } from "./StreamToolbar";
import { StreamSections } from "./StreamSections";
import { AddDepartmentModal } from "./AddDepartmentModal";
import { AddProjectModal } from "./AddProjectModal";
import { AddEmployeeTrackerModal } from "./AddEmployeeTrackerModal";
import { useStreams } from "@/hooks/stream";

export function StreamView() {
  const {
    searchTerm,
    setSearchTerm,
    isLoading,
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

      <StreamSections isLoading={isLoading} />

      <AddDepartmentModal
        isOpen={isAddDepartmentOpen}
        onClose={closeAddDepartment}
      />

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={closeAddProject}
      />

      <AddEmployeeTrackerModal
        isOpen={isAddEmployeeTrackerOpen}
        onClose={closeAddEmployeeTracker}
      />
    </div>
  );
}

export default StreamView;
