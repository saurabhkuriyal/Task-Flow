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
      searchParams.get("id") ||
      searchParams.get("parentStreamId")
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
          streams: [],
        },
        { status: 400 }
      );
    }

    const streamObjectId = mongoose.Types.ObjectId.isValid(streamId)
      ? new mongoose.Types.ObjectId(streamId)
      : streamId;

    // Filter by type "empTracker" and parentStream matching the passed stream ID
    const filter: Record<string, unknown> = {
      type: "empTracker",
      $or: [
        { "parentStream.parentStreamId": streamObjectId },
        { "parentStream.parentStreamId": String(streamId) },
      ],
    };

    if (orgId && orgId !== "undefined" && orgId !== "null") {
      if (mongoose.Types.ObjectId.isValid(orgId)) {
        filter.organisationId = new mongoose.Types.ObjectId(orgId);
      } else {
        filter.organisationId = orgId;
      }
    }

    const rawStreams = await StreamModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Collect all referenced user IDs to resolve names dynamically
    const userIds = new Set<string>();

    rawStreams.forEach((st) => {
      const s = st as unknown as Record<string, unknown>;

      if (Array.isArray(s.creator)) {
        s.creator.forEach((c: Record<string, unknown>) => {
          const id = extractId(c.userId);
          if (id && id !== "[object Object]") userIds.add(id);
        });
      }

      if (Array.isArray(s.lead)) {
        s.lead.forEach((l: Record<string, unknown>) => {
          const id = extractId(l.id);
          if (id && id !== "[object Object]") userIds.add(id);
        });
      }

      if (Array.isArray(s.manager)) {
        s.manager.forEach((m: Record<string, unknown>) => {
          const id = extractId(m.id);
          if (id && id !== "[object Object]") userIds.add(id);
        });
      }

      if (Array.isArray(s.members)) {
        s.members.forEach((m: Record<string, unknown>) => {
          const id = extractId(m.memberId);
          if (id && id !== "[object Object]") userIds.add(id);
        });
      }
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

    const userMap = new Map<string, string>();
    userDocs.forEach((u) => {
      userMap.set(u._id.toString(), u.name || "User");
    });

    const streams = rawStreams.map((st) => {
      const s = st as unknown as Record<string, unknown>;
      const id = s._id ? String(s._id) : "";

      return {
        ...s,
        id,
        _id: id,
        creator: Array.isArray(s.creator)
          ? s.creator.map((c: Record<string, unknown>) => {
              const uid = extractId(c.userId);
              return {
                userId: uid,
                name: userMap.get(uid) || (c.name as string) || "Creator",
              };
            })
          : [],
        lead: Array.isArray(s.lead)
          ? s.lead.map((l: Record<string, unknown>) => {
              const lid = extractId(l.id);
              return {
                id: lid,
                name: userMap.get(lid) || (l.name as string) || "Employee",
              };
            })
          : [],
        manager: Array.isArray(s.manager)
          ? s.manager.map((m: Record<string, unknown>) => {
              const mid = extractId(m.id);
              return {
                id: mid,
                name: userMap.get(mid) || (m.name as string) || "Manager",
              };
            })
          : [],
        members: Array.isArray(s.members)
          ? s.members.map((m: Record<string, unknown>) => {
              const mid = extractId(m.memberId);
              return {
                memberId: mid,
                memberName:
                  userMap.get(mid) || (m.memberName as string) || "Member",
                assigneeId: (m.assigneeId as string) || undefined,
              };
            })
          : [],
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: streams.length,
        streams,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get specific employee streams API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching employee tracker streams.",
        streams: [],
      },
      { status: 500 }
    );
  }
}
