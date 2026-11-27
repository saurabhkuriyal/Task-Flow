import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { StreamModel } from "@/models/stream.model";
import { OrganizationModel } from "@/models/organization.model";
import UserModel from "@/models/auth.model";

function extractId(val: unknown): string {
  if (!val) return "";
  if (typeof val === "object" && val !== null && "_id" in val) {
    return String((val as { _id?: unknown })._id || "");
  }
  return String(val);
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const empId = (
      searchParams.get("empId") ||
      searchParams.get("employeeId") ||
      searchParams.get("userId") ||
      searchParams.get("id")
    )?.trim();

    const orgId = (
      searchParams.get("orgId") ||
      searchParams.get("organisationId") ||
      searchParams.get("organizationId")
    )?.trim();

    const type = searchParams.get("type")?.trim();

    if (!empId || empId === "undefined" || empId === "null") {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID is required.",
          streams: [],
        },
        { status: 400 }
      );
    }

    // Match streams where manager.id OR lead.id equals this employee ID
    const empConditions: Record<string, unknown>[] = [
      { "manager.id": empId },
      { "lead.id": empId },
    ];

    if (mongoose.Types.ObjectId.isValid(empId)) {
      const empObjectId = new mongoose.Types.ObjectId(empId);
      empConditions.push(
        { "manager.id": empObjectId },
        { "lead.id": empObjectId }
      );
    }

    const andConditions: Record<string, unknown>[] = [{ $or: empConditions }];

    // Scope to departments and projects by default (exclude internal empTracker unless explicitly requested)
    if (type && type !== "undefined" && type !== "null") {
      andConditions.push({ type });
    } else {
      andConditions.push({ type: { $in: ["department", "project"] } });
    }

    // Optional organization filtering
    if (orgId && orgId !== "undefined" && orgId !== "null") {
      const orgConditions: Record<string, unknown>[] = [
        { organisationId: orgId },
        { organisationName: orgId },
      ];

      if (mongoose.Types.ObjectId.isValid(orgId)) {
        orgConditions.push({
          organisationId: new mongoose.Types.ObjectId(orgId),
        });
      }

      try {
        const orgDoc = mongoose.Types.ObjectId.isValid(orgId)
          ? await OrganizationModel.findById(orgId).lean()
          : await OrganizationModel.findOne({ organizationName: orgId }).lean();

        if (orgDoc) {
          orgConditions.push(
            { organisationId: orgDoc._id.toString() },
            { organisationId: orgDoc._id },
            { organisationName: orgDoc.organizationName }
          );
        }
      } catch (err) {
        console.warn("Failed to lookup organization document:", err);
      }

      andConditions.push({ $or: orgConditions });
    }

    const query =
      andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const [rawStreams, employeeDoc] = await Promise.all([
      StreamModel.find(query).sort({ createdAt: -1 }).lean(),
      mongoose.Types.ObjectId.isValid(empId)
        ? UserModel.findById(empId).select("name email role status").lean()
        : UserModel.findOne({ $or: [{ _id: empId }, { email: empId }] })
            .select("name email role status")
            .lean(),
    ]);

    // Collect referenced user IDs to resolve names dynamically
    const userIds = new Set<string>();
    rawStreams.forEach((st) => {
      const s = st as unknown as Record<string, unknown>;

      if (Array.isArray(s.creator)) {
        s.creator.forEach((c: Record<string, unknown>) => {
          const id = extractId(c.userId);
          if (id && id !== "[object Object]") userIds.add(id);
        });
      }

      if (Array.isArray(s.lead)) {
        s.lead.forEach((l: Record<string, unknown>) => {
          const id = extractId(l.id);
          if (id && id !== "[object Object]") userIds.add(id);
        });
      }

      if (Array.isArray(s.manager)) {
        s.manager.forEach((m: Record<string, unknown>) => {
          const id = extractId(m.id);
          if (id && id !== "[object Object]") userIds.add(id);
        });
      }

      if (Array.isArray(s.members)) {
        s.members.forEach((m: Record<string, unknown>) => {
          const id = extractId(m.memberId);
          if (id && id !== "[object Object]") userIds.add(id);
        });
      }
    });

    const validObjectIds = Array.from(userIds).filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const userDocs =
      validObjectIds.length > 0
        ? await UserModel.find({ _id: { $in: validObjectIds } })
            .select("name email role")
            .lean()
        : [];

    const userMap = new Map<string, string>();
    userDocs.forEach((u) => {
      userMap.set(u._id.toString(), u.name || "User");
    });

    const streams = rawStreams.map((st) => {
      const s = st as unknown as Record<string, unknown>;
      const id = s._id ? String(s._id) : "";

      return {
        ...s,
        id,
        _id: id,
        organisationId: s.organisationId ? String(s.organisationId) : "",
        creator: Array.isArray(s.creator)
          ? s.creator.map((c: Record<string, unknown>) => {
              const uid = extractId(c.userId);
              return {
                userId: uid,
                name: userMap.get(uid) || (c.name as string) || "Creator",
              };
            })
          : [],
        lead: Array.isArray(s.lead)
          ? s.lead.map((l: Record<string, unknown>) => {
              const lid = extractId(l.id);
              return {
                id: lid,
                name: userMap.get(lid) || (l.name as string) || "Lead",
              };
            })
          : [],
        manager: Array.isArray(s.manager)
          ? s.manager.map((m: Record<string, unknown>) => {
              const mid = extractId(m.id);
              return {
                id: mid,
                name: userMap.get(mid) || (m.name as string) || "Manager",
              };
            })
          : [],
        members: Array.isArray(s.members)
          ? s.members.map((m: Record<string, unknown>) => {
              const mid = extractId(m.memberId);
              return {
                memberId: mid,
                memberName:
                  userMap.get(mid) || (m.memberName as string) || "Member",
                assigneeId: (m.assigneeId as string) || undefined,
              };
            })
          : [],
      };
    });

    const employee = employeeDoc
      ? {
          id: String(employeeDoc._id),
          name: employeeDoc.name || "Employee",
          email: employeeDoc.email || "",
          role: employeeDoc.role || "employee",
          status: employeeDoc.status || "active",
        }
      : null;

    return NextResponse.json(
      {
        success: true,
        count: streams.length,
        employee,
        streams,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get streams by employee ID API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching streams by employee ID.",
        streams: [],
      },
      { status: 500 }
    );
  }
}
