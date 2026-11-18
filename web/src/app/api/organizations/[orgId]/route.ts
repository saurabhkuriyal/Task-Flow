import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { OrganizationModel } from "@/models/organization.model";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    await dbConnect();
    const { orgId } = await params;

    if (!orgId) {
      return NextResponse.json(
        { success: false, message: "Organization ID is required" },
        { status: 400 }
      );
    }

    let org = null;
    if (mongoose.Types.ObjectId.isValid(orgId)) {
      org = await OrganizationModel.findById(orgId).lean();
    } else {
      org = await OrganizationModel.findOne({
        $or: [{ _id: orgId }, { organizationName: decodeURIComponent(orgId) }],
      }).lean();
    }

    if (!org) {
      return NextResponse.json(
        { success: false, message: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, organization: org },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch organization error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch organization",
      },
      { status: 500 }
    );
  }
}
