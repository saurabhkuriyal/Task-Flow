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
      searchParams.get("id") ||
      searchParams.get("streamId")
    )?.trim();

    if (!streamId) {
      return NextResponse.json(
        {
          success: false,
          message: "Stream ID is required.",
          stream: null,
          streams: [],
        },
        { status: 400 }
      );
    }

    // 1. Find stream by ID (or fallback by name)
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
          stream: null,
          streams: [],
        },
        { status: 404 }
      );
    }

    // 2. Resolve referenced user names dynamically
    const userIds = new Set<string>();

    const rawStream = stream as unknown as Record<string, unknown>;

    if (Array.isArray(rawStream.creator)) {
      rawStream.creator.forEach((c: Record<string, unknown>) => {
        const id = extractId(c.userId);
        if (id && id !== "[object Object]") userIds.add(id);
      });
    }

    if (Array.isArray(rawStream.lead)) {
      rawStream.lead.forEach((l: Record<string, unknown>) => {
        const id = extractId(l.id);
        if (id && id !== "[object Object]") userIds.add(id);
      });
    }

    if (Array.isArray(rawStream.manager)) {
      rawStream.manager.forEach((m: Record<string, unknown>) => {
        const id = extractId(m.id);
        if (id && id !== "[object Object]") userIds.add(id);
      });
    }

    if (Array.isArray(rawStream.members)) {
      rawStream.members.forEach((m: Record<string, unknown>) => {
        const id = extractId(m.memberId);
        if (id && id !== "[object Object]") userIds.add(id);
      });
    }

    const validObjectIds = Array.from(userIds).filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const userDocs =
      validObjectIds.length > 0
        ? await UserModel.find({ _id: { $in: validObjectIds } })
            .select("name email")
            .lean()
        : [];

    const userMap = new Map<string, string>();
    userDocs.forEach((u) => {
      userMap.set(u._id.toString(), u.name);
    });

    // 3. Format formattedStream with live names for frontend consumption
    const formattedStream = {
      ...rawStream,
      id: rawStream._id ? String(rawStream._id) : streamId,
      _id: rawStream._id ? String(rawStream._id) : streamId,
      creator: Array.isArray(rawStream.creator)
        ? rawStream.creator.map((c: Record<string, unknown>) => {
            const id = extractId(c.userId);
            return {
              userId: id,
              name: userMap.get(id) || (c.name as string) || "Creator",
            };
          })
        : [],
      lead: Array.isArray(rawStream.lead)
        ? rawStream.lead.map((l: Record<string, unknown>) => {
            const id = extractId(l.id);
            return {
              id,
              name: userMap.get(id) || (l.name as string) || "Lead",
            };
          })
        : [],
      manager: Array.isArray(rawStream.manager)
        ? rawStream.manager.map((m: Record<string, unknown>) => {
            const id = extractId(m.id);
            return {
              id,
              name: userMap.get(id) || (m.name as string) || "Manager",
            };
          })
        : [],
      members: Array.isArray(rawStream.members)
        ? rawStream.members.map((m: Record<string, unknown>) => {
            const id = extractId(m.memberId);
            return {
              memberId: id,
              memberName: userMap.get(id) || (m.memberName as string) || "Member",
              assigneeId: (m.assigneeId as string) || undefined,
            };
          })
        : [],
    };

    return NextResponse.json(
      {
        success: true,
        stream: formattedStream,
        streams: [formattedStream],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get stream by ID API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching the stream.",
        stream: null,
        streams: [],
      },
      { status: 500 }
    );
  }
}
