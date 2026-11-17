import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import FlagAttempt from "@/models/FlagAttempt";
import AdminNav from "@/components/AdminNav";

export default async function AdminSubmissionsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();

  const currentUser = await User.findById(session.userId);
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const submissions = await FlagAttempt.find()
    .sort({ attemptedAt: -1 })
    .limit(100)
    .lean<any[]>();

  return (
    <main className="wrap">
      <AdminNav />
      <h1>Flag Attempt Logs</h1>
      <p className="muted">Recent flag submissions by players for live auditing and verification.</p>
      <br />

      <section className="card">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #334155", color: "#94a3b8" }}>
                <th style={{ padding: "0.75rem" }}>Player</th>
                <th style={{ padding: "0.75rem" }}>Target Stage</th>
                <th style={{ padding: "0.75rem" }}>Result</th>
                <th style={{ padding: "0.75rem" }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={String(sub._id)} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{sub.username || "Anonymous"}</td>
                  <td style={{ padding: "0.75rem" }}>Stage {sub.stageNumber}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span
                      className="tag"
                      style={{
                        backgroundColor: sub.success ? "#10b981" : "#ef4444",
                        color: "#ffffff",
                      }}
                    >
                      {sub.success ? "CORRECT" : "INCORRECT"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                    {sub.attemptedAt
                      ? new Date(sub.attemptedAt).toLocaleString()
                      : new Date(sub.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "1rem", textAlign: "center", color: "#94a3b8" }}>
                    No flag submission attempts recorded yet.
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
