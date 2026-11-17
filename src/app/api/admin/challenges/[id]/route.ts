import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import Challenge from "@/models/Challenge";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.errorResponse!;

  const { id } = await params;

  try {
    const body = await req.json();
    const { title, difficulty, points, hints, scenario, objective, domain } = body;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return NextResponse.json({ message: "Challenge not found" }, { status: 404 });
    }

    if (title !== undefined) challenge.title = String(title).trim();
    if (difficulty !== undefined) challenge.difficulty = String(difficulty).trim();
    if (points !== undefined && Number.isInteger(Number(points))) challenge.points = Number(points);
    if (domain !== undefined) challenge.domain = String(domain).trim();
    if (scenario !== undefined) {
      challenge.scenario = String(scenario).trim();
      challenge.description = String(scenario).trim();
    }
    if (objective !== undefined) challenge.objective = String(objective).trim();
    if (Array.isArray(hints)) challenge.hints = hints.map((h) => String(h).trim());

    await challenge.save();

    return NextResponse.json({
      success: true,
      message: "Challenge metadata updated successfully",
      challenge,
    });
  } catch (error) {
    console.error("Admin challenge update error:", error);
    return NextResponse.json(
      { message: "Internal server error updating challenge" },
      { status: 500 }
    );
  }
}
