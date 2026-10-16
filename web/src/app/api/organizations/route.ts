import { NextResponse } from "next/server";
import { Organization } from "@/models";

// In-memory mock store for organizations
const mockOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "Acme Product Team",
    slug: "acme-product-team",
    description: "Core engineering & product development workspace.",
    role: "ADMIN",
    membersCount: 8,
    activeTasksCount: 14,
    createdAt: "2026-09-01",
  },
  {
    id: "org-2",
    name: "Apex Cloud Infrastructure",
    slug: "apex-cloud-infra",
    description: "DevOps, SRE, and cloud infrastructure monitoring.",
    role: "MEMBER",
    membersCount: 12,
    activeTasksCount: 22,
    createdAt: "2026-09-18",
  },
];

export async function GET() {
  return NextResponse.json(mockOrganizations, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { message: "Organization name is required." },
        { status: 400 }
      );
    }

    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: description?.trim() || "Workspace for task management.",
      role: "ADMIN",
      membersCount: 1, // Current creator
      activeTasksCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    mockOrganizations.unshift(newOrg);

    return NextResponse.json(newOrg, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Failed to create organization." },
      { status: 500 }
    );
  }
}
