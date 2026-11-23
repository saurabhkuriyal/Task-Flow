import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { StreamModel } from "@/models/stream.model";
import UserModel from "@/models/auth.model";

function extractId(val: unknown): string {
  if (!val) return "";
  if (typeof val === "object" && val !== null && "_id" in val) {
    return String((val as { _id?: unknown })._id || "");
  }
  return String(val);
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const streamId = (
      searchParams.get("streamId") ||
      searchParams.get("id")
    )?.trim();
    const orgId = (
      searchParams.get("orgId") ||
      searchParams.get("organisationId") ||
      searchParams.get("organizationId")
    )?.trim();

    if (!streamId) {
      return NextResponse.json(
        {
          success: false,
          message: "Stream ID is required.",
          members: [],
        },
        { status: 400 }
      );
    }

    const filter: Record<string, unknown> = mongoose.Types.ObjectId.isValid(streamId)
      ? { _id: new mongoose.Types.ObjectId(streamId) }
      : { _id: streamId };

    if (orgId && mongoose.Types.ObjectId.isValid(orgId)) {
      filter.organisationId = new mongoose.Types.ObjectId(orgId);
    }

    let stream = await StreamModel.findOne(filter).lean();
    if (!stream && filter.organisationId) {
      delete filter.organisationId;
      stream = await StreamModel.findOne(filter).lean();
    }

    if (!stream) {
      return NextResponse.json(
        {
          success: false,
          message: "Stream not found.",
          members: [],
        },
        { status: 404 }
      );
    }

    const rawStream = stream as unknown as Record<string, unknown>;

    // Collect all member, lead, and manager IDs to resolve their user profiles
    const userIds = new Set<string>();

    const rawMembers = Array.isArray(rawStream.members) ? rawStream.members : [];
    const rawLead = Array.isArray(rawStream.lead) ? rawStream.lead : [];
    const rawManager = Array.isArray(rawStream.manager) ? rawStream.manager : [];

    rawMembers.forEach((m: Record<string, unknown>) => {
      const memberId = extractId(m.memberId);
      if (memberId && memberId !== "[object Object]") userIds.add(memberId);

      const assigneeId = extractId(m.assigneeId);
      if (assigneeId && assigneeId !== "[object Object]") userIds.add(assigneeId);
    });

    rawLead.forEach((l: Record<string, unknown>) => {
      const id = extractId(l.id);
      if (id && id !== "[object Object]") userIds.add(id);
    });

    rawManager.forEach((m: Record<string, unknown>) => {
      const id = extractId(m.id);
      if (id && id !== "[object Object]") userIds.add(id);
    });

    const validObjectIds = Array.from(userIds).filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const userDocs =
      validObjectIds.length > 0
        ? await UserModel.find({ _id: { $in: validObjectIds } })
            .select("name email role")
            .lean()
        : [];

    const userMap = new Map<
      string,
      { name: string; email: string; role?: string }
    >();

    userDocs.forEach((u) => {
      userMap.set(u._id.toString(), {
        name: u.name || "Member",
        email: u.email || "",
        role: u.role || "member",
      });
    });

    // Format members with live user details
    const members = rawMembers.map((m: Record<string, unknown>) => {
      const memberId = extractId(m.memberId);
      const assigneeId = extractId(m.assigneeId);
      const user = userMap.get(memberId);
      const assigneeUser = assigneeId ? userMap.get(assigneeId) : undefined;

      return {
        memberId,
        name: user?.name || (m.memberName as string) || "Member",
        email: user?.email || "",
        role: user?.role || "member",
        assigneeId: assigneeId || undefined,
        assigneeName: assigneeUser?.name,
      };
    });

    // Format lead
    const lead = rawLead.map((l: Record<string, unknown>) => {
      const id = extractId(l.id);
      const user = userMap.get(id);
      return {
        id,
        name: user?.name || (l.name as string) || "Lead",
        email: user?.email || "",
      };
    });

    // Format manager
    const manager = rawManager.map((m: Record<string, unknown>) => {
      const id = extractId(m.id);
      const user = userMap.get(id);
      return {
        id,
        name: user?.name || (m.name as string) || "Manager",
        email: user?.email || "",
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: members.length,
        members,
        lead,
        manager,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get stream members API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching stream members.",
        members: [],
      },
      { status: 500 }
    );
  }
}
