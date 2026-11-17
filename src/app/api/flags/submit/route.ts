import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Progress from "@/models/Progress";
import UserProgress from "@/models/UserProgress";
import Challenge from "@/models/Challenge";
import User from "@/models/User";
import FlagAttempt from "@/models/FlagAttempt";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON input" }, { status: 400 });
    }

    const { flag } = body;
    const stageNumber = Number(body.stageNumber || body.stage);

    if (
      !Number.isInteger(stageNumber) ||
      stageNumber < 1 ||
      stageNumber > 6 ||
      typeof flag !== "string" ||
      !flag.trim() ||
      flag.length > 200
    ) {
      return NextResponse.json({ success: false, message: "Invalid submission" }, { status: 400 });
    }

    // Fetch user doc
    const userDoc = await User.findById(session.userId).lean<any>();
    if (!userDoc) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // 1. Fetch overall progress
    let progress = await Progress.findOne({ userId: session.userId });
    if (!progress) {
      progress = await Progress.create({
        userId: session.userId,
        completedStages: [],
        currentStage: 1,
        score: 0,
      });
    }

    // 2. Validate progression server-side
    const isAlreadyCompleted = progress.completedStages.includes(stageNumber);
    if (stageNumber > progress.currentStage && !isAlreadyCompleted) {
      return NextResponse.json(
        { success: false, message: "Stage is locked. Complete previous stages first." },
        { status: 403 }
      );
    }

    // 3. Fetch challenge
    const challenge = await Challenge.findOne({
      $or: [{ stageNumber }, { stage: stageNumber }],
    });

    if (!challenge) {
      return NextResponse.json(
        { success: false, message: "Challenge unavailable" },
        { status: 404 }
      );
    }

    // 4. Update stage attempt stats
    let stageProgress = await UserProgress.findOne({
      userId: session.userId,
      stageNumber,
    });

    if (!stageProgress) {
      stageProgress = new UserProgress({
        userId: session.userId,
        challengeId: challenge._id,
        stageNumber,
        status: isAlreadyCompleted ? "completed" : stageNumber === progress.currentStage ? "in-progress" : "locked",
        attempts: 0,
        solved: isAlreadyCompleted,
      });
    }

    stageProgress.attempts = (stageProgress.attempts || 0) + 1;
    stageProgress.lastAttemptAt = new Date();
    progress.attempts = (progress.attempts || 0) + 1;

    // 5. Compare flag
    const submittedFlagClean = flag.trim();
    let isCorrect = false;

    if (challenge.flag && challenge.flag.trim() === submittedFlagClean) {
      isCorrect = true;
    } else if (stageNumber === 3 && (submittedFlagClean === "CV{the_vault_needs_you}" || submittedFlagClean === "CV{ther_vault_needs_you}")) {
      isCorrect = true;
    } else if (challenge.flagHash) {
      isCorrect = await bcrypt.compare(submittedFlagClean, challenge.flagHash);
    }

    // Record FlagAttempt in MongoDB
    try {
      await FlagAttempt.create({
        userId: session.userId,
        username: userDoc.username,
        stageNumber,
        success: isCorrect,
        attemptedAt: new Date(),
      });
    } catch (e) {
      console.error("Failed to log flag attempt:", e);
    }

    if (!isCorrect) {
      await stageProgress.save();
      await progress.save();
      return NextResponse.json(
        { success: false, message: "Incorrect flag. Try again." },
        { status: 400 }
      );
    }

    // 6. Handle correct flag
    stageProgress.solved = true;
    stageProgress.status = "completed";
    stageProgress.solvedAt = new Date();
    await stageProgress.save();

    if (!progress.completedStages.includes(stageNumber)) {
      const newPointsAwarded = challenge.points || 100;
      progress.completedStages.push(stageNumber);
      progress.score += newPointsAwarded;

      const nextStage = Math.min(6, stageNumber + 1);
      if (nextStage > progress.currentStage) {
        progress.currentStage = nextStage;
      }
      if (progress.completedStages.length >= 6) {
        progress.completed = true;
      }
      await progress.save();

      // Synchronize User model
      await User.findByIdAndUpdate(session.userId, {
        $addToSet: { completedStages: stageNumber },
        $set: {
          currentStage: progress.currentStage,
          score: progress.score,
        },
      });
    }

    const nextStage = Math.min(6, stageNumber + 1);
    return NextResponse.json(
      {
        success: true,
        message:
          stageNumber === 6
            ? "Correct flag! CyberVault investigation complete."
            : `Correct flag! Stage ${nextStage} unlocked.`,
        completedStage: stageNumber,
        nextStage,
        score: progress.score,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Flag submission error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during flag validation" },
      { status: 500 }
    );
  }
}
