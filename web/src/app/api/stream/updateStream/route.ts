import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { StreamModel } from "@/models/stream.model";
import { UserModel } from "@/models/auth.model";

export interface UpdateStreamRequestBody {
  streamId?: string;
  lead?: { id: string; name?: string };
  manager?: { id: string; name?: string };
  member?: { memberId: string; memberName?: string };
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

    const streamObjectId = mongoose.Types.ObjectId.isValid(streamId)
      ? new mongoose.Types.ObjectId(streamId)
      : streamId;

    const filter = { _id: streamObjectId };
    const addToSet: Record<string, unknown> = {};

    let userSyncPromise: Promise<unknown> | null = null;

    if (body.lead && body.lead.id) {
      const leadIdStr = String(body.lead.id).trim();
      if (mongoose.Types.ObjectId.isValid(leadIdStr)) {
        const leadObjectId = new mongoose.Types.ObjectId(leadIdStr);
        addToSet.lead = { id: leadObjectId };
        userSyncPromise = UserModel.findByIdAndUpdate(leadObjectId, {
          $addToSet: { ledOf: { streamId: streamObjectId } },
        });
      }
    }

    if (body.manager && body.manager.id) {
      const managerIdStr = String(body.manager.id).trim();
      if (mongoose.Types.ObjectId.isValid(managerIdStr)) {
        const managerObjectId = new mongoose.Types.ObjectId(managerIdStr);
        addToSet.manager = { id: managerObjectId };
        userSyncPromise = UserModel.findByIdAndUpdate(managerObjectId, {
          $addToSet: { managerOf: { streamId: streamObjectId } },
        });
      }
    }

    if (body.member && body.member.memberId) {
      const memberIdStr = String(body.member.memberId).trim();
      if (mongoose.Types.ObjectId.isValid(memberIdStr)) {
        const memberObjectId = new mongoose.Types.ObjectId(memberIdStr);
        addToSet.members = { memberId: memberObjectId };
        userSyncPromise = UserModel.findByIdAndUpdate(memberObjectId, {
          $addToSet: { streams: { streamId: streamObjectId } },
        });
      }
    }

    const updateQuery =
      Object.keys(addToSet).length > 0 ? { $addToSet: addToSet } : {};

    const [updatedStream] = await Promise.all([
      StreamModel.findOneAndUpdate(filter, updateQuery, { new: true }),
      userSyncPromise,
    ]);

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
