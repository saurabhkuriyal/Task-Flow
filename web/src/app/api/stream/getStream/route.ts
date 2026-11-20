import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { StreamModel } from "@/models/stream.model";
import { OrganizationModel } from "@/models/organization.model";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const orgId = (
      searchParams.get("orgId") ||
      searchParams.get("organisationId") ||
      searchParams.get("organizationId")
    )?.trim();
    const type = searchParams.get("type")?.trim();

    // Organization ID is required for fetching an organization's streams
    if (!orgId || orgId === "undefined" || orgId === "null") {
      return NextResponse.json(
        {
          success: false,
          message: "Organization ID is required.",
          streams: [],
        },
        { status: 400 }
      );
    }

    const orgConditions: Record<string, unknown>[] = [
      { organisationId: orgId },
      { organisationName: orgId },
    ];

    if (mongoose.Types.ObjectId.isValid(orgId)) {
      orgConditions.push({
        organisationId: new mongoose.Types.ObjectId(orgId),
      });
    }

    // Cross-match via OrganizationModel for both ObjectId and name compatibility
    try {
      const orgDoc = mongoose.Types.ObjectId.isValid(orgId)
        ? await OrganizationModel.findById(orgId).lean()
        : await OrganizationModel.findOne({ organizationName: orgId }).lean();

      if (orgDoc) {
        orgConditions.push(
          { organisationId: orgDoc._id.toString() },
          { organisationId: orgDoc._id },
          { organisationName: orgDoc.organizationName }
        );
      }
    } catch (err) {
      console.warn("Failed to lookup organization document:", err);
    }

    const andConditions: Record<string, unknown>[] = [{ $or: orgConditions }];

    if (type && type !== "undefined" && type !== "null") {
      andConditions.push({ type });
    }

    const query = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const streams = await StreamModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: streams.length,
        streams,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get streams by organization API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching streams.",
        streams: [],
      },
      { status: 500 }
    );
  }
}
