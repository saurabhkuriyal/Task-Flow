import React from "react";
import { HeroSection } from "./hero";
import { OrganizationHomeView } from "./OrganizationHomeView";
import { OrganizationInfoBanner } from "./OrganizationInfoBanner";
import {
  OrgTaskStatusChart,
  OrgPriorityChart,
  OrgStreamWorkloadChart,
  OrgTeamStructureChart,
  OrgWeeklyTrendChart,
} from "./OrganizationCharts";

export {
  HeroSection,
  OrganizationHomeView,
  OrganizationInfoBanner,
  OrgTaskStatusChart,
  OrgPriorityChart,
  OrgStreamWorkloadChart,
  OrgTeamStructureChart,
  OrgWeeklyTrendChart,
};

export function HomeView() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
      <HeroSection />
    </div>
  );
}

export default HomeView;
