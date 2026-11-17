import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import Progress from "@/models/Progress";
import UserProgress from "@/models/UserProgress";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.errorResponse!;

  const { id } = await params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Reset User fields
    user.score = 0;
    user.completedStages = [];
    user.currentStage = 1;
    await user.save();

    // Reset Progress fields
    await Progress.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          score: 0,
          completedStages: [],
          currentStage: 1,
          attempts: 0,
          completed: false,
        },
      },
      { upsert: true }
    );

    // Delete or reset UserProgress documents for this user
    await UserProgress.deleteMany({ userId: user._id });

    return NextResponse.json({
      success: true,
      message: `Successfully reset progress for ${user.username}`,
    });
  } catch (error) {
    console.error("Admin user progress reset error:", error);
    return NextResponse.json(
      { message: "Internal server error resetting player progress" },
      { status: 500 }
    );
  }
}
