import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { TaskModel } from "@/models/tasks.model";

export async function DELETE(req: Request) {
  try {
    await dbConnect();

    let taskId: string | null = null;
    try {
      const body = await req.json();
      taskId = body?.taskId || body?.id || null;
    } catch {
      // Request body may be omitted when taskId is sent as a query parameter
    }

    if (!taskId) {
      const { searchParams } = new URL(req.url);
      taskId = searchParams.get("taskId") || searchParams.get("id");
    }

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json(
        { success: false, message: "Valid Task ID is required." },
        { status: 400 }
      );
    }

    const deletedTask = await TaskModel.findByIdAndDelete(taskId);
    if (!deletedTask) {
      return NextResponse.json(
        { success: false, message: "Task not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Task deleted successfully.",
        data: deletedTask,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete task API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while deleting task.",
      },
      { status: 500 }
    );
  }
}
