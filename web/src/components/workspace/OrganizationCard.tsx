"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Layers, ArrowUpRight, Star, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WorkspaceOrganization } from "@/types/workspace";

interface OrganizationCardProps {
  organization: WorkspaceOrganization;
  onToggleFavorite: (id: string) => void;
}

export function OrganizationCard({
  organization,
  onToggleFavorite,
}: OrganizationCardProps) {
  const {
    id,
    name,
    slug,
    description,
    role,
    plan,
    membersCount,
    projectsCount,
    activeTasksCount,
    gradient,
    avatarText,
    updatedAt,
    isFavorite,
  } = organization;

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border-border/70 bg-card/85 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl backdrop-blur-xs">
      {/* Top subtle highlight line matching org gradient */}
      <div className={cn("h-1 w-full bg-gradient-to-r", gradient)} />

      <CardContent className="flex flex-col justify-between h-full p-4 sm:p-5 space-y-3.5 sm:space-y-4">
        {/* Top Header: Avatar, Name & Favorite */}
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={cn(
                  "flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-md bg-gradient-to-br text-xs sm:text-sm",
                  gradient
                )}
              >
                {avatarText}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm sm:text-base text-foreground truncate group-hover:text-primary transition-colors">
                  {name}
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate font-mono">
                  @{slug}
                </p>
              </div>
            </div>

            {/* Favorite button with touch-friendly hit-box */}
            <button
              type="button"
              onClick={() => onToggleFavorite(id)}
              className="text-muted-foreground hover:text-amber-500 transition-colors cursor-pointer p-2 -mr-1 -mt-1 shrink-0 rounded-lg touch-manipulation"
              aria-label={isFavorite ? "Unfavorite" : "Favorite"}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground/60"
                )}
              />
            </button>
          </div>

          {/* Description */}
          <p className="mt-2.5 sm:mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        {/* Badges & Meta */}
        <div className="space-y-2.5 sm:space-y-3 pt-1 border-t border-border/50">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5",
                  role === "OWNER" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                  role === "ADMIN" && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                  role === "MEMBER" && "bg-muted text-muted-foreground"
                )}
              >
                {role}
              </Badge>

              <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
                {plan}
              </Badge>
            </div>

            <span className="text-[10px] sm:text-[11px] text-muted-foreground/80 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
              <span>{updatedAt}</span>
            </span>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 rounded-lg bg-muted/40 p-2 text-center text-xs">
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px] sm:text-[11px]">
                <Users className="h-3 w-3 shrink-0" />
                <span>Members</span>
              </div>
              <span className="font-semibold text-foreground text-xs sm:text-sm">{membersCount}</span>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px] sm:text-[11px]">
                <Layers className="h-3 w-3 shrink-0" />
                <span>Projects</span>
              </div>
              <span className="font-semibold text-foreground text-xs sm:text-sm">{projectsCount}</span>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-[10px] sm:text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Tasks</span>
              </div>
              <span className="font-semibold text-foreground text-xs sm:text-sm">{activeTasksCount}</span>
            </div>
          </div>

          {/* Enter Workspace Button */}
          <Link
            href={`/organizations/${id}`}
            className="flex items-center justify-between w-full rounded-lg bg-secondary/60 hover:bg-primary hover:text-primary-foreground px-3 py-2.5 sm:py-2 text-xs font-semibold text-foreground transition-all duration-200 group/link touch-manipulation min-h-[38px] sm:min-h-[36px]"
          >
            <span>Enter Workspace</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default OrganizationCard;
