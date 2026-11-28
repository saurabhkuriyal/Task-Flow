"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  X,
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
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  activeItem?: SidebarNavId;
  onSelectItem?: (item: SidebarNavId) => void;
}

export function WorkspaceSidebar({
  orgId,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
  activeItem,
  onSelectItem,
}: WorkspaceSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { clearUser } = useUser();

  const currentTab = (searchParams?.get("tab") as SidebarNavId) || activeItem;

  // Close mobile drawer on Escape key
  React.useEffect(() => {
    if (!isMobileOpen || !onCloseMobile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseMobile();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const handleLogout = () => {
    onCloseMobile?.();
    clearUser();
    if (typeof document !== "undefined") {
      document.cookie =
        "token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
    router.push("/auth/signin");
  };

  const renderNavAndFooter = (collapsed: boolean, isMobileDrawer: boolean) => (
    <>
      {/* Top Section: Toggle/Close button & Nav Links */}
      <div className="flex flex-col gap-1 p-3">
        <div
          className={cn(
            "flex items-center mb-2",
            collapsed ? "justify-center" : "justify-between px-2"
          )}
        >
          {!collapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Workspace Nav
            </span>
          )}

          {isMobileDrawer ? (
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close workspace menu"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            const isCurrentPath =
              item.id === "home"
                ? pathname === `/organizations/${orgId}` ||
                  pathname === `/organizations/${orgId}/`
                : pathname === `/organizations/${orgId}/${item.id}` ||
                  pathname.startsWith(`/organizations/${orgId}/${item.id}/`);

            const isActive = currentTab
              ? currentTab === item.id
              : isCurrentPath;

            const href =
              item.id === "home"
                ? `/organizations/${orgId}`
                : item.id === "members"
                ? `/organizations/${orgId}/members`
                : item.id === "streams"
                ? `/organizations/${orgId}/streams`
                : `/organizations/${orgId}?tab=${item.id}`;

            return (
              <Link
                key={item.id}
                href={href}
                onClick={() => {
                  onSelectItem?.(item.id);
                  if (isMobileDrawer) onCloseMobile?.();
                }}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />

                {!collapsed && (
                  <span className="truncate tracking-tight">{item.label}</span>
                )}

                {isActive && !collapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Logout Button */}
      <div className="border-t border-border/60 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-destructive transition-colors" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (hidden on mobile) */}
      <aside
        className={cn(
          "hidden md:flex relative flex-col justify-between border-r border-border/70 bg-card/50 backdrop-blur-xs transition-all duration-300 select-none shrink-0",
          isCollapsed ? "w-16" : "w-56 lg:w-60"
        )}
      >
        {renderNavAndFooter(isCollapsed, false)}
      </aside>

      {/* Mobile Overlay Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Slide-over Sidebar Panel */}
          <aside
            className="relative z-10 flex h-full w-64 max-w-[80vw] flex-col justify-between border-r border-border/80 bg-card shadow-2xl select-none animate-in slide-in-from-left duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Workspace navigation"
          >
            {renderNavAndFooter(false, true)}
          </aside>
        </div>
      )}
    </>
  );
}

export default WorkspaceSidebar;
