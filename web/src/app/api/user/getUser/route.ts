import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/utils/db";
import UserModel from "@/models/auth.model";
import { OrganizationModel } from "@/models/organization.model";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId")?.trim();
    const orgId = (
      searchParams.get("orgId") ||
      searchParams.get("organisationId") ||
      searchParams.get("organizationId")
    )?.trim();

    // 1. Fetch single user by userId
    if (userId) {
      const user = mongoose.Types.ObjectId.isValid(userId)
        ? await UserModel.findById(userId).select("-password").lean()
        : await UserModel.findOne({ _id: userId }).select("-password").lean();

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "User not found",
            users: [],
          },
          { status: 404 }
        );
      }

      const formattedUser = {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        organisations: user.organisations,
        createdAt: user.createdAt,
      };

      return NextResponse.json(
        {
          success: true,
          user: formattedUser,
          users: [formattedUser],
        },
        { status: 200 }
      );
    }

    // 2. Fetch users by Organization ID / Name
    if (orgId) {
      const memberIds = new Set<string>();
      const orgObjectId = mongoose.Types.ObjectId.isValid(orgId)
        ? new mongoose.Types.ObjectId(orgId)
        : null;

      // A. Check Organization document for owner and member list
      try {
        let orgDoc = null;
        if (orgObjectId) {
          orgDoc = await OrganizationModel.findById(orgObjectId).lean();
        }
        if (!orgDoc) {
          orgDoc = await OrganizationModel.findOne({
            $or: [{ _id: orgId }, { organizationName: decodeURIComponent(orgId) }],
          }).lean();
        }

        if (orgDoc) {
          if (orgDoc.ownerId) {
            memberIds.add(orgDoc.ownerId.toString());
          }
          if (Array.isArray(orgDoc.members)) {
            orgDoc.members.forEach((m) => {
              if (m.memberId) memberIds.add(m.memberId.toString());
            });
          }
        }
      } catch (err) {
        console.error("Error retrieving organization members:", err);
      }

      // B. Query UserModel for users with matching organisationId or matching memberIds
      const validObjectIds = Array.from(memberIds)
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      const queryConditions: Record<string, unknown>[] = [
        { "organisations.organisationId": orgId },
        { "createdOrganisations.createdOrganisationId": orgId },
      ];

      if (orgObjectId) {
        queryConditions.push({ "organisations.organisationId": orgObjectId });
        queryConditions.push({ "createdOrganisations.createdOrganisationId": orgObjectId });
      }

      if (validObjectIds.length > 0) {
        queryConditions.push({ _id: { $in: validObjectIds } });
      }

      const users = await UserModel.find({
        $or: queryConditions,
      })
        .select("-password")
        .sort({ createdAt: -1 })
        .lean();

      const formattedUsers = users.map((u) => ({
        id: u._id.toString(),
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        phoneNumber: u.phoneNumber,
        role: u.role,
        organisations: u.organisations,
        createdAt: u.createdAt,
      }));

      return NextResponse.json(
        {
          success: true,
          users: formattedUsers,
          count: formattedUsers.length,
        },
        { status: 200 }
      );
    }

    // 3. Fallback: return recent users
    const users = await UserModel.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formattedUsers = users.map((u) => ({
      id: u._id.toString(),
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      phoneNumber: u.phoneNumber,
      role: u.role,
      organisations: u.organisations,
      createdAt: u.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        users: formattedUsers,
        count: formattedUsers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("getUser API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching users.",
        users: [],
      },
      { status: 500 }
    );
  }
}
