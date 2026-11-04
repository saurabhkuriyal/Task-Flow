import { NextResponse } from "next/server";
import type { SignupPayload, SignupResponse } from "@/types/auth";
import connectDB from "@/utils/db";
import UserModel from "@/models/auth.model";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body: SignupPayload = await req.json();
    const { name, email, phoneNumber, password } = body;

    if (!name || !email || !phoneNumber || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields (name, email, phone number, password) are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to database
    const newUser = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      phoneNumber: phoneNumber.trim(),
      password: hashedPassword,
    });

    const response: SignupResponse = {
      success: true,
      message: "Account created successfully! Welcome to TaskFlow.",
      token: `token-${newUser._id.toString()}-${Date.now()}`,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
      },
    };

    console.log("Signup successful:", response.user?.email);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during signup.",
      },
      { status: 500 }
    );
  }
}
