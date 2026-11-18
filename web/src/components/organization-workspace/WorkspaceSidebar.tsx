"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  Users,
  Radio,
  User,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";

export type SidebarNavId =
  | "home"
  | "members"
  | "streams"
  | "profile"
  | "reports"
  | "settings";

interface NavItemDef {
  id: SidebarNavId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItemDef[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "members", label: "Members", icon: Users },
  { id: "streams", label: "Streams", icon: Radio },
  { id: "profile", label: "Profile", icon: User },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

interface WorkspaceSidebarProps {
  orgId: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeItem?: SidebarNavId;
  onSelectItem?: (item: SidebarNavId) => void;
}

export function WorkspaceSidebar({
  orgId,
  isCollapsed,
  onToggleCollapse,
  activeItem,
  onSelectItem,
}: WorkspaceSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearUser } = useUser();

  const currentTab = (searchParams?.get("tab") as SidebarNavId) || activeItem || "home";

  const handleLogout = () => {
    clearUser();
    if (typeof document !== "undefined") {
      document.cookie =
        "token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
    router.push("/auth/signin");
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col justify-between border-r border-border/70 bg-card/50 backdrop-blur-xs transition-all duration-300 select-none shrink-0",
        isCollapsed ? "w-16" : "w-56 sm:w-60"
      )}
    >
      {/* Top Section: Toggle button & Nav Links */}
      <div className="flex flex-col gap-1 p-2 sm:p-3">
        {/* Collapse / Expand Toggle Button */}
        <div
          className={cn(
            "flex items-center mb-2",
            isCollapsed ? "justify-center" : "justify-between px-2"
          )}
        >
          {!isCollapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Workspace Nav
            </span>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            const href =
              item.id === "home"
                ? `/organizations/${orgId}`
                : `/organizations/${orgId}?tab=${item.id}`;

            return (
              <Link
                key={item.id}
                href={href}
                onClick={() => onSelectItem?.(item.id)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer",
                  isCollapsed && "justify-center px-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />

                {!isCollapsed && (
                  <span className="truncate tracking-tight">{item.label}</span>
                )}

                {/* Subtle active indicator pill */}
                {isActive && !isCollapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Logout Button */}
      <div className="border-t border-border/60 p-2 sm:p-3">
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-destructive transition-colors" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default WorkspaceSidebar;
