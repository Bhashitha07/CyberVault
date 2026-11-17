import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Challenge from "@/models/Challenge";
import AdminNav from "@/components/AdminNav";
import AdminChallengeEditor from "@/components/AdminChallengeEditor";

export default async function AdminChallengesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();

  const currentUser = await User.findById(session.userId);
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const rawChallenges = await Challenge.find()
    .select("-flag -flagHash")
    .sort({ stageNumber: 1 })
    .lean<any[]>();

  const challenges = rawChallenges.map((c) => ({
    _id: String(c._id),
    stageNumber: c.stageNumber || c.stage || 1,
    title: c.title,
    domain: c.domain,
    difficulty: c.difficulty,
    points: c.points || 100,
    scenario: c.scenario || c.description || "",
    objective: c.objective || "",
    hints: c.hints || [],
  }));

  return (
    <main className="wrap">
      <AdminNav />
      <h1>Challenge Management</h1>
      <p className="muted">Configure titles, point values, hints, and objectives for all 6 CTF stages.</p>
      <br />
      <AdminChallengeEditor initialChallenges={challenges} />
    </main>
  );
}
