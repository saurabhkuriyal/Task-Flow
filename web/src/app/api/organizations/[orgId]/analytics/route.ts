import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { OrganizationModel } from "@/models/organization.model";
import { StreamModel } from "@/models/stream.model";
import { TaskModel } from "@/models/tasks.model";
import UserModel from "@/models/auth.model";

function extractId(val: unknown): string {
  if (!val) return "";
  if (typeof val === "object" && val !== null && "_id" in val) {
    return String((val as { _id?: unknown })._id || "");
  }
  return String(val);
}

function getDateKey(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    await dbConnect();
    const { orgId } = await params;

    if (!orgId || orgId === "undefined" || orgId === "null") {
      return NextResponse.json(
        { success: false, message: "Organization ID is required." },
        { status: 400 }
      );
    }

    const orgDoc = mongoose.Types.ObjectId.isValid(orgId)
      ? await OrganizationModel.findById(orgId).lean()
      : await OrganizationModel.findOne({
          $or: [{ _id: orgId }, { organizationName: decodeURIComponent(orgId) }],
        }).lean();

    if (!orgDoc) {
      return NextResponse.json(
        { success: false, message: "Organization not found." },
        { status: 404 }
      );
    }

    const resolvedOrgId = String(orgDoc._id);
    const orgIdValues: (string | mongoose.Types.ObjectId)[] = [
      resolvedOrgId,
      orgDoc._id,
    ];
    if (orgDoc.organizationName) {
      orgIdValues.push(orgDoc.organizationName);
    }

    // Collect member IDs attached to org document
    const orgMemberObjectIds: mongoose.Types.ObjectId[] = [];
    if (orgDoc.ownerId && mongoose.Types.ObjectId.isValid(String(orgDoc.ownerId))) {
      orgMemberObjectIds.push(new mongoose.Types.ObjectId(String(orgDoc.ownerId)));
    }
    if (Array.isArray(orgDoc.members)) {
      orgDoc.members.forEach((m) => {
        const id = extractId(m.memberId);
        if (id && mongoose.Types.ObjectId.isValid(id)) {
          orgMemberObjectIds.push(new mongoose.Types.ObjectId(id));
        }
      });
    }

    const userFilter: Record<string, unknown> = {
      $or: [
        { "organisations.organisationId": resolvedOrgId },
        { "organisations.organisationId": orgDoc._id },
        { "createdOrganisations.createdOrganisationId": resolvedOrgId },
        ...(orgMemberObjectIds.length > 0
          ? [{ _id: { $in: orgMemberObjectIds } }]
          : []),
      ],
    };

    const [rawStreams, rawTasks, rawUsers] = await Promise.all([
      StreamModel.find({
        $or: [
          { organisationId: { $in: orgIdValues } },
          { organisationName: orgDoc.organizationName },
        ],
      })
        .select("name type manager lead members")
        .lean(),
      TaskModel.find({
        orgId: { $in: [resolvedOrgId, orgDoc._id] },
      })
        .select("status priority streamId totalTimeSpent createdAt updatedAt")
        .lean(),
      UserModel.find(userFilter).select("name email role").lean(),
    ]);

    const workStreams = rawStreams.filter(
      (s) => s.type === "department" || s.type === "project"
    );
    const departmentsCount = workStreams.filter(
      (s) => s.type === "department"
    ).length;
    const projectsCount = workStreams.filter(
      (s) => s.type === "project"
    ).length;
    const empTrackersCount = rawStreams.filter(
      (s) => s.type === "empTracker"
    ).length;

    // Unique managers & leads across workStreams + user roles
    const managerIds = new Set<string>();
    const leadIds = new Set<string>();

    workStreams.forEach((s) => {
      if (Array.isArray(s.manager)) {
        s.manager.forEach((m) => {
          const id = extractId(m.id);
          if (id) managerIds.add(id);
        });
      }
      if (Array.isArray(s.lead)) {
        s.lead.forEach((l) => {
          const id = extractId(l.id);
          if (id) leadIds.add(id);
        });
      }
    });

    let employeesCount = 0;
    let adminsCount = 0;

    rawUsers.forEach((u) => {
      const uid = String(u._id);
      const role = (u.role || "employee").toLowerCase();
      if (role === "manager") managerIds.add(uid);
      if (role === "lead") leadIds.add(uid);
      if (role === "admin" || role === "owner") adminsCount += 1;
      if (role === "employee" || role === "employees") employeesCount += 1;
    });

    // Task status & priority aggregations + per-stream workload + 7-day trend
    const byStatus = {
      todo: 0,
      in_progress: 0,
      in_review: 0,
      completed: 0,
      blocked: 0,
      backlog: 0,
    };
    const byPriority = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    let directTasks = 0;
    let streamTasks = 0;
    let totalTimeSpent = 0;

    const streamTaskMap = new Map<
      string,
      { total: number; completed: number; pending: number }
    >();

    // Prepare last 7 days buckets (oldest -> today)
    const today = new Date();
    const trendBuckets: {
      key: string;
      label: string;
      created: number;
      completed: number;
    }[] = [];
    const trendIndexMap = new Map<string, number>();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate() - i
        )
      );
      const key = getDateKey(d);
      const label = d.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      });
      trendIndexMap.set(key, trendBuckets.length);
      trendBuckets.push({ key, label, created: 0, completed: 0 });
    }

    rawTasks.forEach((t) => {
      const status = (t.status || "todo") as keyof typeof byStatus;
      if (status in byStatus) {
        byStatus[status] += 1;
      } else {
        byStatus.todo += 1;
      }

      const priority = (t.priority || "medium") as keyof typeof byPriority;
      if (priority in byPriority) {
        byPriority[priority] += 1;
      } else {
        byPriority.medium += 1;
      }

      totalTimeSpent += t.totalTimeSpent || 0;

      const sId = extractId(t.streamId);
      const isDirect = !sId || sId === "null" || sId === "undefined";
      if (isDirect) {
        directTasks += 1;
      } else {
        streamTasks += 1;
        const entry = streamTaskMap.get(sId) || {
          total: 0,
          completed: 0,
          pending: 0,
        };
        entry.total += 1;
        if (t.status === "completed") {
          entry.completed += 1;
        } else {
          entry.pending += 1;
        }
        streamTaskMap.set(sId, entry);
      }

      if (t.createdAt) {
        const createdIdx = trendIndexMap.get(getDateKey(new Date(t.createdAt)));
        if (createdIdx !== undefined) {
          trendBuckets[createdIdx].created += 1;
        }
      }

      if (t.status === "completed" && t.updatedAt) {
        const completedIdx = trendIndexMap.get(
          getDateKey(new Date(t.updatedAt))
        );
        if (completedIdx !== undefined) {
          trendBuckets[completedIdx].completed += 1;
        }
      }
    });

    const totalTasks = rawTasks.length;
    const completedTasks = byStatus.completed;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const streamWorkload = workStreams
      .map((s) => {
        const streamId = String(s._id);
        const st = streamTaskMap.get(streamId) || {
          total: 0,
          completed: 0,
          pending: 0,
        };
        return {
          streamId,
          name: s.name,
          type: s.type,
          total: st.total,
          completed: st.completed,
          pending: st.pending,
        };
      })
      .sort((a, b) => b.total - a.total);

    return NextResponse.json(
      {
        success: true,
        analytics: {
          organization: {
            id: resolvedOrgId,
            organizationName: orgDoc.organizationName,
            gstNo: orgDoc.gstNo,
            establishedYear: orgDoc.establishedYear,
            teamSize: orgDoc.teamSize,
            mrr: orgDoc.mrr,
            arr: orgDoc.arr,
          },
          streams: {
            total: workStreams.length,
            departmentsCount,
            projectsCount,
            empTrackersCount,
          },
          team: {
            totalMembers: rawUsers.length,
            employeesCount,
            managersCount: managerIds.size,
            leadsCount: leadIds.size,
            adminsCount,
          },
          tasks: {
            total: totalTasks,
            completed: completedTasks,
            pending: pendingTasks,
            directTasks,
            streamTasks,
            completionRate,
            totalTimeSpent,
            byStatus,
            byPriority,
          },
          streamWorkload,
          weeklyTrend: trendBuckets.map(({ key, label, created, completed }) => ({
            date: key,
            label,
            created,
            completed,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Organization analytics API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load organization analytics.",
      },
      { status: 500 }
    );
  }
}
