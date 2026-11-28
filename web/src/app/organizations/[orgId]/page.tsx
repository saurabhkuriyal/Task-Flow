import * as React from "react";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { OrganizationModel } from "@/models/organization.model";
import { OrganizationHomeView } from "@/components/home";
import type { OrganizationDocumentData } from "@/types/organization";

export const metadata = {
  title: "Organization Workspace | TaskFlow",
  description: "Enterprise workspace command center.",
};

interface OrgIdPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function OrgIdPage({ params }: OrgIdPageProps) {
  const { orgId } = await params;

  let initialOrganization: OrganizationDocumentData | null = null;

  try {
    await dbConnect();

    let rawOrg = null;
    if (mongoose.Types.ObjectId.isValid(orgId)) {
      rawOrg = await OrganizationModel.findById(orgId).lean();
    } else {
      rawOrg = await OrganizationModel.findOne({
        $or: [{ _id: orgId }, { organizationName: decodeURIComponent(orgId) }],
      }).lean();
    }

    if (rawOrg) {
      initialOrganization = {
        _id: String(rawOrg._id),
        id: String(rawOrg._id),
        ownerId: rawOrg.ownerId ? String(rawOrg.ownerId) : "",
        organizationName: rawOrg.organizationName || "Organization",
        gstNo: rawOrg.gstNo || "",
        establishedYear: rawOrg.establishedYear || 0,
        teamSize: rawOrg.teamSize || 0,
        arr: rawOrg.arr || 0,
        mrr: rawOrg.mrr || 0,
        members: Array.isArray(rawOrg.members)
          ? rawOrg.members.map((m) => ({
              memberId: m.memberId ? String(m.memberId) : "",
              name: m.name || "",
            }))
          : [],
        departments: Array.isArray(rawOrg.departments)
          ? rawOrg.departments.map((d) => {
              const deptId =
                "departmentId" in d && d.departmentId
                  ? String(d.departmentId)
                  : "streamId" in d && d.streamId
                  ? String(d.streamId)
                  : "";
              const deptName =
                "departmentName" in d && d.departmentName
                  ? String(d.departmentName)
                  : "";
              const head =
                "head" in d && d.head ? String(d.head) : undefined;
              return {
                departmentId: deptId,
                departmentName: deptName,
                head,
              };
            })
          : [],
        projects: Array.isArray(rawOrg.projects)
          ? rawOrg.projects.map((p) => ({
              projectId: p.projectId ? String(p.projectId) : "",
              name: p.name || "",
              lead: p.lead ? String(p.lead) : undefined,
            }))
          : [],
        employees: [],
        createdAt: rawOrg.createdAt
          ? new Date(rawOrg.createdAt).toISOString()
          : undefined,
        updatedAt: rawOrg.updatedAt
          ? new Date(rawOrg.updatedAt).toISOString()
          : undefined,
      };
    }
  } catch (err) {
    console.error("Error fetching organization details on home page:", err);
  }

  return (
    <OrganizationHomeView
      orgId={orgId}
      initialOrganization={initialOrganization}
    />
  );
}
