import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { TaskModel } from "@/models/tasks.model";

/**
 * Handles starting a new time log session on a task.
 */
export async function startTimeLogHandler(body: {
  taskId: string;
  userId: string;
  startTime?: string | Date;
}) {
  const { taskId, userId, startTime } = body;

  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    return NextResponse.json(
      { success: false, message: "A valid Task ID is required." },
      { status: 400 }
    );
  }

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json(
      { success: false, message: "A valid User ID is required." },
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

  const startDate = startTime ? new Date(startTime) : new Date();

  // Create new time log subdocument
  const newLog = {
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(userId),
    startTime: startDate,
    endTime: null,
    duration: 0,
    isRunning: true,
  };

  task.timeLogs.push(newLog);

  // Automatically update status to in_progress if currently in todo
  if (task.status === "todo") {
    task.status = "in_progress";
  }

  await task.save();

  return NextResponse.json(
    {
      success: true,
      message: "Timer started successfully.",
      data: {
        timeLog: newLog,
        timeLogs: task.timeLogs,
        totalTimeSpent: task.totalTimeSpent || 0,
      },
    },
    { status: 200 }
  );
}

/**
 * Handles stopping an active time log session on a task.
 */
export async function stopTimeLogHandler(body: {
  taskId: string;
  userId?: string;
  timeLogId?: string;
  endTime?: string | Date;
  duration?: number;
}) {
  const { taskId, timeLogId, endTime, duration } = body;

  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    return NextResponse.json(
      { success: false, message: "A valid Task ID is required." },
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

  const stopDate = endTime ? new Date(endTime) : new Date();

  // Find the active running time log
  let targetLog = null;
  if (timeLogId) {
    targetLog = task.timeLogs.find(
      (l) => l._id && l._id.toString() === String(timeLogId)
    );
  }
  if (!targetLog) {
    for (let i = task.timeLogs.length - 1; i >= 0; i--) {
      if (task.timeLogs[i].isRunning) {
        targetLog = task.timeLogs[i];
        break;
      }
    }
  }
  if (!targetLog && task.timeLogs.length > 0) {
    targetLog = task.timeLogs[task.timeLogs.length - 1];
  }

  if (targetLog) {
    targetLog.endTime = stopDate;
    targetLog.isRunning = false;

    const startMillis = new Date(targetLog.startTime).getTime();
    const stopMillis = stopDate.getTime();
    const calculatedSecs = Math.max(0, Math.round((stopMillis - startMillis) / 1000));
    targetLog.duration = duration && duration > 0 ? duration : calculatedSecs;
  }

  // Recalculate totalTimeSpent across all timeLogs
  task.totalTimeSpent = task.timeLogs.reduce(
    (sum, l) => sum + (l.duration || 0),
    0
  );

  await task.save();

  return NextResponse.json(
    {
      success: true,
      message: "Timer stopped successfully.",
      data: {
        timeLog: targetLog,
        timeLogs: task.timeLogs,
        totalTimeSpent: task.totalTimeSpent,
      },
    },
    { status: 200 }
  );
}

/**
 * Handles fetching all timelogs for a specific task.
 */
export async function getTimeLogsHandler(taskId: string) {
  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    return NextResponse.json(
      { success: false, message: "A valid Task ID is required." },
      { status: 400 }
    );
  }

  const task = await TaskModel.findById(taskId)
    .select("timeLogs totalTimeSpent")
    .lean();

  if (!task) {
    return NextResponse.json(
      { success: false, message: "Task not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      timeLogs: task.timeLogs || [],
      totalTimeSpent: task.totalTimeSpent || 0,
    },
    { status: 200 }
  );
}

/**
 * Main API route handlers for /api/tasks/timelog
 */
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    if (body.action === "stop") {
      return await stopTimeLogHandler(body);
    }

    return await startTimeLogHandler(body);
  } catch (error) {
    console.error("Time log API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while saving time log.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    return await stopTimeLogHandler(body);
  } catch (error) {
    console.error("Time log PUT API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while stopping time log.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId") || searchParams.get("id");

    if (!taskId) {
      return NextResponse.json(
        { success: false, message: "Task ID is required." },
        { status: 400 }
      );
    }

    return await getTimeLogsHandler(taskId);
  } catch (error) {
    console.error("Get time logs API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching time logs.",
      },
      { status: 500 }
    );
  }
}
