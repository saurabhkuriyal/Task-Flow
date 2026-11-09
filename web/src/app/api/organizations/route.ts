import { NextResponse } from "next/server";
import { Organization } from "@/models";

// In-memory mock store for organizations
const mockOrganizations: (Organization & {
  gstNumber?: string;
  yearOfEstablishment?: number;
  noOfPeople?: number;
  mrr?: number;
  arr?: number;
})[] = [
  {
    id: "org-1",
    name: "Acme Product Team",
    slug: "acme-product-team",
    description: "Core engineering & product development workspace.",
    role: "ADMIN",
    membersCount: 8,
    activeTasksCount: 14,
    createdAt: "2026-09-01",
    gstNumber: "27AAAPL1234A1Z5",
    yearOfEstablishment: 2021,
    noOfPeople: 25,
    mrr: 15000,
    arr: 180000,
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
    gstNumber: "29BBBPZ5678B2Z1",
    yearOfEstablishment: 2019,
    noOfPeople: 50,
    mrr: 45000,
    arr: 540000,
  },
];

export async function GET() {
  return NextResponse.json(mockOrganizations, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body.name || body.companyName || "").trim();
    const gstNumber = (body.gstNumber || "").trim().toUpperCase();
    const yearOfEstablishment = Number(body.yearOfEstablishment) || new Date().getFullYear();
    const noOfPeople = Number(body.noOfPeople) || 1;
    const mrr = Number(body.mrr) || 0;
    const arr = Number(body.arr) || mrr * 12;
    const description = body.description?.trim() || `${name} organization workspace.`;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Company name is required." },
        { status: 400 }
      );
    }

    if (!gstNumber) {
      return NextResponse.json(
        { success: false, message: "GST number is required." },
        { status: 400 }
      );
    }

    const newOrg = {
      id: `org-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description,
      role: "OWNER",
      membersCount: noOfPeople,
      activeTasksCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      gstNumber,
      yearOfEstablishment,
      noOfPeople,
      mrr,
      arr,
    };

    mockOrganizations.unshift(newOrg);

    return NextResponse.json(
      {
        success: true,
        message: "Organization created successfully!",
        organization: newOrg,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create organization.",
      },
      { status: 500 }
    );
  }
}
