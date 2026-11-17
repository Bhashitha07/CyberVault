import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Progress from "@/models/Progress";
import AdminNav from "@/components/AdminNav";

export default async function AdminProgressPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();

  const currentUser = await User.findById(session.userId);
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const [users, progresses] = await Promise.all([
    User.find({ role: { $ne: "admin" } }).select("username email score completedStages currentStage").lean<any[]>(),
    Progress.find().lean<any[]>(),
  ]);

  const progressMap = new Map();
  for (const p of progresses) {
    progressMap.set(String(p.userId), p);
  }

  return (
    <main className="wrap">
      <AdminNav />
      <h1>Player Progression Tracking</h1>
      <p className="muted">Live overview of student progression through all six CyberVault CTF stages.</p>
      <br />

      <section className="card">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #334155", color: "#94a3b8" }}>
                <th style={{ padding: "0.75rem" }}>Player</th>
                <th style={{ padding: "0.75rem" }}>Completed Stages</th>
                <th style={{ padding: "0.75rem" }}>Current Stage</th>
                <th style={{ padding: "0.75rem" }}>Score</th>
                <th style={{ padding: "0.75rem" }}>Status</th>
                <th style={{ padding: "0.75rem" }}>Stage Matrix (1..6)</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const prog = progressMap.get(String(u._id)) || {};
                const completed: number[] = prog.completedStages || u.completedStages || [];
                const currentStage = prog.currentStage || u.currentStage || 1;
                const score = prog.score ?? u.score ?? 0;
                const isFinished = completed.length >= 6 || prog.completed;

                return (
                  <tr key={String(u._id)} style={{ borderBottom: "1px solid #1e293b" }}>
                    <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{u.username}</td>
                    <td style={{ padding: "0.75rem" }}>
                      {completed.length > 0 ? completed.sort((a, b) => a - b).join(", ") : "None"}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      {isFinished ? "CTF Complete" : `Stage ${currentStage}`}
                    </td>
                    <td style={{ padding: "0.75rem", fontWeight: "bold", color: "#00f0ff" }}>
                      {score} pts
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <span
                        className="tag"
                        style={{
                          backgroundColor: isFinished ? "#10b981" : completed.length > 0 ? "#0284c7" : "#64748b",
                        }}
                      >
                        {isFinished ? "COMPLETED" : completed.length > 0 ? "IN PROGRESS" : "NOT STARTED"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        {[1, 2, 3, 4, 5, 6].map((sNum) => {
                          const isDone = completed.includes(sNum);
                          const isCurrent = sNum === currentStage && !isFinished;
                          return (
                            <span
                              key={sNum}
                              title={`Stage ${sNum}: ${isDone ? "Completed" : isCurrent ? "Unlocked" : "Locked"}`}
                              style={{
                                width: "22px",
                                height: "22px",
                                borderRadius: "4px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                backgroundColor: isDone ? "#10b981" : isCurrent ? "#0284c7" : "#334155",
                                color: "#ffffff",
                              }}
                            >
                              {sNum}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "1rem", textAlign: "center", color: "#94a3b8" }}>
                    No registered players found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
