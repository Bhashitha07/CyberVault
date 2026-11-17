import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import Challenge from "@/models/Challenge";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.errorResponse!;

  try {
    const challenges = await Challenge.find()
      .select("-flag -flagHash")
      .sort({ stageNumber: 1 })
      .lean();
    return NextResponse.json({ challenges }, { status: 200 });
  } catch (error) {
    console.error("Admin fetch challenges error:", error);
    return NextResponse.json(
      { message: "Internal server error fetching challenges" },
      { status: 500 }
    );
  }
}
