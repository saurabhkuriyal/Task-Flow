"use client";

import * as React from "react";

export function useStreams() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading] = React.useState(true);
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = React.useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = React.useState(false);
  const [isAddEmployeeTrackerOpen, setIsAddEmployeeTrackerOpen] =
    React.useState(false);

  const openAddDepartment = React.useCallback(() => {
    setIsAddDepartmentOpen(true);
  }, []);

  const closeAddDepartment = React.useCallback(() => {
    setIsAddDepartmentOpen(false);
  }, []);

  const openAddProject = React.useCallback(() => {
    setIsAddProjectOpen(true);
  }, []);

  const closeAddProject = React.useCallback(() => {
    setIsAddProjectOpen(false);
  }, []);

  const openAddEmployeeTracker = React.useCallback(() => {
    setIsAddEmployeeTrackerOpen(true);
  }, []);

  const closeAddEmployeeTracker = React.useCallback(() => {
    setIsAddEmployeeTrackerOpen(false);
  }, []);

  return {
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
  };
}

export default useStreams;
