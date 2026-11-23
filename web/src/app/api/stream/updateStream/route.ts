import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { StreamModel } from "@/models/stream.model";
import { OrganizationModel } from "@/models/organization.model";
import UserModel from "@/models/auth.model";

export interface UpdateStreamRequestBody {
  streamId?: string;
  name?: string;
  description?: string;
  leadId?: string;
  lead?: { id: string; name?: string };
  managerId?: string;
  manager?: { id: string; name?: string };
  memberId?: string;
  member?: { memberId: string; memberName?: string; assigneeId?: string };
  removeMemberId?: string;
  subStreamId?: string;
  parentStreamId?: string;
}

function extractId(val: unknown): string {
  if (!val) return "";
  if (typeof val === "object" && val !== null && "_id" in val) {
    return String((val as { _id?: unknown })._id || "");
  }
  return String(val);
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

    const filter = mongoose.Types.ObjectId.isValid(streamId)
      ? { _id: new mongoose.Types.ObjectId(streamId) }
      : { _id: streamId };

    // 1. Fetch current stream to manage lead/manager replacements
    const existingStream = await StreamModel.findOne(filter).lean();
    if (!existingStream) {
      return NextResponse.json(
        {
          success: false,
          message: "Stream not found.",
        },
        { status: 404 }
      );
    }

    const setFields: Record<string, unknown> = {};
    const addToSetFields: Record<string, unknown> = {};
    const pullFields: Record<string, unknown> = {};
    const userSyncPromises: Promise<unknown>[] = [];

    // 2. Stream basic fields
    if (typeof body.name === "string" && body.name.trim()) {
      setFields.name = body.name.trim();
    }
    if (typeof body.description === "string") {
      setFields.description = body.description.trim();
    }

    // 3. Lead update (replaces lead array with single primary lead)
    const leadIdRaw = (body.leadId || body.lead?.id)?.trim();
    if (leadIdRaw && mongoose.Types.ObjectId.isValid(leadIdRaw)) {
      const leadObjectId = new mongoose.Types.ObjectId(leadIdRaw);

      // Remove stream reference from previous lead if changed
      const oldLeadId = existingStream.lead?.[0]?.id
        ? extractId(existingStream.lead[0].id)
        : "";

      if (oldLeadId === leadIdRaw) {
        return NextResponse.json(
          {
            success: false,
            message: "This user is already the lead of this stream.",
          },
          { status: 400 }
        );
      }

      setFields.lead = [{ id: leadObjectId }];

      if (oldLeadId && oldLeadId !== leadIdRaw && mongoose.Types.ObjectId.isValid(oldLeadId)) {
        userSyncPromises.push(
          UserModel.findByIdAndUpdate(oldLeadId, {
            $pull: { ledOf: { streamId: streamObjectId } },
          })
        );
      }

      // Add stream reference to new lead
      userSyncPromises.push(
        UserModel.findByIdAndUpdate(leadObjectId, {
          $addToSet: {
            ledOf: {
              streamId: streamObjectId,
              organisationId: existingStream.organisationId,
            },
            streams: { streamId: streamObjectId },
          },
        })
      );
    }

    // 4. Manager update (replaces manager array with single primary manager)
    const managerIdRaw = (body.managerId || body.manager?.id)?.trim();
    if (managerIdRaw && mongoose.Types.ObjectId.isValid(managerIdRaw)) {
      const managerObjectId = new mongoose.Types.ObjectId(managerIdRaw);

      // Remove stream reference from previous manager if changed
      const oldManagerId = existingStream.manager?.[0]?.id
        ? extractId(existingStream.manager[0].id)
        : "";

      if (oldManagerId === managerIdRaw) {
        return NextResponse.json(
          {
            success: false,
            message: "This user is already the manager of this stream.",
          },
          { status: 400 }
        );
      }

      setFields.manager = [{ id: managerObjectId }];

      if (
        oldManagerId &&
        oldManagerId !== managerIdRaw &&
        mongoose.Types.ObjectId.isValid(oldManagerId)
      ) {
        userSyncPromises.push(
          UserModel.findByIdAndUpdate(oldManagerId, {
            $pull: { managerOf: { streamId: streamObjectId } },
          })
        );
      }

      // Add stream reference to new manager
      userSyncPromises.push(
        UserModel.findByIdAndUpdate(managerObjectId, {
          $addToSet: {
            managerOf: {
              streamId: streamObjectId,
              organisationId: existingStream.organisationId,
            },
            streams: { streamId: streamObjectId },
          },
        })
      );
    }

    // 5. Member update (add member with clean ObjectId reference & auto-create Employee Tracker)
    const memberIdRaw = (body.memberId || body.member?.memberId)?.trim();
    if (memberIdRaw && mongoose.Types.ObjectId.isValid(memberIdRaw)) {
      const memberObjectId = new mongoose.Types.ObjectId(memberIdRaw);

      // Check if member already exists in this stream
      const isAlreadyMember =
        Array.isArray(existingStream.members) &&
        existingStream.members.some((m) => {
          const existingId = extractId(m.memberId);
          return existingId === memberIdRaw;
        });

      if (isAlreadyMember) {
        return NextResponse.json(
          {
            success: false,
            message: "This member is already added to this stream.",
          },
          { status: 400 }
        );
      }

      const memberObj: Record<string, unknown> = { memberId: memberObjectId };

      const assigneeIdRaw = body.member?.assigneeId?.trim();
      if (assigneeIdRaw && mongoose.Types.ObjectId.isValid(assigneeIdRaw)) {
        memberObj.assigneeId = new mongoose.Types.ObjectId(assigneeIdRaw);
      }

      addToSetFields.members = memberObj;

      userSyncPromises.push(
        UserModel.findByIdAndUpdate(memberObjectId, {
          $addToSet: { streams: { streamId: streamObjectId } },
        })
      );

      // Auto-create an Employee Tracker stream for this member if one doesn't exist under this stream
      try {
        const existingTracker = await StreamModel.findOne({
          type: "empTracker",
          organisationId: existingStream.organisationId,
          "lead.id": memberObjectId,
          "parentStream.parentStreamId": streamObjectId,
        }).lean();

        if (!existingTracker) {
          const memberUser = await UserModel.findById(memberObjectId)
            .select("name email")
            .lean();
          const trackerName = memberUser?.name?.trim() || "Employee Tracker";

          const trackerCreator =
            Array.isArray(existingStream.creator) && existingStream.creator.length > 0
              ? existingStream.creator
              : [];

          const newTracker = await StreamModel.create({
            name: trackerName,
            type: "empTracker",
            description: `Employee tracker for ${trackerName}`,
            organisationId: existingStream.organisationId,
            creator: trackerCreator,
            lead: [{ id: memberObjectId }],
            manager: Array.isArray(existingStream.manager)
              ? existingStream.manager
              : [],
            members: [{ memberId: memberObjectId }],
            parentStream: [{ parentStreamId: streamObjectId }],
            substream: [],
          });

          // Link new tracker as substream of the current stream
          addToSetFields.substream = {
            streamId: newTracker._id,
            ...(trackerCreator[0]?.userId
              ? { creatorId: trackerCreator[0].userId }
              : {}),
          };

          // Sync tracker stream to member's streams array & ledOf array
          userSyncPromises.push(
            UserModel.findByIdAndUpdate(memberObjectId, {
              $addToSet: {
                streams: { streamId: newTracker._id },
                ledOf: {
                  streamId: newTracker._id,
                  organisationId: existingStream.organisationId,
                },
              },
            })
          );

          // Sync tracker stream to organization streams array
          if (existingStream.organisationId) {
            userSyncPromises.push(
              OrganizationModel.findByIdAndUpdate(existingStream.organisationId, {
                $addToSet: { streams: { streamId: newTracker._id } },
              })
            );
          }
        } else {
          // Link existing tracker as substream if not already linked
          addToSetFields.substream = { streamId: existingTracker._id };

          // Ensure member's streams & ledOf have the existing tracker
          userSyncPromises.push(
            UserModel.findByIdAndUpdate(memberObjectId, {
              $addToSet: {
                streams: { streamId: existingTracker._id },
                ledOf: {
                  streamId: existingTracker._id,
                  organisationId: existingStream.organisationId,
                },
              },
            })
          );

          if (existingStream.organisationId) {
            userSyncPromises.push(
              OrganizationModel.findByIdAndUpdate(existingStream.organisationId, {
                $addToSet: { streams: { streamId: existingTracker._id } },
              })
            );
          }
        }
      } catch (trackerErr) {
        console.warn(
          "Failed to auto-create employee tracker stream:",
          trackerErr
        );
      }
    }

    // 6. Member removal
    const removeMemberIdRaw = body.removeMemberId?.trim();
    if (removeMemberIdRaw && mongoose.Types.ObjectId.isValid(removeMemberIdRaw)) {
      const removeMemberObjectId = new mongoose.Types.ObjectId(removeMemberIdRaw);
      pullFields.members = { memberId: removeMemberObjectId };

      userSyncPromises.push(
        UserModel.findByIdAndUpdate(removeMemberObjectId, {
          $pull: { streams: { streamId: streamObjectId } },
        })
      );
    }

    // 7. Substream linkage
    const subStreamIdRaw = body.subStreamId?.trim();
    if (subStreamIdRaw && mongoose.Types.ObjectId.isValid(subStreamIdRaw)) {
      addToSetFields.substream = {
        streamId: new mongoose.Types.ObjectId(subStreamIdRaw),
      };
    }

    // 8. Parent stream linkage
    const parentStreamIdRaw = body.parentStreamId?.trim();
    if (parentStreamIdRaw && mongoose.Types.ObjectId.isValid(parentStreamIdRaw)) {
      setFields.parentStream = [
        { parentStreamId: new mongoose.Types.ObjectId(parentStreamIdRaw) },
      ];
    }

    // 9. Build update operations
    const updateOperations: Record<string, unknown> = {};
    if (Object.keys(setFields).length > 0) {
      updateOperations.$set = setFields;
    }
    if (Object.keys(addToSetFields).length > 0) {
      updateOperations.$addToSet = addToSetFields;
    }
    if (Object.keys(pullFields).length > 0) {
      updateOperations.$pull = pullFields;
    }

    // Execute stream update and user sync in parallel
    const [updatedStreamDoc] = await Promise.all([
      Object.keys(updateOperations).length > 0
        ? StreamModel.findOneAndUpdate(filter, updateOperations, { new: true }).lean()
        : StreamModel.findOne(filter).lean(),
      Promise.all(userSyncPromises),
    ]);

    if (!updatedStreamDoc) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update stream.",
        },
        { status: 500 }
      );
    }

    // 10. Dynamically resolve user names for frontend consistency
    const userIds = new Set<string>();
    const rawStream = updatedStreamDoc as unknown as Record<string, unknown>;

    if (Array.isArray(rawStream.creator)) {
      rawStream.creator.forEach((c: Record<string, unknown>) => {
        const id = extractId(c.userId);
        if (id && id !== "[object Object]") userIds.add(id);
      });
    }

    if (Array.isArray(rawStream.lead)) {
      rawStream.lead.forEach((l: Record<string, unknown>) => {
        const id = extractId(l.id);
        if (id && id !== "[object Object]") userIds.add(id);
      });
    }

    if (Array.isArray(rawStream.manager)) {
      rawStream.manager.forEach((m: Record<string, unknown>) => {
        const id = extractId(m.id);
        if (id && id !== "[object Object]") userIds.add(id);
      });
    }

    if (Array.isArray(rawStream.members)) {
      rawStream.members.forEach((m: Record<string, unknown>) => {
        const id = extractId(m.memberId);
        if (id && id !== "[object Object]") userIds.add(id);
      });
    }

    const validObjectIds = Array.from(userIds).filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const userDocs =
      validObjectIds.length > 0
        ? await UserModel.find({ _id: { $in: validObjectIds } })
            .select("name email")
            .lean()
        : [];

    const userMap = new Map<string, string>();
    userDocs.forEach((u) => {
      userMap.set(u._id.toString(), u.name);
    });

    const formattedStream = {
      ...rawStream,
      id: rawStream._id ? String(rawStream._id) : streamId,
      _id: rawStream._id ? String(rawStream._id) : streamId,
      creator: Array.isArray(rawStream.creator)
        ? rawStream.creator.map((c: Record<string, unknown>) => {
            const id = extractId(c.userId);
            return {
              userId: id,
              name: userMap.get(id) || (c.name as string) || "Creator",
            };
          })
        : [],
      lead: Array.isArray(rawStream.lead)
        ? rawStream.lead.map((l: Record<string, unknown>) => {
            const id = extractId(l.id);
            return {
              id,
              name: userMap.get(id) || (l.name as string) || "Lead",
            };
          })
        : [],
      manager: Array.isArray(rawStream.manager)
        ? rawStream.manager.map((m: Record<string, unknown>) => {
            const id = extractId(m.id);
            return {
              id,
              name: userMap.get(id) || (m.name as string) || "Manager",
            };
          })
        : [],
      members: Array.isArray(rawStream.members)
        ? rawStream.members.map((m: Record<string, unknown>) => {
            const id = extractId(m.memberId);
            return {
              memberId: id,
              memberName: userMap.get(id) || (m.memberName as string) || "Member",
              assigneeId: (m.assigneeId as string) || undefined,
            };
          })
        : [],
    };

    return NextResponse.json(
      {
        success: true,
        message: "Stream updated successfully!",
        data: formattedStream,
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
