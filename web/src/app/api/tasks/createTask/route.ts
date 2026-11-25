import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { TaskModel } from "@/models/tasks.model";
import UserModel from "@/models/auth.model";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const {
      taskname,
      orgId,
      streamId,
      userId,
      status,
      priority,
      impact,
      recurring,
      dueDate,
      note,
      description,
      assignedId,
      parentTask,
    } = body;

    // 1. Validate required fields
    if (!taskname || typeof taskname !== "string" || !taskname.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Task name is required.",
        },
        { status: 400 }
      );
    }

    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid Organization ID is required.",
        },
        { status: 400 }
      );
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid User ID (assigner) is required.",
        },
        { status: 400 }
      );
    }

    // 2. Prepare task document
    const streamObjectId =
      streamId && mongoose.Types.ObjectId.isValid(streamId)
        ? new mongoose.Types.ObjectId(streamId)
        : null;

    const assignedObjectId =
      assignedId && mongoose.Types.ObjectId.isValid(assignedId)
        ? new mongoose.Types.ObjectId(assignedId)
        : null;

    const parentTaskObjectId =
      parentTask && mongoose.Types.ObjectId.isValid(parentTask)
        ? new mongoose.Types.ObjectId(parentTask)
        : null;

    const newTask = await TaskModel.create({
      taskname: taskname.trim(),
      orgId: new mongoose.Types.ObjectId(orgId),
      streamId: streamObjectId,
      userId: new mongoose.Types.ObjectId(userId),
      status: status || "todo",
      priority: priority || "medium",
      impact: impact || "medium",
      recurring: Boolean(recurring),
      date: new Date(),
      dueDate: dueDate ? new Date(dueDate) : null,
      note: note ? String(note).trim() : "",
      description: description ? String(description).trim() : "",
      assignedId: assignedObjectId,
      parentTask: parentTaskObjectId,
      subtaskId: [],
    });

    // 3. Resolve user names for frontend consistency
    let assigneeName = "Unassigned";
    let assignerName = "User";

    const userIdsToLookup = [newTask.userId];
    if (assignedObjectId) userIdsToLookup.push(assignedObjectId);

    const userDocs = await UserModel.find({
      _id: { $in: userIdsToLookup },
    })
      .select("name email")
      .lean();

    userDocs.forEach((u) => {
      const uid = u._id.toString();
      if (uid === newTask.userId.toString()) {
        assignerName = u.name || "User";
      }
      if (assignedObjectId && uid === assignedObjectId.toString()) {
        assigneeName = u.name || "Member";
      }
    });

    const formattedTask = {
      ...newTask.toObject(),
      id: String(newTask._id),
      _id: String(newTask._id),
      title: newTask.taskname,
      assigneeName,
      assignerName,
      dueDate: newTask.dueDate
        ? newTask.dueDate.toISOString().split("T")[0]
        : null,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully!",
        data: formattedTask,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create task API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while creating the task.",
      },
      { status: 500 }
    );
  }
}
