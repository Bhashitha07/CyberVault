import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import FlagAttempt from "@/models/FlagAttempt";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.errorResponse!;

  try {
    const submissions = await FlagAttempt.find()
      .sort({ attemptedAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ submissions }, { status: 200 });
  } catch (error) {
    console.error("Admin fetch submissions error:", error);
    return NextResponse.json(
      { message: "Internal server error fetching flag attempt logs" },
      { status: 500 }
    );
  }
}
