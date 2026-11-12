import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (token) {
        const { payload } = await verifyToken(token);
        if (payload?.id) {
          ownerId = String(payload.id);
        }
        if (payload?.name) {
          ownerName = String(payload.name);
        }
      }
    } catch {
      // Token verification failed or not provided; fallback to body.ownerId
    }

    if (!ownerId) {
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

    // 6. Update user's organization profile if valid UserModel exists
    try {
      await UserModel.findByIdAndUpdate(ownerId, {
        createdOrganisationId: newOrganization._id.toString(),
        createdOrganisationName: newOrganization.organizationName,
        $addToSet: {
          organisations: {
            organisationId: newOrganization._id.toString(),
            organisationName: newOrganization.organizationName,
          },
        },
      });
    } catch (err) {
      console.warn("Could not link organization to user profile:", err);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Organization created successfully!",
        organization: newOrganization,
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

