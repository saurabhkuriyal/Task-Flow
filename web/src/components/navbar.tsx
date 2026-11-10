"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  Sparkles, 
  ArrowRight, 
  CheckCheck,
  Building2,
  CreditCard,
  MessageSquareQuote,
  Mail,
  Home as HomeIcon,
  Layers
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  isAi?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Enterprise", href: "/#enterprise", icon: Building2 },
  { label: "Pricing", href: "/#pricing", icon: CreditCard },
  { 
    label: "Agentic AI", 
    href: "/#agentic-ai", 
    badge: "New", 
    isAi: true, 
    icon: Sparkles 
  },
  { label: "Testimonials", href: "/#testimonials", icon: MessageSquareQuote },
  { label: "Contact", href: "/#contact", icon: Mail },
];

export function Navbar() {
  const { userName, isAuthenticated, clearUser } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();

  // Scroll detection to create the signature Cal.com floating glass aesthetic
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on Esc key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200 select-none",
        mobileMenuOpen
          ? "border-b border-border/80 bg-white dark:bg-zinc-950 shadow-xs"
          : isScrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-md shadow-xs"
          : "border-b border-transparent bg-background/50 backdrop-blur-xs"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            aria-label="TaskFlow home"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background shadow-sm transition-transform duration-200 group-hover:scale-105">
              <CheckCheck className="h-4 w-4 stroke-[2.5]" />
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold tracking-tight text-foreground">
                TaskFlow
              </span>
              <span className="rounded-md border border-border/80 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground tracking-tight">
                Tracker
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1 lg:gap-1.5"
        >
          {NAV_ITEMS.map((item) => {
            const isAgentic = item.isAi;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "text-foreground bg-muted/70"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.label}

                {/* Cal.com inspired Agentic AI Highlight Badge */}
                {isAgentic ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.2 text-[10px] font-medium text-violet-600 dark:text-violet-400">
                    <Sparkles className="h-2.5 w-2.5 text-violet-500 animate-spin-slow" />
                    <span>AI</span>
                  </span>
                ) : item.badge ? (
                  <Badge
                    variant="secondary"
                    className="h-4 px-1.5 text-[10px] font-semibold text-muted-foreground"
                  >
                    {item.badge}
                  </Badge>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Auth & CTAs */}
        <div className="hidden sm:flex items-center gap-2.5">
          {isAuthenticated && userName ? (
            <>
              <Link
                href="/workspaces"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-2 text-xs font-semibold"
                )}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{userName}</span>
              </Link>
              <button
                type="button"
                onClick={clearUser}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                )}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                )}
              >
                Sign In
              </Link>

              <Link
                href="/auth/signup"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "group gap-1.5 text-sm font-medium shadow-xs transition-all duration-150 hover:shadow-md"
                )}
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          {isAuthenticated && userName ? (
            <Link
              href="/workspaces"
              className={cn(
                buttonVariants({ variant: "outline", size: "xs" }),
                "text-xs font-medium max-w-[100px] truncate"
              )}
            >
              {userName}
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className={cn(
                buttonVariants({ variant: "ghost", size: "xs" }),
                "text-xs font-medium"
              )}
            >
              Sign In
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "rounded-lg border border-border/60 hover:bg-muted/80 text-foreground cursor-pointer"
            )}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Overlay Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-40 bg-white dark:bg-zinc-950 sm:hidden border-b border-border/80 flex flex-col justify-between p-5 animate-in fade-in-20 slide-in-from-top-2 duration-150 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Navigation
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon || Layers;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>
                  {item.isAi ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-400">
                      <Sparkles className="h-2.5 w-2.5 text-violet-500" />
                      <span>Agentic</span>
                    </span>
                  ) : item.badge ? (
                    <Badge variant="secondary" className="h-4.5 px-1.5 text-[10px]">
                      {item.badge}
                    </Badge>
                  ) : null}
                </Link>
              );
            })}
          </div>

          {/* Mobile Bottom Actions */}
          <div className="border-t border-border/60 pt-4 flex flex-col gap-2.5">
            {isAuthenticated && userName ? (
              <>
                <Link
                  href="/workspaces"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "w-full justify-center gap-2 text-sm font-semibold"
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Workspaces ({userName})</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    clearUser();
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full justify-center text-sm font-medium cursor-pointer"
                  )}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "w-full justify-center text-sm font-medium"
                  )}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "w-full justify-center gap-1.5 text-sm font-medium shadow-xs"
                  )}
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
            <p className="text-center text-[11px] text-muted-foreground pt-1">
              Enterprise Task Management & AI Tracking OS
            </p>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
