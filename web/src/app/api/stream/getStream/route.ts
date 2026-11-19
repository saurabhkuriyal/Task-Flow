import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { StreamModel } from "@/models/stream.model";
import { OrganizationModel } from "@/models/organization.model";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("id") || searchParams.get("streamId");
    const orgId = (
      searchParams.get("orgId") ||
      searchParams.get("organisationId") ||
      searchParams.get("organizationId")
    )?.trim();
    const type = searchParams.get("type")?.trim();

    // 1. Fetch single stream by ID
    if (streamId) {
      let stream = mongoose.Types.ObjectId.isValid(streamId)
        ? await StreamModel.findById(streamId).lean()
        : await StreamModel.findOne({ _id: streamId }).lean();

      if (!stream) {
        stream = await StreamModel.findOne({ name: streamId }).lean();
      }

      if (!stream) {
        return NextResponse.json(
          {
            success: false,
            message: "Stream not found.",
            streams: [],
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          stream,
          streams: [stream],
        },
        { status: 200 }
      );
    }

    // 2. Build query filter
    const andConditions: Record<string, unknown>[] = [];

    if (orgId && orgId !== "undefined" && orgId !== "null") {
      const orgConditions: Record<string, unknown>[] = [
        { organisationId: orgId },
        { organisationName: orgId },
      ];

      // If orgId is an ObjectId or org name, also check OrganizationModel for cross-matching
      try {
        const orgDoc = mongoose.Types.ObjectId.isValid(orgId)
          ? await OrganizationModel.findById(orgId).lean()
          : await OrganizationModel.findOne({ organizationName: orgId }).lean();

        if (orgDoc) {
          orgConditions.push(
            { organisationId: orgDoc._id.toString() },
            { organisationName: orgDoc.organizationName }
          );
        }
      } catch (err) {
        console.warn("Failed to lookup organization document:", err);
      }

      andConditions.push({ $or: orgConditions });
    }

    if (type && type !== "undefined" && type !== "null") {
      andConditions.push({ type });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

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
    console.error("Get stream API error:", error);
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
