"use client";

import * as React from "react";
import { StreamToolbar } from "./StreamToolbar";
import { StreamSections } from "./StreamSections";
import { useStreams } from "@/hooks/stream";

export function StreamView() {
  const {
    searchTerm,
    setSearchTerm,
    isLoading,
    handleAddDepartment,
    handleAddProject,
    handleAddEmployeeTracker,
  } = useStreams();

  return (
    <div className="py-6 px-4 sm:px-8 max-w-6xl mx-auto space-y-6">
      <StreamToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddDepartment={handleAddDepartment}
        onAddProject={handleAddProject}
        onAddEmployeeTracker={handleAddEmployeeTracker}
      />

      <StreamSections isLoading={isLoading} />
    </div>
  );
}

export default StreamView;
