import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import { startTimeLogHandler } from "@/app/api/tasks/timelog/route";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    return await startTimeLogHandler(body);
  } catch (error) {
    console.error("Timer start API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while starting timer.",
      },
      { status: 500 }
    );
  }
}
