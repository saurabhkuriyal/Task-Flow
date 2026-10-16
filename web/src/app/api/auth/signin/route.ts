import { NextResponse } from "next/server";
import { LoginCredentials, AuthResponse } from "@/models";

export async function POST(req: Request) {
  try {
    const body: LoginCredentials = await req.json();
    const { username, password } = body;

    // Verify username "vijay" and password "12345678"
    if (username === "vijay" && password === "12345678") {
      const response: AuthResponse = {
        success: true,
        message: "Authentication successful",
        token: "token-mock-vijay-12345",
        user: {
          id: "usr-vijay-1",
          username: "vijay",
          name: "Vijay Kumar",
          role: "ADMIN",
        },
      };
      return NextResponse.json(response, { status: 200 });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid credentials. Use username: vijay and password: 12345678",
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request payload" },
      { status: 400 }
    );
  }
}
