import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { TaskModel, type ITask } from "@/models/tasks.model";
import { autoCreateRecurringTask } from "@/utils/recurringTask";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json().catch(() => ({}));
    const { taskId, orgId, streamId } = body;

    // 1. Single Task Cloned on Demand
    if (taskId) {
      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return NextResponse.json(
          { success: false, message: "Invalid Task ID provided." },
          { status: 400 }
        );
      }

      const task = await TaskModel.findById(taskId);
      if (!task) {
        return NextResponse.json(
          { success: false, message: "Task not found." },
          { status: 404 }
        );
      }

      const newClonedTask = await autoCreateRecurringTask(task);

      return NextResponse.json(
        {
          success: true,
          message: "Recurring task cloned and created successfully.",
          task: newClonedTask,
        },
        { status: 201 }
      );
    }

    // 2. Batch Creation by Org / Stream for tasks with recurring: true
    const filter: Record<string, unknown> = {
      recurring: true,
    };

    if (orgId && mongoose.Types.ObjectId.isValid(orgId)) {
      filter.orgId = new mongoose.Types.ObjectId(orgId);
    }

    if (streamId && mongoose.Types.ObjectId.isValid(streamId)) {
      filter.streamId = new mongoose.Types.ObjectId(streamId);
    }

    const tasksToClone = await TaskModel.find(filter);

    if (tasksToClone.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No recurring tasks found matching criteria.",
          count: 0,
          tasks: [],
        },
        { status: 200 }
      );
    }

    const createdTasks: ITask[] = [];

    for (const t of tasksToClone) {
      const copy = await autoCreateRecurringTask(t);
      createdTasks.push(copy);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully auto-created ${createdTasks.length} recurring tasks.`,
        count: createdTasks.length,
        tasks: createdTasks,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("autoCreateRecurring API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while auto-creating recurring tasks.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");
    const orgId = searchParams.get("orgId");
    const streamId = searchParams.get("streamId");

    // Route GET through identical handler logic
    if (taskId) {
      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return NextResponse.json(
          { success: false, message: "Invalid Task ID provided." },
          { status: 400 }
        );
      }

      const task = await TaskModel.findById(taskId);
      if (!task) {
        return NextResponse.json(
          { success: false, message: "Task not found." },
          { status: 404 }
        );
      }

      const newClonedTask = await autoCreateRecurringTask(task);

      return NextResponse.json(
        {
          success: true,
          message: "Recurring task cloned and created successfully.",
          task: newClonedTask,
        },
        { status: 201 }
      );
    }

    const filter: Record<string, unknown> = {
      recurring: true,
    };

    if (orgId && mongoose.Types.ObjectId.isValid(orgId)) {
      filter.orgId = new mongoose.Types.ObjectId(orgId);
    }

    if (streamId && mongoose.Types.ObjectId.isValid(streamId)) {
      filter.streamId = new mongoose.Types.ObjectId(streamId);
    }

    const tasksToClone = await TaskModel.find(filter);
    const createdTasks: ITask[] = [];

    for (const t of tasksToClone) {
      const copy = await autoCreateRecurringTask(t);
      createdTasks.push(copy);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully auto-created ${createdTasks.length} recurring tasks.`,
        count: createdTasks.length,
        tasks: createdTasks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("autoCreateRecurring GET error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while processing recurring tasks.",
      },
      { status: 500 }
    );
  }
}
