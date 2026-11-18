"use client";

import * as React from "react";
import { Search, Building2, FolderKanban, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface StreamToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddDepartment?: () => void;
  onAddProject?: () => void;
  onAddEmployeeTracker?: () => void;
}

export function StreamToolbar({
  searchTerm,
  onSearchChange,
  onAddDepartment,
  onAddProject,
  onAddEmployeeTracker,
}: StreamToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search streams..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Three Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onAddDepartment}
          className="h-9 gap-1.5 cursor-pointer text-xs"
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Add Department</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAddProject}
          className="h-9 gap-1.5 cursor-pointer text-xs"
        >
          <FolderKanban className="h-3.5 w-3.5" />
          <span>Add Project</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onAddEmployeeTracker}
          className="h-9 gap-1.5 cursor-pointer text-xs"
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Add Employee Tracker</span>
        </Button>
      </div>
    </div>
  );
}

export default StreamToolbar;
