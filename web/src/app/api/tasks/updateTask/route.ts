import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { TaskModel } from "@/models/tasks.model";
import { autoCreateRecurringTask } from "@/utils/recurringTask";

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { taskId, id, ...updates } = body;
    const targetTaskId = taskId || id;

    if (!targetTaskId || !mongoose.Types.ObjectId.isValid(targetTaskId)) {
      return NextResponse.json(
        { success: false, message: "Valid Task ID is required." },
        { status: 400 }
      );
    }

    const task = await TaskModel.findById(targetTaskId);
    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task not found." },
        { status: 404 }
      );
    }

    const isTransitioningToCompleted =
      updates.status === "completed" && task.status !== "completed";

    if (updates.taskname !== undefined) {
      const trimmedName = String(updates.taskname).trim();
      if (!trimmedName) {
        return NextResponse.json(
          { success: false, message: "Task name cannot be empty." },
          { status: 400 }
        );
      }
      task.taskname = trimmedName;
    }
    if (updates.description !== undefined) task.description = String(updates.description).trim();
    if (updates.status !== undefined) task.status = updates.status;
    if (updates.priority !== undefined) task.priority = updates.priority;
    if (updates.impact !== undefined) task.impact = updates.impact;
    if (updates.recurring !== undefined) task.recurring = Boolean(updates.recurring);
    if (updates.note !== undefined) task.note = String(updates.note).trim();

    if (updates.dueDate !== undefined) {
      task.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    }

    if (updates.assignedId !== undefined) {
      task.assignedId =
        updates.assignedId && mongoose.Types.ObjectId.isValid(updates.assignedId)
          ? new mongoose.Types.ObjectId(updates.assignedId)
          : null;
    }

    if (updates.streamId !== undefined) {
      task.streamId =
        updates.streamId && mongoose.Types.ObjectId.isValid(updates.streamId)
          ? new mongoose.Types.ObjectId(updates.streamId)
          : null;
    }

    let autoCreatedTask = null;

    // When a recurring task is completed, auto-create the next iteration in the database
    if (isTransitioningToCompleted && task.recurring) {
      autoCreatedTask = await autoCreateRecurringTask(task);
      // Mark original completed task as non-recurring so only the new task is active
      task.recurring = false;
    }

    await task.save();

    return NextResponse.json(
      {
        success: true,
        message: autoCreatedTask
          ? "Task completed and next recurring task auto-created successfully."
          : "Task updated successfully.",
        data: task,
        autoCreatedTask,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update task API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while updating task.",
      },
      { status: 500 }
    );
  }
}
