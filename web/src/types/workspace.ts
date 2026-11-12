export type OrganizationRole = "OWNER" | "ADMIN" | "MEMBER";

export type OrganizationPlan = "Enterprise" | "Pro" | "Growth" | "Starter";

export interface WorkspaceOrganization {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  role: OrganizationRole;
  plan?: OrganizationPlan;
  membersCount: number;
  projectsCount: number;
  activeTasksCount: number;
  gradient?: string;
  avatarText?: string;
  updatedAt?: string;
  isFavorite?: boolean;
  gstNo?: string;
  establishedYear?: number;
  teamSize?: number;
  mrr?: number;
  arr?: number;
  departmentsCount?: number;
  ownerId?: string;
}

export interface CreateOrganizationInput {
  name: string;
  slug?: string;
  description: string;
  gradient?: string;
  plan?: OrganizationPlan;
}
