import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import UserModel from "@/models/auth.model";
import bcrypt from "bcryptjs";
import type { SigninResponse } from "@/types/auth";
import { signInToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const email = (body.email || body.username || "").toLowerCase().trim();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Compare hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }
    const token: string = await signInToken({
      id: user._id,
      name: user.name,
      email: user.email
    })

    console.log("tokenn is", token);


    const signInResponse: SigninResponse = {
      success: true,
      message: "Signed in successfully! Welcome back.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    };

    const response = NextResponse.json(signInResponse, { status: 200 });

    response.cookies.set('token', token, {
      httpOnly: true, // Prevents client-side JS from reading the cookies
      sameSite: 'lax', // Protects against CSRF
      path: '/', // Accessible across the entire app
      maxAge: 60 * 60 * 24, // 1 day in seconds
    });

    return response
  } catch (error) {
    console.error("Signin API error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during signin.",
      },
      { status: 500 }
    );
  }
}
