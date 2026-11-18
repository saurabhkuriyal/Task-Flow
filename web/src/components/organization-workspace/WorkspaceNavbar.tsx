"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCheck, Building2, LogOut, User as UserIcon } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface WorkspaceNavbarProps {
  organizationName: string;
}

export function WorkspaceNavbar({ organizationName }: WorkspaceNavbarProps) {
  const router = useRouter();
  const { userName, clearUser } = useUser();

  const handleLogout = () => {
    // Clear user state from context & localStorage
    clearUser();

    // Expire auth cookie
    if (typeof document !== "undefined") {
      document.cookie = "token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }

    // Redirect to signin
    router.push("/auth/signin");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur-md select-none">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Product Name & Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/workspaces"
            aria-label="TaskFlow Workspaces"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background shadow-xs transition-transform duration-200 group-hover:scale-105">
              <CheckCheck className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-foreground">
                TaskFlow
              </span>
              <span className="hidden sm:inline-block rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Name of the Company */}
        <div className="flex items-center gap-2 max-w-[200px] sm:max-w-md truncate px-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
            <Building2 className="h-4 w-4" />
          </div>
          <span
            className="text-sm sm:text-base font-bold text-foreground truncate tracking-tight"
            title={organizationName}
          >
            {organizationName}
          </span>
        </div>

        {/* Right: Logged-in User & Log Out Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Profile Badge */}
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <div className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5 text-muted-foreground hidden xs:inline-block" />
              <span className="font-semibold text-foreground max-w-[90px] sm:max-w-[130px] truncate">
                {userName || "User"}
              </span>
            </div>
          </div>

          {/* Log Out Button */}
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10 transition-colors cursor-pointer"
            )}
            title="Log Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default WorkspaceNavbar;
