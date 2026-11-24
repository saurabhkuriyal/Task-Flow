import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import { getTimeLogsHandler } from "@/app/api/tasks/timelog/route";

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
    console.error("Timer logs API error:", error);
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
