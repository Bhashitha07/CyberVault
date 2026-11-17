import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import AdminNav from "@/components/AdminNav";
import AdminUserTable from "@/components/AdminUserTable";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();

  const currentUser = await User.findById(session.userId);
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const rawUsers = await User.find().select("-passwordHash").sort({ createdAt: -1 }).lean<any[]>();

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
      <h1>User Management</h1>
      <p className="muted">Inspect registered platform accounts, view user scores, and manage CTF progress.</p>
      <br />
      <section className="card">
        <AdminUserTable initialUsers={users} />
      </section>
    </main>
  );
}
