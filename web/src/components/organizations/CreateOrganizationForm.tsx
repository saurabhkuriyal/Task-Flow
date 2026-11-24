"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCreateOrganization } from "@/hooks/organizations";
import { useUser } from "@/context/UserContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function CreateOrganizationForm() {
  const { role } = useUser();
  const isEmployee = role?.toLowerCase() === "employee" || role?.toLowerCase() === "employees";

  const { form, isLoading, serverError, isSuccess, onSubmit } =
    useCreateOrganization();
  const {
    register,
    formState: { errors },
  } = form;

  const currentYear = new Date().getFullYear();

  if (isEmployee) {
    return (
      <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full border-border/80 bg-card/90 shadow-xl p-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-foreground">
              Registration Restricted
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your account has the role <strong>Employee</strong>. Only organization owners and chiefs are permitted to register new enterprise organizations.
            </p>
          </div>
          <Link
            href="/workspaces"
            className={cn(
              buttonVariants({ size: "sm" }),
              "w-full text-xs font-semibold cursor-pointer"
            )}
          >
            Back to Workspaces
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
      >
        <div className="h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-primary/10 via-violet-500/10 to-transparent blur-3xl opacity-70" />
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {/* Navigation & Header */}
        <div>
          <Link
            href={ROUTES.ORGANIZATIONS || "/organizations"}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Organizations</span>
          </Link>

          <div className="flex items-center gap-2 mb-1.5">
            <Badge
              variant="outline"
              className="gap-1 px-2.5 py-0.5 text-[11px] font-medium border-primary/30 bg-primary/5 text-primary"
            >
              <Sparkles className="h-3 w-3" />
              <span>Workspace Setup</span>
            </Badge>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Register New Organization
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Provide your business registration, team scale, and financial metrics to establish an enterprise organization.
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-border/80 bg-card/90 shadow-xl backdrop-blur-md">
          <CardContent className="p-6 sm:p-8">
            {/* Success Alert */}
            {isSuccess && (
              <div
                role="status"
                className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Organization created successfully!</p>
                  <p className="text-xs opacity-90">Redirecting you to your organizations list...</p>
                </div>
              </div>
            )}

            {/* Server Error Alert */}
            {serverError && (
              <div
                role="alert"
                className="mb-6 flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive animate-in fade-in duration-200"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={onSubmit} noValidate className="space-y-5">
              {/* Company Name */}
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Company Name</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyName"
                  placeholder="e.g. Acme Technologies Pvt Ltd"
                  disabled={isLoading || isSuccess}
                  aria-invalid={!!errors.companyName}
                  {...register("companyName", {
                    required: "Company name is required",
                    minLength: {
                      value: 2,
                      message: "Company name must be at least 2 characters",
                    },
                  })}
                  className="h-10 text-sm"
                />
                {errors.companyName && (
                  <p className="text-xs text-destructive">{errors.companyName.message}</p>
                )}
              </div>

              {/* Grid: GST Number & Year of Establishment */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* GST Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="gstNumber" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>GST Number</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="gstNumber"
                    placeholder="e.g. 27AAAPL1234A1Z5"
                    disabled={isLoading || isSuccess}
                    aria-invalid={!!errors.gstNumber}
                    {...register("gstNumber", {
                      required: "GST number is required",
                      pattern: {
                        value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i,
                        message: "Please enter a valid 15-character GST number (e.g. 27AAAPL1234A1Z5)",
                      },
                    })}
                    className="h-10 text-sm font-mono uppercase"
                  />
                  {errors.gstNumber && (
                    <p className="text-xs text-destructive">{errors.gstNumber.message}</p>
                  )}
                </div>

                {/* Year of Establishment */}
                <div className="space-y-1.5">
                  <Label htmlFor="yearOfEstablishment" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Year of Establishment</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="yearOfEstablishment"
                    type="number"
                    placeholder="e.g. 2021"
                    min="1800"
                    max={currentYear}
                    disabled={isLoading || isSuccess}
                    aria-invalid={!!errors.yearOfEstablishment}
                    {...register("yearOfEstablishment", {
                      required: "Year of establishment is required",
                      min: {
                        value: 1800,
                        message: "Year must be 1800 or later",
                      },
                      max: {
                        value: currentYear,
                        message: `Year cannot exceed ${currentYear}`,
                      },
                    })}
                    className="h-10 text-sm"
                  />
                  {errors.yearOfEstablishment && (
                    <p className="text-xs text-destructive">{errors.yearOfEstablishment.message}</p>
                  )}
                </div>
              </div>

              {/* Grid: No. of People & MRR & ARR */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Number of People Included */}
                <div className="space-y-1.5">
                  <Label htmlFor="noOfPeople" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Team Size (People)</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="noOfPeople"
                    type="number"
                    placeholder="e.g. 25"
                    min="1"
                    disabled={isLoading || isSuccess}
                    aria-invalid={!!errors.noOfPeople}
                    {...register("noOfPeople", {
                      required: "Number of people is required",
                      min: {
                        value: 1,
                        message: "Must have at least 1 person",
                      },
                    })}
                    className="h-10 text-sm"
                  />
                  {errors.noOfPeople && (
                    <p className="text-xs text-destructive">{errors.noOfPeople.message}</p>
                  )}
                </div>

                {/* MRR */}
                <div className="space-y-1.5">
                  <Label htmlFor="mrr" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>MRR ($)</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mrr"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 15000"
                    min="0"
                    disabled={isLoading || isSuccess}
                    aria-invalid={!!errors.mrr}
                    {...register("mrr", {
                      required: "Monthly recurring revenue is required",
                      min: {
                        value: 0,
                        message: "MRR cannot be negative",
                      },
                    })}
                    className="h-10 text-sm"
                  />
                  {errors.mrr && (
                    <p className="text-xs text-destructive">{errors.mrr.message}</p>
                  )}
                </div>

                {/* ARR */}
                <div className="space-y-1.5">
                  <Label htmlFor="arr" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>ARR ($)</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="arr"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 180000"
                    min="0"
                    disabled={isLoading || isSuccess}
                    aria-invalid={!!errors.arr}
                    {...register("arr", {
                      required: "Annual recurring revenue is required",
                      min: {
                        value: 0,
                        message: "ARR cannot be negative",
                      },
                    })}
                    className="h-10 text-sm"
                  />
                  {errors.arr && (
                    <p className="text-xs text-destructive">{errors.arr.message}</p>
                  )}
                </div>
              </div>

              {/* Checkbox: Verification and Terms */}
              <div className="pt-2">
                <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-3.5">
                  <input
                    id="isAgreed"
                    type="checkbox"
                    disabled={isLoading || isSuccess}
                    aria-invalid={!!errors.isAgreed}
                    {...register("isAgreed", {
                      required: "You must confirm the accuracy of company details",
                    })}
                    className="mt-0.5 h-4 w-4 rounded-md border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <label
                      htmlFor="isAgreed"
                      className="text-xs font-medium text-foreground cursor-pointer select-none leading-relaxed"
                    >
                      I confirm and certify that the company name, GST registration, team count, and financial metrics provided above are authentic and accurate.
                    </label>
                    {errors.isAgreed && (
                      <p className="text-xs text-destructive font-medium pt-1">
                        {errors.isAgreed.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                    "w-full h-11 gap-2 text-sm font-semibold cursor-pointer shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all justify-center"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Organization...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Register & Create Organization</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateOrganizationForm;

