import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import Challenge from "@/models/Challenge";
import Progress from "@/models/Progress";
import FlagAttempt from "@/models/FlagAttempt";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.errorResponse!;

  try {
    const [
      totalUsers,
      totalChallenges,
      allProgresses,
      totalFlagAttempts,
      successfulSubmissions,
      failedSubmissions,
    ] = await Promise.all([
      User.countDocuments(),
      Challenge.countDocuments(),
      Progress.find().lean<any>(),
      FlagAttempt.countDocuments(),
      FlagAttempt.countDocuments({ success: true }),
      FlagAttempt.countDocuments({ success: false }),
    ]);

    let completedPlayers = 0;
    let activePlayers = 0;
    const stageCompletions = [0, 0, 0, 0, 0, 0];

    for (const p of allProgresses) {
      const done: number[] = p.completedStages || [];
      if (done.length > 0) activePlayers++;
      if (done.length >= 6 || p.completed) completedPlayers++;

      for (const stageNum of done) {
        if (stageNum >= 1 && stageNum <= 6) {
          stageCompletions[stageNum - 1]++;
        }
      }
    }

    return NextResponse.json(
      {
        totalUsers,
        totalChallenges: totalChallenges || 6,
        completedPlayers,
        activePlayers,
        totalFlagAttempts,
        successfulSubmissions,
        failedSubmissions,
        stageCompletions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin dashboard fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error fetching admin dashboard statistics" },
      { status: 500 }
    );
  }
}
