"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  CheckCheck
} from "lucide-react";
import { useSignin } from "@/hooks/auth/useSignin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function SigninForm() {
  const { form, isLoading, serverError, isSuccess, onSubmit } = useSignin();
  const { register, formState: { errors } } = form;

  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
      >
        <div className="h-[450px] w-[700px] rounded-full bg-gradient-to-tr from-foreground/5 via-violet-500/5 to-transparent blur-3xl opacity-60" />
      </div>

      <div className="w-full max-w-md">
        {/* Top Brand Header */}
        <div className="text-center mb-6">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 mb-3 group transition-transform hover:scale-105"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background shadow-xs">
              <CheckCheck className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              TaskFlow
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to access your workspaces & sprint tracking
          </p>
        </div>

        {/* Signin Card */}
        <Card className="border-border/80 bg-card/90 shadow-xl backdrop-blur-md">
          <CardContent className="pt-6">
            {/* Success Notification */}
            {isSuccess && (
              <div 
                role="status"
                className="mb-5 flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Signed in successfully! Redirecting to workspace...</span>
              </div>
            )}

            {/* Server Error Alert */}
            {serverError && (
              <div 
                role="alert"
                className="mb-5 flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in duration-200"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={onSubmit} noValidate suppressHydrationWarning className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  aria-invalid={!!errors.email}
                  disabled={isLoading || isSuccess}
                  {...register("email", {
                    required: "Email address is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                  className="h-10 text-sm"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={!!errors.password}
                    disabled={isLoading || isSuccess}
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className="h-10 text-sm pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    suppressHydrationWarning
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                suppressHydrationWarning
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "w-full h-10 gap-2 text-sm font-semibold cursor-pointer shadow-xs transition-all hover:shadow-md"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Prompt */}
            <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
              Don&apos;t have an account yet?{" "}
              <Link
                href={ROUTES.AUTH.SIGNUP}
                className="font-semibold text-foreground hover:underline transition-colors"
              >
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SigninForm;
