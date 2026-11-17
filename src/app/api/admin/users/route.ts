import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.errorResponse!;

  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Admin fetch users error:", error);
    return NextResponse.json(
      { message: "Internal server error fetching users" },
      { status: 500 }
    );
  }
}
