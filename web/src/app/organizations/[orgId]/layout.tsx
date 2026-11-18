import * as React from "react";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { OrganizationModel } from "@/models/organization.model";
import { WorkspaceLayout } from "@/components/organization-workspace";

interface OrgIdLayoutProps {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}

export default async function OrgIdLayout({
  children,
  params,
}: OrgIdLayoutProps) {
  const { orgId } = await params;

  let organizationName = "Organization";

  try {
    await dbConnect();

    let rawOrg = null;
    if (mongoose.Types.ObjectId.isValid(orgId)) {
      rawOrg = await OrganizationModel.findById(orgId)
        .select("organizationName")
        .lean();
    } else {
      rawOrg = await OrganizationModel.findOne({
        $or: [{ _id: orgId }, { organizationName: decodeURIComponent(orgId) }],
      })
        .select("organizationName")
        .lean();
    }

    if (rawOrg && rawOrg.organizationName) {
      organizationName = rawOrg.organizationName;
    }
  } catch (err) {
    console.error("Error fetching organization name in layout:", err);
  }

  return (
    <WorkspaceLayout organizationName={organizationName} orgId={orgId}>
      {children}
    </WorkspaceLayout>
  );
}
