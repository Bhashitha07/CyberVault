"use client";

import { useState } from "react";

interface UserItem {
  _id: string;
  username: string;
  email: string;
  role: string;
  score: number;
  completedStages: number[];
  currentStage: number;
  createdAt: string;
}

export default function AdminUserTable({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  async function handleResetProgress(userId: string, username: string) {
    if (!confirm(`Are you sure you want to reset CTF progress for player "${username}"?`)) {
      return;
    }

    setLoadingId(userId);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-progress`, {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Progress reset successfully for ${username}.`);
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, score: 0, completedStages: [], currentStage: 1 } : u
          )
        );
      } else {
        setMessage(data.message || "Failed to reset player progress.");
      }
    } catch {
      setMessage("Error processing reset request.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      {message && <p className="ok" style={{ marginBottom: "1rem" }}>{message}</p>}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #334155", color: "#94a3b8" }}>
              <th style={{ padding: "0.75rem" }}>Username</th>
              <th style={{ padding: "0.75rem" }}>Email</th>
              <th style={{ padding: "0.75rem" }}>Role</th>
              <th style={{ padding: "0.75rem" }}>Current Stage</th>
              <th style={{ padding: "0.75rem" }}>Completed</th>
              <th style={{ padding: "0.75rem" }}>Score</th>
              <th style={{ padding: "0.75rem" }}>Joined</th>
              <th style={{ padding: "0.75rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: "1px solid #1e293b" }}>
                <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{u.username}</td>
                <td style={{ padding: "0.75rem" }}>{u.email}</td>
                <td style={{ padding: "0.75rem" }}>
                  <span className="tag" style={{ backgroundColor: u.role === "admin" ? "#8b5cf6" : "#0284c7" }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "0.75rem" }}>Stage {u.currentStage || 1}</td>
                <td style={{ padding: "0.75rem" }}>
                  {u.completedStages && u.completedStages.length > 0
                    ? u.completedStages.sort((a, b) => a - b).join(", ")
                    : "None"}
                </td>
                <td style={{ padding: "0.75rem", fontWeight: "bold", color: "#00f0ff" }}>
                  {u.score || 0} pts
                </td>
                <td style={{ padding: "0.75rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "0.75rem" }}>
                  {u.role !== "admin" && (
                    <button
                      className="btn"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", backgroundColor: "#dc2626" }}
                      disabled={loadingId === u._id}
                      onClick={() => handleResetProgress(u._id, u.username)}
                    >
                      {loadingId === u._id ? "Resetting..." : "Reset Progress"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
