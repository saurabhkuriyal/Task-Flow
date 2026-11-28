import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { TaskModel } from "@/models/tasks.model";
import { OrganizationModel } from "@/models/organization.model";
import StreamModel from "@/models/stream.model";
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
    const orgId = (
      searchParams.get("orgId") ||
      searchParams.get("organisationId") ||
      searchParams.get("organizationId")
    )?.trim();
    const statusFilter = searchParams.get("status")?.trim();
    const priorityFilter = searchParams.get("priority")?.trim();
    const directOnly = searchParams.get("directOnly") === "true";

    if (!orgId || orgId === "undefined" || orgId === "null") {
      return NextResponse.json(
        {
          success: false,
          message: "Organization ID is required.",
          count: 0,
          directTasksCount: 0,
          streamTasksCount: 0,
          tasks: [],
        },
        { status: 400 }
      );
    }

    // Resolve organization ObjectId/string combinations
    const orgIdValues: (string | mongoose.Types.ObjectId)[] = [orgId];
    if (mongoose.Types.ObjectId.isValid(orgId)) {
      orgIdValues.push(new mongoose.Types.ObjectId(orgId));
    } else {
      try {
        const orgDoc = await OrganizationModel.findOne({
          $or: [{ _id: orgId }, { organizationName: decodeURIComponent(orgId) }],
        })
          .select("_id")
          .lean();
        if (orgDoc?._id) {
          orgIdValues.push(orgDoc._id, String(orgDoc._id));
        }
      } catch (err) {
        console.warn("Failed to lookup org by name in getTasksByOrg:", err);
      }
    }

    const filter: Record<string, unknown> = {
      orgId: { $in: orgIdValues },
    };

    if (statusFilter && statusFilter !== "all") {
      filter.status = statusFilter;
    }

    if (priorityFilter && priorityFilter !== "all") {
      filter.priority = priorityFilter;
    }

    if (directOnly) {
      filter.$or = [{ streamId: null }, { streamId: { $exists: false } }];
    }

    const rawTasks = await TaskModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Collect referenced user IDs and stream IDs
    const userIds = new Set<string>();
    const streamIds = new Set<string>();

    rawTasks.forEach((t) => {
      const uId = extractId(t.userId);
      if (uId && uId !== "[object Object]") userIds.add(uId);

      const aId = extractId(t.assignedId);
      if (aId && aId !== "[object Object]") userIds.add(aId);

      const sId = extractId(t.streamId);
      if (sId && sId !== "[object Object]" && sId !== "null") {
        streamIds.add(sId);
      }
    });

    const validUserObjectIds = Array.from(userIds).filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );
    const validStreamObjectIds = Array.from(streamIds).filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const [userDocs, streamDocs] = await Promise.all([
      validUserObjectIds.length > 0
        ? UserModel.find({ _id: { $in: validUserObjectIds } })
            .select("name email role")
            .lean()
        : Promise.resolve([]),
      validStreamObjectIds.length > 0
        ? StreamModel.find({ _id: { $in: validStreamObjectIds } })
            .select("name type")
            .lean()
        : Promise.resolve([]),
    ]);

    const userMap = new Map<string, string>();
    userDocs.forEach((u) => {
      userMap.set(u._id.toString(), u.name || "User");
    });

    const streamMap = new Map<string, { name: string; type: string }>();
    streamDocs.forEach((s) => {
      streamMap.set(s._id.toString(), {
        name: s.name || "Stream",
        type: s.type || "department",
      });
    });

    let directTasksCount = 0;
    let streamTasksCount = 0;

    const tasks = rawTasks.map((t) => {
      const id = String(t._id);
      const aId = extractId(t.assignedId);
      const uId = extractId(t.userId);
      const sId = extractId(t.streamId);
      const isDirect = !sId || sId === "null" || sId === "undefined";

      if (isDirect) {
        directTasksCount += 1;
      } else {
        streamTasksCount += 1;
      }

      const streamInfo = isDirect ? null : streamMap.get(sId);

      const dueDateStr = t.dueDate
        ? new Date(t.dueDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null;

      return {
        ...t,
        id,
        _id: id,
        taskname: t.taskname,
        title: t.taskname,
        streamId: isDirect ? "" : sId,
        streamName: isDirect
          ? "Direct Member Task"
          : streamInfo?.name || "Stream",
        streamType: isDirect ? "direct" : streamInfo?.type || "department",
        assignedId: aId || null,
        assigneeName: aId ? userMap.get(aId) || "Member" : "Unassigned",
        userId: uId,
        assignerName: uId ? userMap.get(uId) || "User" : "Assigner",
        dueDate: dueDateStr,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: tasks.length,
        directTasksCount,
        streamTasksCount,
        tasks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get tasks by organization API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching organization tasks.",
        count: 0,
        directTasksCount: 0,
        streamTasksCount: 0,
        tasks: [],
      },
      { status: 500 }
    );
  }
}
