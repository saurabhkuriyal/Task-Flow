import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { StreamModel } from "@/models/stream.model";

export interface UpdateStreamRequestBody {
  streamId?: string;
  lead?: { id: string; name: string };
  manager?: { id: string; name: string };
  member?: { memberId: string; memberName: string };
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body: UpdateStreamRequestBody = await req.json();
    const streamId = body.streamId?.trim();

    if (!streamId) {
      return NextResponse.json(
        {
          success: false,
          message: "Stream ID is required.",
        },
        { status: 400 }
      );
    }

    const filter = mongoose.Types.ObjectId.isValid(streamId)
      ? { _id: new mongoose.Types.ObjectId(streamId) }
      : { _id: streamId };

    const addToSet: Record<string, unknown> = {};

    if (body.lead && body.lead.id && body.lead.name) {
      addToSet.lead = {
        id: String(body.lead.id).trim(),
        name: String(body.lead.name).trim(),
      };
    }

    if (body.manager && body.manager.id && body.manager.name) {
      addToSet.manager = {
        id: String(body.manager.id).trim(),
        name: String(body.manager.name).trim(),
      };
    }

    if (body.member && body.member.memberId && body.member.memberName) {
      addToSet.members = {
        memberId: String(body.member.memberId).trim(),
        memberName: String(body.member.memberName).trim(),
      };
    }

    const updateQuery = Object.keys(addToSet).length > 0 ? { $addToSet: addToSet } : {};

    const updatedStream = await StreamModel.findOneAndUpdate(
      filter,
      updateQuery,
      { new: true }
    );

    if (!updatedStream) {
      return NextResponse.json(
        {
          success: false,
          message: "Stream not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Stream updated successfully!",
        data: updatedStream,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update stream API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while updating the stream.",
      },
      { status: 500 }
    );
  }
}
