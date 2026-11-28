"use client";

import * as React from "react";
import {
  Search,
  Building2,
  FolderKanban,
  Layers,
  Users,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type StreamDirectoryTab = "all" | "departments" | "projects" | "members";

export interface StreamToolbarProps {
  orgName?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeTab: StreamDirectoryTab;
  onTabChange: (tab: StreamDirectoryTab) => void;
  departmentsCount: number;
  projectsCount: number;
  membersCount: number;
  isLoading?: boolean;
  onRefresh?: () => void;
  onAddDepartment?: () => void;
  onAddProject?: () => void;
}

export function StreamToolbar({
  orgName,
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  departmentsCount,
  projectsCount,
  membersCount,
  isLoading = false,
  onRefresh,
  onAddDepartment,
  onAddProject,
}: StreamToolbarProps) {
  const tabs: {
    value: StreamDirectoryTab;
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      value: "all",
      label: "All",
      count: departmentsCount + projectsCount,
      icon: Layers,
    },
    {
      value: "departments",
      label: "Departments",
      count: departmentsCount,
      icon: Building2,
    },
    {
      value: "projects",
      label: "Projects",
      count: projectsCount,
      icon: FolderKanban,
    },
    {
      value: "members",
      label: "Employee Tasks",
      count: membersCount,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-card to-indigo-500/5 p-5 sm:p-6 shadow-xs">
        <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground shadow-sm">
                <Layers className="h-4.5 w-4.5" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Streams & Teams Directory
              </h1>
              {orgName && (
                <Badge
                  variant="secondary"
                  className="text-[11px] font-medium px-2 py-0.5"
                >
                  {orgName}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Manage departments, active project streams, and jump directly into
              team member task panels.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onRefresh && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="h-9 px-3 text-xs cursor-pointer bg-background/80"
                title="Refresh streams"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 sm:mr-1.5 ${
                    isLoading ? "animate-spin text-primary" : ""
                  }`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={onAddDepartment}
              className="h-9 px-3.5 gap-1.5 cursor-pointer text-xs shadow-xs"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Add Department</span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onAddProject}
              className="h-9 px-3.5 gap-1.5 cursor-pointer text-xs bg-background/80 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
            >
              <FolderKanban className="h-3.5 w-3.5 text-amber-500" />
              <span>Add Project</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Tabs + Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search departments, projects, people..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8.5 pr-8 h-8.5 text-xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default StreamToolbar;
