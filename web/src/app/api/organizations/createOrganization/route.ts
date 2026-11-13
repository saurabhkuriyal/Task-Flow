import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import dbConnect from "@/utils/db";
import { OrganizationModel } from "@/models/organization.model";
import UserModel from "@/models/auth.model";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();

    // 1. Resolve ownerId and owner name from auth token cookie or request body
    let ownerId = body.ownerId;
    let ownerName = body.ownerName || "Owner";
    let ownerEmail = "";

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
          ownerId = payload.id;
        }
        if (payload?.name && typeof payload.name === "string") {
          ownerName = payload.name;
        }
        if (payload?.email && typeof payload.email === "string") {
          ownerEmail = payload.email.toLowerCase().trim();
        }
      }
    } catch {
      // Token verification failed or not provided; fallback to body.ownerId
    }

    // If ownerId is invalid or [object Object], resolve from email or body.ownerId
    if ((!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) && ownerEmail) {
      const userByEmail = await UserModel.findOne({ email: ownerEmail });
      if (userByEmail) {
        ownerId = userByEmail._id.toString();
        ownerName = userByEmail.name || ownerName;
      }
    } else if (
      (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) &&
      body.ownerId &&
      mongoose.Types.ObjectId.isValid(body.ownerId)
    ) {
      ownerId = String(body.ownerId);
    }

    if (!ownerId || ownerId === "[object Object]") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: You must be logged in to create an organization.",
        },
        { status: 401 }
      );
    }

    // 2. Extract and validate organization properties
    const organizationName = (
      body.organizationName ||
      body.name ||
      body.companyName ||
      ""
    ).trim();

    const gstNo = (
      body.gstNo ||
      body.gstNumber ||
      ""
    )
      .trim()
      .toUpperCase();

    const establishedYear = Number(
      body.establishedYear || body.yearOfEstablishment
    );

    const teamSize = Number(body.teamSize || body.noOfPeople) || 1;
    const mrr = Number(body.mrr) || 0;
    const arr = Number(body.arr) || mrr * 12;

    if (!organizationName) {
      return NextResponse.json(
        { success: false, message: "Organization name is required." },
        { status: 400 }
      );
    }

    if (!gstNo) {
      return NextResponse.json(
        { success: false, message: "GST number is required." },
        { status: 400 }
      );
    }

    if (!establishedYear || isNaN(establishedYear)) {
      return NextResponse.json(
        { success: false, message: "Established year is required." },
        { status: 400 }
      );
    }

    // 3. Check for existing organization with the same GST number
    const existingOrg = await OrganizationModel.findOne({ gstNo });
    if (existingOrg) {
      return NextResponse.json(
        {
          success: false,
          message: "An organization with this GST number is already registered.",
        },
        { status: 409 }
      );
    }

    // 4. Default members and employees to include owner if empty
    const members =
      Array.isArray(body.members) && body.members.length > 0
        ? body.members
        : [{ memberId: String(ownerId), name: ownerName }];

    const departments = Array.isArray(body.departments) ? body.departments : [];
    const projects = Array.isArray(body.projects) ? body.projects : [];

    const employees =
      Array.isArray(body.employees) && body.employees.length > 0
        ? body.employees
        : [{ empId: String(ownerId), name: ownerName }];

    // 5. Create new organization document in MongoDB
    const newOrganization = await OrganizationModel.create({
      ownerId,
      members,
      departments,
      projects,
      organizationName,
      gstNo,
      establishedYear,
      teamSize,
      arr,
      mrr,
      employees,
    });

    // 6. Update user's organization profile in UserModel (auth.model)
    let updatedUser = null;
    try {
      const orgId = newOrganization._id.toString();
      const orgName = newOrganization.organizationName;

      const createdOrgItem = {
        createdOrganisationId: orgId,
        createdOrganisationName: orgName,
      };

      const userUpdateQuery = {
        $addToSet: {
          createdOrganisations: createdOrgItem,
          organisations: {
            organisationId: orgId,
            organisationName: orgName,
          },
        },
      };

      const userFilter = mongoose.Types.ObjectId.isValid(ownerId)
        ? { _id: new mongoose.Types.ObjectId(ownerId) }
        : { $or: [{ _id: ownerId }, { email: String(ownerId).toLowerCase().trim() }] };

      // 1. Update using Mongoose Model
      updatedUser = await UserModel.findOneAndUpdate(
        userFilter,
        userUpdateQuery,
        { new: true }
      );

      // 2. Direct driver update fallback (ensures write if Next.js hot reload cached an older schema)
      if (!updatedUser || !updatedUser.createdOrganisations?.length) {
        await UserModel.collection.updateOne(userFilter, userUpdateQuery);
        updatedUser = await UserModel.findOne(userFilter);
      }

      console.log(
        "[createOrganization] User updated in MongoDB successfully:",
        updatedUser?._id,
        "Org:",
        orgName
      );
    } catch (err) {
      console.error("[createOrganization] Error updating user in MongoDB:", err);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Organization created successfully!",
        organization: newOrganization,
        user: updatedUser
          ? {
              id: updatedUser._id.toString(),
              name: updatedUser.name,
              email: updatedUser.email,
              createdOrganisations: updatedUser.createdOrganisations,
              organisations: updatedUser.organisations,
            }
          : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create organization API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while creating the organization.",
      },
      { status: 500 }
    );
  }
}

