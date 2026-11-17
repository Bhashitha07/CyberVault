import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Challenge from "@/models/Challenge";
import Progress from "@/models/Progress";
import FlagAttempt from "@/models/FlagAttempt";
import AdminNav from "@/components/AdminNav";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();

  const currentUser = await User.findById(session.userId);
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const [
    totalUsers,
    totalChallenges,
    allProgresses,
    totalAttempts,
    successAttempts,
    failAttempts,
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

  const maxStageCount = Math.max(...stageCompletions, 1);

  return (
    <main className="wrap">
      <AdminNav />
      <h1>CyberVault Admin Dashboard</h1>
      <p className="muted">Overall CTF platform metrics, stage completion analytics, and system monitoring.</p>

      {/* Summary Cards Grid */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <div className="card">
          <span className="tag">USERS</span>
          <h2>{totalUsers}</h2>
          <p className="muted">Total Registered</p>
        </div>
        <div className="card">
          <span className="tag">CHALLENGES</span>
          <h2>{totalChallenges || 6}</h2>
          <p className="muted">Total Stages</p>
        </div>
        <div className="card">
          <span className="tag">COMPLETED</span>
          <h2>{completedPlayers}</h2>
          <p className="muted">Finished CTF (100%)</p>
        </div>
        <div className="card">
          <span className="tag">ACTIVE</span>
          <h2>{activePlayers}</h2>
          <p className="muted">Started CTF</p>
        </div>
        <div className="card">
          <span className="tag">ATTEMPTS</span>
          <h2>{totalAttempts}</h2>
          <p className="muted">Flag Submissions</p>
        </div>
        <div className="card">
          <span className="tag">CORRECT / FAILED</span>
          <h2>
            <span style={{ color: "#10b981" }}>{successAttempts}</span> /{" "}
            <span style={{ color: "#ef4444" }}>{failAttempts}</span>
          </h2>
          <p className="muted">Validation Breakdown</p>
        </div>
      </div>

      <br />

      {/* Stage Completion Visual Bars */}
      <section className="card">
        <h3>Stage Completion Distribution</h3>
        <p className="muted" style={{ marginBottom: "1rem" }}>
          Number of players who have successfully solved each stage.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {stageCompletions.map((count, idx) => {
            const stageNum = idx + 1;
            const pct = Math.round((count / maxStageCount) * 100);
            return (
              <div key={stageNum} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ width: "80px", fontWeight: "bold", fontSize: "0.9rem" }}>
                  Stage {stageNum}
                </span>
                <div style={{ flex: 1, backgroundColor: "#1e293b", height: "20px", borderRadius: "6px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      backgroundColor: "#00f0ff",
                      height: "100%",
                      borderRadius: "6px",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <span style={{ width: "60px", textAlign: "right", fontWeight: "bold" }}>
                  {count} {count === 1 ? "user" : "users"}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
