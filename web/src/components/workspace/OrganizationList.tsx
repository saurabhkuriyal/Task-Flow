"use client";

import * as React from "react";
import { Search, Building2, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrganizationCard } from "./OrganizationCard";
import type { WorkspaceOrganization, OrganizationRole } from "@/types/workspace";
import { cn } from "@/lib/utils";

interface OrganizationListProps {
  organizations: WorkspaceOrganization[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterRole: "ALL" | OrganizationRole;
  onFilterChange: (role: "ALL" | OrganizationRole) => void;
  onToggleFavorite: (id: string) => void;
  onCreateClick: () => void;
}

export function OrganizationList({
  organizations,
  searchQuery,
  onSearchChange,
  filterRole,
  onFilterChange,
  onToggleFavorite,
  onCreateClick,
}: OrganizationListProps) {
  const roleFilters: { label: string; value: "ALL" | OrganizationRole }[] = [
    { label: "All", value: "ALL" },
    { label: "Owner", value: "OWNER" },
    { label: "Admin", value: "ADMIN" },
    { label: "Member", value: "MEMBER" },
  ];

  return (
    <section id="org-list" className="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 pl-9 pr-8 text-sm rounded-xl border-border/80 bg-background/50 focus:bg-background w-full"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills with touch-friendly horizontal swipe */}
        <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1 sm:mx-0 sm:px-0">
          <div className="inline-flex min-w-full sm:min-w-0 items-center gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-xs">
            {roleFilters.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => onFilterChange(tab.value)}
                className={cn(
                  "flex-1 sm:flex-initial text-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap touch-manipulation",
                  filterRole === tab.value
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid or Empty State */}
      {organizations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <OrganizationCard
              key={org.id}
              organization={org}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 p-6 sm:p-12 text-center">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3 sm:mb-4">
            <Building2 className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-foreground">No organizations found</h3>
          <p className="mt-1 max-w-sm text-xs sm:text-sm text-muted-foreground">
            {searchQuery
              ? `No organizations match "${searchQuery}". Try adjusting your keywords or clearing the filter.`
              : "You do not belong to any organizations under this category yet."}
          </p>

          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSearchChange("")}
                className="w-full sm:w-auto cursor-pointer text-xs"
              >
                Clear Search
              </Button>
            )}
            <Button
              size="sm"
              onClick={onCreateClick}
              className="w-full sm:w-auto gap-1.5 cursor-pointer text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Create Organization</span>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

export default OrganizationList;
