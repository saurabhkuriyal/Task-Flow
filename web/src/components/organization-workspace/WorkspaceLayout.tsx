"use client";

import * as React from "react";
import { WorkspaceNavbar } from "./WorkspaceNavbar";
import { WorkspaceSidebar } from "./WorkspaceSidebar";

interface WorkspaceLayoutProps {
  organizationName: string;
  orgId: string;
  children: React.ReactNode;
}

export function WorkspaceLayout({
  organizationName,
  orgId,
  children,
}: WorkspaceLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* 1. Header is mounted once in layout */}
      <WorkspaceNavbar organizationName={organizationName} />

      {/* 2. Body with persistent sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <WorkspaceSidebar
          orgId={orgId}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* 3. Nested page content is rendered here */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default WorkspaceLayout;
