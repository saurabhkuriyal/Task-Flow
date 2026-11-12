import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { OrganizationModel } from "@/models/organization.model";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let query: Record<string, unknown> = {};

    if (userId && userId !== "undefined" && userId !== "null") {
      const orConditions: Record<string, unknown>[] = [
        { ownerId: userId },
        { "members.memberId": userId },
        { "employees.empId": userId },
      ];
      if (mongoose.Types.ObjectId.isValid(userId)) {
        orConditions.push({ ownerId: new mongoose.Types.ObjectId(userId) });
      }
      query = { $or: orConditions };
    }

    const organizations = await OrganizationModel.find(query).sort({
      createdAt: -1,
    });
    return NextResponse.json(organizations, { status: 200 });
  } catch (error) {
    console.error("Fetch organizations error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
