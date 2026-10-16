"use client";

import * as React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Bot, 
  Play, 
  Activity, 
  TrendingUp, 
  Users, 
  Filter,
  Check,
  ChevronRight,
  Zap,
  Star
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TaskItem {
  id: string;
  title: string;
  category: string;
  priority: "Urgent" | "High" | "Normal";
  assignee: {
    name: string;
    avatar: string;
    role: string;
    isAi?: boolean;
  };
  timeLogged: string;
  progress: number;
  status: "In Progress" | "Agentic AI" | "Completed";
  tagColor: string;
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "TASK-101",
    title: "Autonomous PR velocity analyzer & regression detector",
    category: "Agentic AI",
    priority: "Urgent",
    assignee: {
      name: "TaskFlow Agent 01",
      avatar: "",
      role: "Autonomous Agent",
      isAi: true,
    },
    timeLogged: "1h 12m active",
    progress: 88,
    status: "Agentic AI",
    tagColor: "text-violet-500 border-violet-500/20 bg-violet-500/10",
  },
  {
    id: "TASK-102",
    title: "Implement distributed Redis lock for sprint job scheduler",
    category: "Backend Engine",
    priority: "High",
    assignee: {
      name: "Elena Rostova",
      avatar: "ER",
      role: "Lead Architect",
    },
    timeLogged: "4h 25m logged",
    progress: 70,
    status: "In Progress",
    tagColor: "text-blue-500 border-blue-500/20 bg-blue-500/10",
  },
  {
    id: "TASK-103",
    title: "Cal.com style responsive layout & high-contrast theme tokens",
    category: "Design System",
    priority: "Normal",
    assignee: {
      name: "Marcus Chen",
      avatar: "MC",
      role: "Staff Engineer",
    },
    timeLogged: "2h 40m logged",
    progress: 100,
    status: "Completed",
    tagColor: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
  },
  {
    id: "TASK-104",
    title: "Real-time employee workload balancer & burnout forecast",
    category: "Core Tracker",
    priority: "High",
    assignee: {
      name: "Sarah Lindqvist",
      avatar: "SL",
      role: "Product Ops",
    },
    timeLogged: "3h 10m logged",
    progress: 55,
    status: "In Progress",
    tagColor: "text-amber-500 border-amber-500/20 bg-amber-500/10",
  },
];

export function HeroSection() {
  const [activeTab, setActiveTab] = React.useState<"All" | "In Progress" | "Agentic AI" | "Completed">("All");
  const [tasks, setTasks] = React.useState<TaskItem[]>(INITIAL_TASKS);
  const [isAiAssigning, setIsAiAssigning] = React.useState(false);
  const [notification, setNotification] = React.useState<string | null>(null);

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "All") return true;
    return task.status === activeTab;
  });

  const handleSimulateAiAssign = () => {
    setIsAiAssigning(true);
    setTimeout(() => {
      setIsAiAssigning(false);
      setNotification("Agentic AI autonomously rebalanced 2 sprint dependencies!");
      setTimeout(() => setNotification(null), 3500);
    }, 900);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-24 sm:pt-12 sm:pb-32">
      {/* Background Ambience: Cal.com inspired subtle radial glow & grid */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <div className="h-[500px] w-[900px] max-w-full rounded-full bg-linear-to-tr from-foreground/5 via-violet-500/10 to-transparent blur-3xl opacity-70" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header Badge */}
        <div className="flex justify-center">
          <Link
            href="/signin"
            className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur-md transition-all hover:border-foreground/40 hover:bg-muted/50"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-foreground">TaskFlow 2.0</span>
            <span className="text-border">|</span>
            <span className="inline-flex items-center gap-1 text-foreground/80 group-hover:text-foreground">
              Autonomous Agentic Task Tracking
              <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>

        {/* Main Headline & Pitch */}
        <div className="mt-8 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.08]">
            The employee task manager built for{" "}
            <span className="bg-linear-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent underline decoration-violet-500/40 decoration-wavy decoration-from-font">
              velocity
            </span>{" "}
            & autonomy.
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminate standup friction. Automate task delegation, capture true employee focus time, and let autonomous Agentic AI resolve bottlenecks before deadlines slip.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/auth/signup"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "w-full sm:w-auto h-12 px-7 text-sm font-semibold shadow-md transition-all duration-200 group gap-2"
              )}
            >
              <span>Get Started — It's Free</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <a
              href="#interactive-demo"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("interactive-demo")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto h-12 px-6 text-sm font-medium gap-2 border-border/80 hover:bg-muted/60 transition-colors"
              )}
            >
              <Play className="h-3.5 w-3.5 fill-current opacity-80" />
              <span>Explore Live Workspace</span>
            </a>
          </div>

          {/* Cal.com style Micro Trust Metrics */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />
              14-day Enterprise trial
            </span>
            <span className="flex items-center gap-1.5">
              <span className="flex text-amber-500">
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
                <Star className="h-3 w-3 fill-current" />
              </span>
              <span>4.9/5 by 1,400+ teams</span>
            </span>
          </div>
        </div>

        {/* Cal.com Signature Interactive Hero Showcase Card */}
        <div id="interactive-demo" className="mt-14 sm:mt-18 relative mx-auto max-w-5xl">
          {/* Subtle Ambient Glow Border around card */}
          <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-b from-foreground/15 via-border/50 to-transparent blur-xs -z-10" />

          {/* Main Workspace Simulation Card */}
          <div className="rounded-2xl border border-border/80 bg-card/90 text-card-foreground shadow-2xl backdrop-blur-xl overflow-hidden ring-1 ring-foreground/5">
            {/* Window Top Bar (Cal.com inspired sleek app header) */}
            <div className="flex flex-wrap items-center justify-between border-b border-border/70 px-4 py-3 bg-muted/30 gap-2">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="h-4 w-px bg-border/80 mx-1" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">Acme Engineering Pulse</span>
                  <Badge variant="outline" className="h-4 px-1.5 text-[10px] text-muted-foreground font-mono">
                    Sprint #14
                  </Badge>
                </div>
              </div>

              {/* Live Status indicator */}
              <div className="flex items-center gap-3 text-xs">
                <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>4 Active Employees</span>
                </div>

                <Button
                  size="xs"
                  onClick={handleSimulateAiAssign}
                  disabled={isAiAssigning}
                  className="gap-1.5 text-[11px] font-medium bg-foreground text-background hover:bg-foreground/90 shadow-xs"
                >
                  <Sparkles className={cn("h-3 w-3 text-violet-400", isAiAssigning && "animate-spin")} />
                  <span>{isAiAssigning ? "Optimizing..." : "AI Auto-Balance"}</span>
                </Button>
              </div>
            </div>

            {/* Notification Banner when user triggers AI */}
            {notification && (
              <div className="bg-violet-500/10 border-b border-violet-500/20 px-4 py-2 text-xs font-medium text-violet-600 dark:text-violet-400 flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-violet-500" />
                  <span>{notification}</span>
                </div>
                <span className="text-[10px] opacity-75">Auto-updated</span>
              </div>
            )}

            {/* Card Subheader: Filters & Velocity Metric */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 gap-3 border-b border-border/50 bg-background/50">
              {/* Filter Tabs */}
              <div className="inline-flex items-center gap-1 rounded-lg bg-muted/60 p-1 border border-border/60 text-xs">
                {(["All", "In Progress", "Agentic AI", "Completed"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
                      activeTab === tab
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                    {tab === "Agentic AI" && (
                      <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-violet-500 animate-ping" />
                    )}
                  </button>
                ))}
              </div>

              {/* Sprint Velocity Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-semibold text-foreground">88%</span> velocity
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-semibold text-foreground">32.4 hrs</span> logged today
                </div>
              </div>
            </div>

            {/* Task List / Kanban Rows */}
            <div className="divide-y divide-border/40 p-2 sm:p-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl transition-all duration-150 hover:bg-muted/40 gap-3"
                >
                  {/* Left: Checkmark + Task Title & Category */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="mt-0.5 sm:mt-0 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border bg-background group-hover:border-foreground/50 transition-colors">
                      {task.status === "Completed" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-foreground/50" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] text-muted-foreground font-medium">
                          {task.id}
                        </span>
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", task.tagColor)}>
                          {task.category}
                        </span>
                        {task.priority === "Urgent" && (
                          <Badge variant="destructive" className="h-4 px-1.5 text-[9px] font-bold">
                            URGENT
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground tracking-tight">
                        {task.title}
                      </p>
                    </div>
                  </div>

                  {/* Right: Employee Assigned + Time Logged + Progress */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-8 sm:pl-0">
                    {/* Time logged pill */}
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted/40 px-2 py-1 rounded-md border border-border/40">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{task.timeLogged}</span>
                    </div>

                    {/* Assignee Avatar */}
                    <div className="flex items-center gap-2">
                      <Avatar size="sm" className="ring-1 ring-border">
                        {task.assignee.isAi ? (
                          <div className="flex h-full w-full items-center justify-center bg-violet-500/10 text-violet-500">
                            <Bot className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                            {task.assignee.avatar}
                          </AvatarFallback>
                        )}
                        <AvatarBadge className={task.assignee.isAi ? "bg-violet-500" : "bg-emerald-500"} />
                      </Avatar>
                      <div className="hidden lg:block text-left">
                        <div className="text-[11px] font-semibold text-foreground leading-none">
                          {task.assignee.name}
                        </div>
                        <div className="text-[9px] text-muted-foreground leading-tight">
                          {task.assignee.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Card Footer: Live AI Assistant Bar */}
            <div className="border-t border-border/60 bg-muted/30 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-foreground font-medium">Agentic Copilot Active:</span>
                <span className="hidden sm:inline">Monitoring backlog changes and sprint bottlenecks in real time.</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-foreground/80">
                <span>Auto-sync with GitHub & Jira</span>
                <span className="text-emerald-500 font-bold">● Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
