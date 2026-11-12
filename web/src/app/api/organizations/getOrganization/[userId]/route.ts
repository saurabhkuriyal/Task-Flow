import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { OrganizationModel } from "@/models/organization.model";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await dbConnect();
    const { userId } = await params;

    if (!userId || userId === "undefined" || userId === "null") {
      return NextResponse.json(
        {
          success: false,
          message: "Valid User ID is required.",
          organizations: [],
        },
        { status: 400 }
      );
    }

    const orConditions: Record<string, unknown>[] = [
      { ownerId: userId },
      { "members.memberId": userId },
      { "employees.empId": userId },
    ];

    if (mongoose.Types.ObjectId.isValid(userId)) {
      orConditions.push({ ownerId: new mongoose.Types.ObjectId(userId) });
    }

    const organizations = await OrganizationModel.find({
      $or: orConditions,
    }).sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: organizations.length,
        organizations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get organizations by user ID error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch organizations.",
        organizations: [],
      },
      { status: 500 }
    );
  }
}

