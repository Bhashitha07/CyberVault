import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Progress from "@/models/Progress";
import UserProgress from "@/models/UserProgress";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let progress = await Progress.findOne({ userId: session.userId }).lean<any>();
    if (!progress) {
      progress = {
        completedStages: [],
        currentStage: 1,
        score: 0,
        completed: false,
      };
    }

    const completedStages = progress.completedStages || [];
    const count = completedStages.length;
    const progressPercentage = Math.round((count / 6) * 100);
    const ctfCompleted = count >= 6 || Boolean(progress.completed);

    const detailedProgress = await UserProgress.find({ userId: session.userId }).lean();

    return NextResponse.json(
      {
        completedStages,
        currentStage: progress.currentStage || 1,
        score: progress.score || 0,
        progressPercentage,
        ctfCompleted,
        attempts: progress.attempts || 0,
        details: detailedProgress,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Progress fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error fetching progress" },
      { status: 500 }
    );
  }
}
