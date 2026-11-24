import { NextResponse } from "next/server";
import dbConnect from "@/utils/db";
import { stopTimeLogHandler } from "@/app/api/tasks/timelog/route";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    return await stopTimeLogHandler(body);
  } catch (error) {
    console.error("Timer stop API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while stopping timer.",
      },
      { status: 500 }
    );
  }
}
