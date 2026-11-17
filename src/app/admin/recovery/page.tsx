import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import AdminNav from "@/components/AdminNav";
import AdminUserTable from "@/components/AdminUserTable";

export default async function AdminRecoveryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();

  const currentUser = await User.findById(session.userId);
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const rawUsers = await User.find({ role: { $ne: "admin" } })
    .select("-passwordHash")
    .sort({ username: 1 })
    .lean<any[]>();

  const users = rawUsers.map((u) => ({
    _id: String(u._id),
    username: u.username,
    email: u.email,
    role: u.role || "player",
    score: u.score || 0,
    completedStages: u.completedStages || [],
    currentStage: u.currentStage || 1,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <main className="wrap">
      <AdminNav />
      <h1>System Recovery & Progress Reset</h1>
      <p className="muted">
        Reset player CTF progress, restore clean challenge states, and review lab recovery procedures.
      </p>
      <br />

      <section className="card" style={{ marginBottom: "1.5rem" }}>
        <h3>Lab Environment Recovery Guide</h3>
        <ul style={{ paddingLeft: "1.25rem", color: "#cbd5e1", lineHeight: 1.6 }}>
          <li>
            <strong>Stage 1 (Steganography):</strong> Downloadable image asset located in{" "}
            <code>public/challenges/stage1/challenge.png</code>. Replace file with clean master copy if needed.
          </li>
          <li>
            <strong>Stage 2 (Broken Login Lab):</strong> Isolated vulnerable container located in{" "}
            <code>docker/stage2/</code>. Restart service using <code>docker restart stage2-lab</code>.
          </li>
          <li>
            <strong>Stage 6 (Linux System Security):</strong> Isolated lab container located in{" "}
            <code>docker/stage6/</code>. Re-deploy container snapshot to restore initial vulnerability state.
          </li>
        </ul>
      </section>

      <section className="card">
        <h3>Reset Player Progress</h3>
        <p className="muted" style={{ marginBottom: "1rem" }}>
          Resetting a player clears their completed stages, current stage, and score back to Stage 1 (0 points).
        </p>
        <AdminUserTable initialUsers={users} />
      </section>
    </main>
  );
}
