import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { TaskModel } from "@/models/tasks.model";
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
      searchParams.get("organisationId")
    )?.trim();

    if (!streamId) {
      return NextResponse.json(
        {
          success: false,
          message: "Stream ID is required.",
          tasks: [],
        },
        { status: 400 }
      );
    }

    const streamObjectId = mongoose.Types.ObjectId.isValid(streamId)
      ? new mongoose.Types.ObjectId(streamId)
      : streamId;

    const filter: Record<string, unknown> = {
      $or: [
        { streamId: streamObjectId },
        { streamId: String(streamId) },
      ],
    };

    if (orgId && orgId !== "undefined" && orgId !== "null") {
      if (mongoose.Types.ObjectId.isValid(orgId)) {
        filter.orgId = new mongoose.Types.ObjectId(orgId);
      } else {
        filter.orgId = orgId;
      }
    }

    const rawTasks = await TaskModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Collect all referenced user IDs (assignee and assigner)
    const userIds = new Set<string>();

    rawTasks.forEach((t) => {
      const uId = extractId(t.userId);
      if (uId && uId !== "[object Object]") userIds.add(uId);

      const aId = extractId(t.assignedId);
      if (aId && aId !== "[object Object]") userIds.add(aId);
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

    const tasks = rawTasks.map((t) => {
      const id = String(t._id);
      const aId = extractId(t.assignedId);
      const uId = extractId(t.userId);

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
        assigneeName: aId ? userMap.get(aId) || "Member" : "Unassigned",
        assignerName: uId ? userMap.get(uId) || "User" : "Assigner",
        dueDate: dueDateStr,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: tasks.length,
        tasks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get tasks by stream API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching stream tasks.",
        tasks: [],
      },
      { status: 500 }
    );
  }
}
