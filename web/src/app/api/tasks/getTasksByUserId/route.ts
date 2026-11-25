import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { TaskModel } from "@/models/tasks.model";
import UserModel from "@/models/auth.model";
import StreamModel from "@/models/stream.model";

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
    const userId = (
      searchParams.get("userId") ||
      searchParams.get("id")
    )?.trim();
    const orgId = (
      searchParams.get("orgId") ||
      searchParams.get("organisationId")
    )?.trim();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required to fetch assigned tasks.",
          tasks: [],
          categorizedByStream: [],
          categorizedByAssigner: [],
        },
        { status: 400 }
      );
    }

    // 1. Fetch employee profile details
    let employeeDoc = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      employeeDoc = await UserModel.findById(userId)
        .select("name email role status")
        .lean();
    } else {
      employeeDoc = await UserModel.findOne({
        $or: [{ _id: userId }, { email: userId }],
      })
        .select("name email role status")
        .lean();
    }

    // 2. Query tasks assigned to this user
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : null;

    const assignedCondition = userObjectId
      ? { $or: [{ assignedId: userObjectId }, { assignedId: String(userId) }] }
      : { assignedId: String(userId) };

    const filter: Record<string, unknown> = {
      ...assignedCondition,
    };

    if (orgId && orgId !== "undefined" && orgId !== "null") {
      if (mongoose.Types.ObjectId.isValid(orgId)) {
        filter.orgId = {
          $in: [new mongoose.Types.ObjectId(orgId), String(orgId)],
        };
      } else {
        filter.orgId = String(orgId);
      }
    }

    const rawTasks = await TaskModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // 3. Collect unique stream IDs and assigner user IDs
    const streamIds = new Set<string>();
    const assignerUserIds = new Set<string>();

    rawTasks.forEach((t) => {
      const sId = extractId(t.streamId);
      if (sId && sId !== "[object Object]") streamIds.add(sId);

      const uId = extractId(t.userId);
      if (uId && uId !== "[object Object]") assignerUserIds.add(uId);
    });

    // 4. Fetch streams information
    const validStreamObjectIds = Array.from(streamIds).filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const streamDocs =
      validStreamObjectIds.length > 0
        ? await StreamModel.find({
            $or: [
              { _id: { $in: validStreamObjectIds } },
              { _id: { $in: Array.from(streamIds) } },
            ],
          })
            .select("name type description")
            .lean()
        : [];

    const streamMap = new Map<
      string,
      { name: string; type: string; description?: string }
    >();
    streamDocs.forEach((s) => {
      streamMap.set(String(s._id), {
        name: s.name || "Untitled Stream",
        type: s.type || "department",
        description: s.description,
      });
    });

    // 5. Fetch assigner users information
    const validAssignerObjectIds = Array.from(assignerUserIds).filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const assignerDocs =
      validAssignerObjectIds.length > 0
        ? await UserModel.find({
            $or: [
              { _id: { $in: validAssignerObjectIds } },
              { _id: { $in: Array.from(assignerUserIds) } },
            ],
          })
            .select("name email role")
            .lean()
        : [];

    const assignerMap = new Map<
      string,
      { name: string; email?: string; role?: string }
    >();
    assignerDocs.forEach((u) => {
      assignerMap.set(String(u._id), {
        name: u.name || "Assigner",
        email: u.email,
        role: u.role,
      });
    });

    // 6. Format tasks into a standard structure
    const employeeName = employeeDoc?.name || "Employee";

    const tasks = rawTasks.map((t) => {
      const id = String(t._id);
      const rawStreamId = extractId(t.streamId);
      const isDirectTask =
        !rawStreamId || rawStreamId === "null" || rawStreamId === "undefined";
      const sId = isDirectTask ? "" : rawStreamId;
      const uId = extractId(t.userId);
      const streamInfo = isDirectTask ? null : streamMap.get(sId);
      const assignerInfo = assignerMap.get(uId);

      const dueDateStr = t.dueDate
        ? new Date(t.dueDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null;

      const dateStr = t.date
        ? new Date(t.date).toLocaleDateString(undefined, {
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
        description: t.description || "",
        note: t.note || "",
        status: t.status || "todo",
        priority: t.priority || "medium",
        impact: t.impact || "medium",
        recurring: Boolean(t.recurring),
        dueDate: dueDateStr,
        date: dateStr,
        assignedId: userId,
        assigneeName: employeeName,
        streamId: sId,
        streamName: isDirectTask
          ? "Direct Member Tasks (No Stream)"
          : streamInfo?.name || "General Stream",
        streamType: isDirectTask
          ? "direct"
          : streamInfo?.type || "department",
        userId: uId,
        assignerName: assignerInfo?.name || "Assigner",
        assignerEmail: assignerInfo?.email || "",
        assignerRole: assignerInfo?.role || "",
        totalTimeSpent: t.totalTimeSpent || 0,
        timeLogs: Array.isArray(t.timeLogs) ? t.timeLogs : [],
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : undefined,
        updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : undefined,
      };
    });

    // 7. Group tasks by Streams (Direct/Streamless tasks always placed at the bottom)
    const streamGroupsMap = new Map<
      string,
      {
        streamId: string;
        streamName: string;
        streamType: string;
        description?: string;
        tasks: typeof tasks;
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        totalTimeSpent: number;
      }
    >();

    tasks.forEach((task) => {
      const isDirect = !task.streamId;
      const key = isDirect ? "__direct_member_tasks__" : task.streamId;
      if (!streamGroupsMap.has(key)) {
        const streamInfo = isDirect ? null : streamMap.get(key);
        streamGroupsMap.set(key, {
          streamId: isDirect ? "" : key,
          streamName: isDirect
            ? "Direct Member Tasks (No Stream)"
            : streamInfo?.name || task.streamName || "General Stream",
          streamType: isDirect
            ? "direct"
            : streamInfo?.type || task.streamType || "department",
          description: isDirect
            ? "Tasks assigned directly to this member with no stream attached"
            : streamInfo?.description,
          tasks: [],
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          totalTimeSpent: 0,
        });
      }

      const group = streamGroupsMap.get(key)!;
      group.tasks.push(task);
      group.totalTasks += 1;
      if (task.status === "completed") group.completedTasks += 1;
      if (task.status === "in_progress") group.inProgressTasks += 1;
      group.totalTimeSpent += task.totalTimeSpent || 0;
    });

    // 8. Group tasks by Assigners
    const assignerGroupsMap = new Map<
      string,
      {
        assignerId: string;
        assignerName: string;
        assignerEmail?: string;
        assignerRole?: string;
        tasks: typeof tasks;
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        totalTimeSpent: number;
      }
    >();

    tasks.forEach((task) => {
      const key = task.userId || "unassigned_assigner";
      if (!assignerGroupsMap.has(key)) {
        const assignerInfo = assignerMap.get(key);
        assignerGroupsMap.set(key, {
          assignerId: key,
          assignerName:
            assignerInfo?.name || task.assignerName || "Unknown Assigner",
          assignerEmail: assignerInfo?.email || task.assignerEmail,
          assignerRole: assignerInfo?.role || task.assignerRole,
          tasks: [],
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          totalTimeSpent: 0,
        });
      }

      const group = assignerGroupsMap.get(key)!;
      group.tasks.push(task);
      group.totalTasks += 1;
      if (task.status === "completed") group.completedTasks += 1;
      if (task.status === "in_progress") group.inProgressTasks += 1;
      group.totalTimeSpent += task.totalTimeSpent || 0;
    });

    // Sort streams so that direct tasks with no stream appear at the very bottom
    const categorizedByStream = Array.from(streamGroupsMap.values()).sort(
      (a, b) => {
        const aIsDirect = !a.streamId || a.streamType === "direct";
        const bIsDirect = !b.streamId || b.streamType === "direct";
        if (aIsDirect && !bIsDirect) return 1;
        if (!aIsDirect && bIsDirect) return -1;
        return 0;
      }
    );
    const categorizedByAssigner = Array.from(assignerGroupsMap.values());

    return NextResponse.json(
      {
        success: true,
        count: tasks.length,
        employee: employeeDoc
          ? {
              id: String(employeeDoc._id),
              _id: String(employeeDoc._id),
              name: employeeDoc.name,
              email: employeeDoc.email,
              role: employeeDoc.role || "employee",
              status: employeeDoc.status || "active",
            }
          : {
              id: userId,
              _id: userId,
              name: "Employee",
              email: "",
              role: "employee",
              status: "active",
            },
        tasks,
        categorizedByStream,
        categorizedByAssigner,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get tasks by user ID API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching tasks for user.",
        tasks: [],
        categorizedByStream: [],
        categorizedByAssigner: [],
      },
      { status: 500 }
    );
  }
}
