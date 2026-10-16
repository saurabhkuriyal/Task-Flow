import { NextResponse } from "next/server";
import type { SignupPayload, SignupResponse } from "@/types/auth";

export async function POST(req: Request) {
  try {
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

    // Mock successful user registration
    const response: SignupResponse = {
      success: true,
      message: "Account created successfully! Welcome to TaskFlow.",
      token: `token-mock-${Date.now()}`,
      user: {
        id: `usr-${Date.now()}`,
        name,
        email,
        phoneNumber,
        role: "MEMBER",
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request payload." },
      { status: 400 }
    );
  }
}
