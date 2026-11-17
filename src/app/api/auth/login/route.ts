import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: "Identifier and password required" }, { status: 400 });
    }

    const cleanIdentifier = String(identifier).trim();
    const user = await User.findOne({
      $or: [
        { username: cleanIdentifier },
        { email: cleanIdentifier.toLowerCase() },
      ],
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    await createSession(String(user._id), user.role);

    return NextResponse.json({
      success: true,
      role: user.role,
      redirect: user.role === "admin" ? "/admin" : "/dashboard",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Authentication failed" }, { status: 500 });
  }
}
