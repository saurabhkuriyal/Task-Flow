"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Settings,
  X,
  Briefcase,
  Layers,
  Bot,
  Activity,
  Globe,
  Lock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  plan: "Enterprise" | "Pro" | "Growth";
  membersCount: number;
  activeTasksCount: number;
  aiAgentsCount: number;
  colorScheme: string;
  lastActive: string;
}

const INITIAL_ORGS: OrganizationItem[] = [
  {
    id: "org-1",
    name: "Acme Product Engineering",
    slug: "acme-product-eng",
    description: "Core platform microservices, design system, and unified customer web applications.",
    role: "OWNER",
    plan: "Enterprise",
    membersCount: 24,
    activeTasksCount: 42,
    aiAgentsCount: 3,
    colorScheme: "from-blue-600 to-indigo-600",
    lastActive: "Active 5m ago",
  },
  {
    id: "org-2",
    name: "Apex Cloud Infrastructure",
    slug: "apex-cloud-infra",
    description: "Multi-region Kubernetes clusters, distributed Redis caches, and SRE incident telemetry.",
    role: "ADMIN",
    plan: "Enterprise",
    membersCount: 16,
    activeTasksCount: 19,
    aiAgentsCount: 2,
    colorScheme: "from-emerald-600 to-teal-600",
    lastActive: "Active 22m ago",
  },
  {
    id: "org-3",
    name: "Synthetix Autonomous Ops",
    slug: "synthetix-ai-ops",
    description: "Continuous integration regression analyzers, PR reviewers, and agentic code agents.",
    role: "MEMBER",
    plan: "Pro",
    membersCount: 9,
    activeTasksCount: 15,
    aiAgentsCount: 4,
    colorScheme: "from-violet-600 to-purple-600",
    lastActive: "Active 1h ago",
  },
];

const COLOR_PRESETS = [
  { name: "Indigo", value: "from-indigo-600 to-violet-600" },
  { name: "Emerald", value: "from-emerald-600 to-teal-600" },
  { name: "Blue", value: "from-blue-600 to-cyan-600" },
  { name: "Amber", value: "from-amber-600 to-orange-600" },
  { name: "Rose", value: "from-rose-600 to-pink-600" },
];

export function OrganizationsView() {
  const [organizations, setOrganizations] = React.useState<OrganizationItem[]>(INITIAL_ORGS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterRole, setFilterRole] = React.useState<"ALL" | "ADMIN" | "MEMBER">("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // New Org Form State
  const [newOrgName, setNewOrgName] = React.useState("");
  const [newOrgSlug, setNewOrgSlug] = React.useState("");
  const [newOrgDesc, setNewOrgDesc] = React.useState("");
  const [selectedColor, setSelectedColor] = React.useState(COLOR_PRESETS[0]!.value);
  const [selectedPlan, setSelectedPlan] = React.useState<"Enterprise" | "Pro" | "Growth">("Pro");
  const [formError, setFormError] = React.useState("");

  // Auto-generate slug when typing name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewOrgName(val);
    setNewOrgSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const handleCreateOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
      setFormError("Organization name is required.");
      return;
    }

    const createdOrg: OrganizationItem = {
      id: `org-${Date.now()}`,
      name: newOrgName.trim(),
      slug: newOrgSlug.trim() || newOrgName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: newOrgDesc.trim() || "Collaborative engineering workspace for tasks and sprint planning.",
      role: "OWNER",
      plan: selectedPlan,
      membersCount: 1,
      activeTasksCount: 0,
      aiAgentsCount: 1,
      colorScheme: selectedColor,
      lastActive: "Just created",
    };

    setOrganizations([createdOrg, ...organizations]);
    setIsCreateModalOpen(false);

    // Reset Form
    setNewOrgName("");
    setNewOrgSlug("");
    setNewOrgDesc("");
    setFormError("");
  };

  // Filtered Orgs
  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      filterRole === "ALL" ||
      (filterRole === "ADMIN" && (org.role === "ADMIN" || org.role === "OWNER")) ||
      (filterRole === "MEMBER" && org.role === "MEMBER");

    return matchesSearch && matchesRole;
  });

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background text-foreground antialiased selection:bg-foreground selection:text-background pb-20">
      {/* Background Ambience */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-start justify-center overflow-hidden"
      >
        <div className="h-[480px] w-[1000px] rounded-full bg-radial from-violet-500/10 via-foreground/5 to-transparent blur-3xl opacity-70" />
      </div>

      {/* Hero Section */}
      <section className="border-b border-border/60 bg-muted/20 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-xs shadow-xs mb-4">
                <Building2 className="h-3.5 w-3.5 text-violet-500" />
                <span>Enterprise Multi-Tenancy</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  AI Agent Ready
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Organizations &amp; Workspaces
              </h1>

              {/* Description */}
              <p className="mt-3 text-sm text-muted-foreground sm:text-base max-w-2xl">
                Isolate sprints, manage department access controls, and assign autonomous AI workers across dedicated company units.
              </p>
            </div>

            {/* Action Button: Create Organization */}
            <div className="shrink-0 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "group h-10 px-4 text-sm font-semibold shadow-xs hover:shadow-md cursor-pointer gap-2 transition-all"
                )}
              >
                <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
                <span>Create Organization</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 border-t border-border/60 pt-6">
            <div className="rounded-xl border border-border/60 bg-card/60 p-3 sm:p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                <span>Total Organizations</span>
                <Building2 className="h-4 w-4 text-violet-500" />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {organizations.length}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/60 p-3 sm:p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                <span>Active Collaborators</span>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {organizations.reduce((acc, curr) => acc + curr.membersCount, 0)}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/60 p-3 sm:p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                <span>Tasks In Flight</span>
                <Activity className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {organizations.reduce((acc, curr) => acc + curr.activeTasksCount, 0)}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/60 p-3 sm:p-4 backdrop-blur-xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                <span>Autonomous Agents</span>
                <Bot className="h-4 w-4 text-purple-500" />
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                {organizations.reduce((acc, curr) => acc + curr.aiAgentsCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Controls Bar: Search & Role Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-6 border-b border-border/60">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by organization name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-card/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-muted/60 p-1 rounded-lg border border-border/60">
            <button
              type="button"
              onClick={() => setFilterRole("ALL")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                filterRole === "ALL"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({organizations.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRole("ADMIN")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                filterRole === "ADMIN"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Admin &amp; Owner
            </button>
            <button
              type="button"
              onClick={() => setFilterRole("MEMBER")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                filterRole === "MEMBER"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Member
            </button>
          </div>
        </div>

        {/* Organizations Cards Grid */}
        {filteredOrgs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
            {filteredOrgs.map((org) => {
              const initials = org.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <Card
                  key={org.id}
                  className="group relative flex flex-col justify-between border-border/80 bg-card/80 hover:bg-card hover:border-border transition-all duration-200 hover:shadow-lg backdrop-blur-xs overflow-hidden"
                >
                  {/* Top Color Accent Line */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                      org.colorScheme
                    )}
                  />

                  <CardContent className="pt-5 p-5 flex flex-col h-full justify-between">
                    <div>
                      {/* Card Header: Avatar + Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-sm bg-gradient-to-br",
                              org.colorScheme
                            )}
                          >
                            {initials}
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
                              {org.name}
                            </h3>
                            <p className="text-xs text-muted-foreground font-mono">
                              @{org.slug}
                            </p>
                          </div>
                        </div>

                        {/* Role Badge */}
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5",
                            org.role === "OWNER"
                              ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/30"
                              : org.role === "ADMIN"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {org.role}
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {org.description}
                      </p>

                      {/* Stats Strip */}
                      <div className="mt-5 grid grid-cols-3 gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-center">
                        <div>
                          <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>Members</span>
                          </div>
                          <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {org.membersCount}
                          </p>
                        </div>

                        <div className="border-x border-border/60">
                          <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>Tasks</span>
                          </div>
                          <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {org.activeTasksCount}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                            <Bot className="h-3 w-3 text-violet-500" />
                            <span>AI Ops</span>
                          </div>
                          <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {org.aiAgentsCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Action Links */}
                    <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {org.lastActive}
                      </span>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/organizations/${org.id}`}
                          className={cn(
                            buttonVariants({ variant: "default", size: "sm" }),
                            "h-7 px-3 text-xs font-medium gap-1 group/btn shadow-xs"
                          )}
                        >
                          <span>Open</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No organizations found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              No workspace matched &ldquo;{searchQuery}&rdquo;. Try another term or create a new organization.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-4 gap-1.5 text-xs font-semibold cursor-pointer"
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Organization</span>
            </button>
          </div>
        )}
      </main>

      {/* Create Organization Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    Create New Organization
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Set up a dedicated workspace for your team
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateOrganization} className="mt-5 space-y-4">
              {/* Organization Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Organization Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Acme Systems or Core Platform"
                  value={newOrgName}
                  onChange={handleNameChange}
                  className="h-9 text-sm"
                  autoFocus
                />
              </div>

              {/* URL Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Workspace URL Slug
                </label>
                <div className="flex items-center rounded-lg border border-input bg-muted/30 px-3 text-xs text-muted-foreground">
                  <span>taskflow.app/</span>
                  <input
                    type="text"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                    className="flex-1 bg-transparent py-2 pl-0.5 text-foreground font-mono focus:outline-none"
                    placeholder="acme-systems"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newOrgDesc}
                  onChange={(e) => setNewOrgDesc(e.target.value)}
                  placeholder="What will this team focus on?"
                  className="w-full rounded-lg border border-input bg-transparent p-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              {/* Color Preset Palette */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Brand Accent Theme
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.value)}
                      className={cn(
                        "h-6 w-6 rounded-full bg-gradient-to-tr transition-all cursor-pointer ring-offset-background",
                        color.value,
                        selectedColor === color.value
                          ? "ring-2 ring-foreground scale-110 shadow-sm"
                          : "opacity-70 hover:opacity-100"
                      )}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Plan Choice */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-foreground">
                  Initial Plan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Growth", "Pro", "Enterprise"] as const).map((plan) => (
                    <button
                      key={plan}
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      className={cn(
                        "rounded-lg border p-2 text-xs font-medium transition-all text-center cursor-pointer",
                        selectedPlan === plan
                          ? "border-primary bg-primary/10 text-foreground font-semibold"
                          : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-border/60 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "text-xs font-medium cursor-pointer"
                  )}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "text-xs font-semibold cursor-pointer shadow-xs gap-1.5"
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Workspace</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizationsView;
