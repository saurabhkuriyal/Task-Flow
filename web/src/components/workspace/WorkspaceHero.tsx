"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Building2, Users, Layers, Sparkles, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface WorkspaceHeroProps {
  onCreateClick?: () => void;
  totalOrgs: number;
  totalMembers: number;
  totalTasks: number;
}

export function WorkspaceHero({
  onCreateClick,
  totalOrgs,
  totalMembers,
  totalTasks,
}: WorkspaceHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-card/90 to-card/50 p-4 sm:p-6 lg:p-10 shadow-lg backdrop-blur-sm">
      {/* Ambient background light spheres */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 -z-10 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-primary/10 blur-3xl opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-12 -z-10 h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-violet-500/10 blur-3xl opacity-60"
      />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
        {/* Left Column: Heading & Call to Action */}
        <div className="w-full max-w-2xl space-y-3 sm:space-y-4">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] sm:text-xs font-medium border-primary/30 bg-primary/5 text-primary"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>Multi-Tenant Workspaces</span>
          </Badge>

          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">
            Organizations &{" "}
            <span className="bg-gradient-to-r from-primary via-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Workspaces
            </span>
          </h1>

          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
            Create, manage, and collaborate across enterprise organizations.
            Seamlessly switch teams, track sprint velocity, and run autonomous tasks in one unified hub.
          </p>

          {/* Action buttons responsive: full-width stack on mobile, inline on tablet+ */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 pt-2">
            <Link
              href={ROUTES.ORGANIZATIONS_CREATE}
              onClick={onCreateClick}
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full sm:w-auto h-11 sm:h-10 gap-2 font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all cursor-pointer justify-center text-sm"
              )}
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Create Organization</span>
            </Link>

            <a
              href="#org-list"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/40"
            >
              <span>Explore Organizations</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Right Column: Quick Stats Cards (responsive 3-column grid scaled for mobile) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full lg:w-96">
          <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/60 p-2.5 sm:p-4 shadow-xs backdrop-blur-sm">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-1.5 sm:mb-2">
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">{totalOrgs}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium leading-tight">Organizations</p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/60 p-2.5 sm:p-4 shadow-xs backdrop-blur-sm">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mb-1.5 sm:mb-2">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">{totalMembers}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium leading-tight">Members</p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-background/60 p-2.5 sm:p-4 shadow-xs backdrop-blur-sm">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 mb-1.5 sm:mb-2">
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">{totalTasks}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium leading-tight">Active Tasks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceHero;
