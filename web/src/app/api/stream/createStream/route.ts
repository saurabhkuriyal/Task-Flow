import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { StreamModel } from "@/models/stream.model";
import { OrganizationModel } from "@/models/organization.model";
import UserModel from "@/models/auth.model";
import { verifyToken } from "@/lib/auth";

export interface CreateStreamRequestBody {
  name?: string;
  description?: string;
  organisationId?: string;
  organisationName?: string;
  creatorId?: string;
  creatorName?: string;
  leadId?: string;
  leadName?: string;
  type?: "department" | "project" | "empTracker";
  subStreamId?: string;
  subStreamName?: string;
  substreamId?: string;
  substreamName?: string;
  parentStreamId?: string;
  parentStreamName?: string;
}

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body: CreateStreamRequestBody = await req.json();

    // 1. Validate stream name
    const streamName = body.name?.trim();
    if (!streamName) {
      return NextResponse.json(
        {
          success: false,
          message: "Stream name is required.",
        },
        { status: 400 }
      );
    }

    // 2. Validate stream type
    const validTypes = ["department", "project", "empTracker"] as const;
    const streamType =
      body.type && validTypes.includes(body.type) ? body.type : "department";

    // 3. Resolve creator information
    let creatorId = body.creatorId?.trim() || "";

    if (!creatorId) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (token) {
          const { payload } = await verifyToken(token);
          if (
            payload?.id &&
            typeof payload.id === "string" &&
            payload.id !== "[object Object]"
          ) {
            creatorId = payload.id;
          }
        }
      } catch {
        // Token verification failed or not provided; continue with resolved creator
      }
    }

    const creator = creatorId ? [{ userId: creatorId }] : [];

    // 4. Resolve lead information
    const lead = body.leadId?.trim() ? [{ id: body.leadId.trim() }] : [];

    // 5. Resolve members
    // For empTracker, include the tracked employee as an initial member
    const members =
      streamType === "empTracker" && body.leadId?.trim()
        ? [{ memberId: body.leadId.trim() }]
        : [];

    // 5b. Resolve parentStream and substream
    const parentStreamId = body.parentStreamId?.trim();
    const parentStream = parentStreamId ? [{ parentStreamId }] : [];

    const subStreamId = (body.subStreamId || body.substreamId)?.trim();
    const substream = subStreamId
      ? [
          {
            streamId: subStreamId,
            ...(creatorId ? { creatorId } : {}),
          },
        ]
      : [];

    // 6. Create stream in database
    const newStream = await StreamModel.create({
      name: streamName,
      type: streamType,
      description: body.description?.trim() || "",
      organisationId: body.organisationId?.trim() || "",
      creator,
      lead,
      manager: [],
      members,
      substream,
      parentStream,
    });

    // 6b. If parentStreamId is provided, link this new stream as a substream in parent
    if (parentStreamId) {
      try {
        const parentFilter = mongoose.Types.ObjectId.isValid(parentStreamId)
          ? { _id: new mongoose.Types.ObjectId(parentStreamId) }
          : { _id: parentStreamId };

        await StreamModel.updateOne(parentFilter, {
          $addToSet: {
            substream: {
              streamId: newStream._id.toString(),
              ...(creatorId ? { creatorId } : {}),
            },
          },
        });
      } catch (parentErr) {
        console.warn("Failed to update parent stream's substreams:", parentErr);
      }
    }

    // 7. Optional synchronization with OrganizationModel if organisationId is provided
    if (body.organisationId?.trim()) {
      try {
        const orgId = body.organisationId.trim();
        const orgFilter = mongoose.Types.ObjectId.isValid(orgId)
          ? { _id: new mongoose.Types.ObjectId(orgId) }
          : { _id: orgId };

        if (streamType === "department") {
          await OrganizationModel.updateOne(orgFilter, {
            $push: {
              streams: {
                streamId: newStream._id.toString(),
              },
            },
          });
        } else if (streamType === "project") {
          await OrganizationModel.updateOne(orgFilter, {
            $push: {
              projects: {
                projectId: newStream._id.toString(),
              },
            },
          });
        }
      } catch (orgError) {
        console.warn("Failed to synchronize stream to organization:", orgError);
      }
    }

    // 8. Update UserModel: add stream ID to user's streams array
    const usersToUpdate = new Set<string>();
    if (creatorId) usersToUpdate.add(creatorId);
    if (body.leadId?.trim()) usersToUpdate.add(body.leadId.trim());

    for (const uId of usersToUpdate) {
      try {
        const userFilter = mongoose.Types.ObjectId.isValid(uId)
          ? { _id: new mongoose.Types.ObjectId(uId) }
          : { _id: uId };

        await UserModel.updateOne(userFilter, {
          $addToSet: {
            streams: {
              streamId: newStream._id.toString(),
            },
          },
        });
      } catch (userErr) {
        console.warn(`Failed to update streams array for user ${uId}:`, userErr);
      }
    }

    const readableType =
      streamType === "empTracker"
        ? "Employee tracker"
        : streamType.charAt(0).toUpperCase() + streamType.slice(1);

    return NextResponse.json(
      {
        success: true,
        message: `${readableType} created successfully!`,
        data: newStream,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create stream API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while creating the stream.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const orgId =
      searchParams.get("organisationId") || searchParams.get("orgId");
    const type = searchParams.get("type");

    const query: Record<string, unknown> = {};

    if (orgId && orgId !== "undefined" && orgId !== "null") {
      query.organisationId = orgId;
    }

    if (type && type !== "undefined" && type !== "null") {
      query.type = type;
    }

    const streams = await StreamModel.find(query).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        streams,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch streams API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch streams.",
        streams: [],
      },
      { status: 500 }
    );
  }
}
