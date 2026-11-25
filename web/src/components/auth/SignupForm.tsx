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
import { useSignup } from "@/hooks/auth/useSignup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

export function SignupForm() {
  const { form, isLoading, serverError, isSuccess, onSubmit } = useSignup();
  const { register, formState: { errors } } = form;

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
      >
        <div className="h-[450px] w-[700px] rounded-full bg-linear-to-tr from-foreground/5 via-violet-500/5 to-transparent blur-3xl opacity-60" />
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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started with autonomous employee task tracking
          </p>
        </div>

        {/* Signup Card */}
        <Card className="border-border/80 bg-card/90 shadow-xl backdrop-blur-md">
          <CardContent className="pt-6">
            {/* Success Notification */}
            {isSuccess && (
              <div 
                role="status"
                className="mb-5 flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Account created successfully! Redirecting to sign in...</span>
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
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Elena Rostova"
                  aria-invalid={!!errors.name}
                  disabled={isLoading || isSuccess}
                  {...register("name", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  className="h-10 text-sm"
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Work Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                  Work Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="elena@company.com"
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

              {/* Phone Number */}
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-xs font-semibold text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 019-2834"
                  aria-invalid={!!errors.phoneNumber}
                  disabled={isLoading || isSuccess}
                  {...register("phoneNumber", {
                    required: "Phone number is required",
                    minLength: {
                      value: 8,
                      message: "Please enter a valid phone number",
                    },
                  })}
                  className="h-10 text-sm"
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    disabled={isLoading || isSuccess}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    className="h-10 pr-9 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    aria-invalid={!!errors.confirmPassword}
                    disabled={isLoading || isSuccess}
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                    })}
                    className="h-10 pr-9 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    suppressHydrationWarning
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className="w-full h-10 gap-2 text-sm font-semibold shadow-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Terms and Privacy notice */}
            <p className="mt-4 text-center text-[11px] text-muted-foreground leading-normal">
              By creating an account, you agree to TaskFlow&apos;s{" "}
              <Link href="#" className="underline hover:text-foreground">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline hover:text-foreground">
                Privacy Policy
              </Link>.
            </p>
          </CardContent>
        </Card>

        {/* Bottom Link to Sign In */}
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={ROUTES.AUTH.SIGNIN}
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupForm;
