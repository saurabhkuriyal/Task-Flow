"use client";

import * as React from "react";
import { X, Building2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CreateOrganizationInput, OrganizationPlan } from "@/types/workspace";

const GRADIENT_PRESETS = [
  { name: "Blue / Indigo", value: "from-blue-600 to-indigo-600" },
  { name: "Violet / Fuchsia", value: "from-violet-600 to-fuchsia-600" },
  { name: "Emerald / Teal", value: "from-emerald-600 to-teal-600" },
  { name: "Amber / Orange", value: "from-amber-600 to-orange-600" },
  { name: "Rose / Pink", value: "from-rose-600 to-pink-600" },
];

const PLANS: OrganizationPlan[] = ["Pro", "Enterprise", "Growth"];

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrganizationInput) => void;
}

export function CreateOrganizationModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateOrganizationModalProps) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedGradient, setSelectedGradient] = React.useState(GRADIENT_PRESETS[0].value);
  const [selectedPlan, setSelectedPlan] = React.useState<OrganizationPlan>("Pro");
  const [error, setError] = React.useState("");

  // Automatically sync slug with name unless user manually touched slug
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    if (error) setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide an organization name.");
      return;
    }

    onSubmit({
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      gradient: selectedGradient,
      plan: selectedPlan,
    });

    // Reset fields
    setName("");
    setSlug("");
    setDescription("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Content (scrollable on smaller smartphones) */}
      <div className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-2xl border border-border bg-card p-4 sm:p-6 sm:p-8 shadow-2xl transition-all z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer touch-manipulation"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 sm:mb-6 pr-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
              Create Organization
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-tight">
              Establish a workspace hub for your company
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Org Name */}
          <div className="space-y-1.5">
            <Label htmlFor="org-name" className="text-xs font-semibold">
              Organization Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="org-name"
              placeholder="e.g., Acme Cloud Systems"
              value={name}
              onChange={handleNameChange}
              className="h-10 text-sm w-full"
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {/* Org Slug */}
          <div className="space-y-1.5">
            <Label htmlFor="org-slug" className="text-xs font-semibold">
              Workspace Identifier (Slug)
            </Label>
            <div className="flex rounded-lg border border-input shadow-xs focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden bg-background">
              <span className="inline-flex items-center px-2.5 sm:px-3 border-r border-border bg-muted/60 text-[11px] sm:text-xs text-muted-foreground font-mono select-none">
                taskflow.io/
              </span>
              <input
                id="org-slug"
                placeholder="acme-cloud"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 h-10 px-3 bg-transparent text-xs sm:text-sm font-mono outline-hidden focus:outline-hidden min-w-0"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="org-desc" className="text-xs font-semibold">
              Description
            </Label>
            <Input
              id="org-desc"
              placeholder="Brief summary of this team or organization"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 text-sm w-full"
            />
          </div>

          {/* Plan Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Workspace Plan</Label>
            <div className="grid grid-cols-3 gap-2">
              {PLANS.map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border py-2.5 text-xs font-medium transition-all cursor-pointer touch-manipulation",
                    selectedPlan === plan
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  {plan}
                </button>
              ))}
            </div>
          </div>

          {/* Color Gradient Theme */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Brand Color Palette</Label>
            <div className="flex items-center gap-2.5 pt-1 overflow-x-auto pb-1">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setSelectedGradient(preset.value)}
                  className={cn(
                    "relative h-8 w-8 sm:h-7 sm:w-7 shrink-0 rounded-full bg-gradient-to-br transition-transform hover:scale-110 cursor-pointer shadow-xs touch-manipulation",
                    preset.value,
                    selectedGradient === preset.value && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                  )}
                  title={preset.name}
                >
                  {selectedGradient === preset.value && (
                    <Check className="h-3.5 w-3.5 text-white absolute inset-0 m-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Actions: stacked on mobile, inline on tablet+ */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto text-xs cursor-pointer h-10 sm:h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto text-xs font-semibold gap-1.5 shadow-sm cursor-pointer h-10 sm:h-9"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Create Workspace</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrganizationModal;
