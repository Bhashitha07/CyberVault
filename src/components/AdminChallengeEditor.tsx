"use client";

import { useState } from "react";

interface ChallengeItem {
  _id: string;
  stageNumber: number;
  title: string;
  domain: string;
  difficulty: string;
  points: number;
  scenario?: string;
  objective?: string;
  hints?: string[];
}

export default function AdminChallengeEditor({ initialChallenges }: { initialChallenges: ChallengeItem[] }) {
  const [challenges, setChallenges] = useState<ChallengeItem[]>(initialChallenges);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ChallengeItem>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function startEdit(c: ChallengeItem) {
    setEditingId(c._id);
    setEditForm({
      title: c.title,
      domain: c.domain,
      difficulty: c.difficulty,
      points: c.points,
      scenario: c.scenario || "",
      objective: c.objective || "",
      hints: c.hints || ["", ""],
    });
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function handleSave(id: string) {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/challenges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Challenge metadata updated successfully.");
        setChallenges((prev) =>
          prev.map((c) => (c._id === id ? { ...c, ...editForm } as ChallengeItem : c))
        );
        setEditingId(null);
      } else {
        setMessage(data.message || "Failed to update challenge.");
      }
    } catch {
      setMessage("Error updating challenge.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {message && <p className="ok" style={{ marginBottom: "1rem" }}>{message}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {challenges.map((c) => {
          const isEditing = editingId === c._id;

          return (
            <div key={c._id} className="card" style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span className="tag">STAGE {String(c.stageNumber).padStart(2, "0")}</span>{" "}
                  <span className="tag">{c.difficulty}</span>
                  <h2>{c.title}</h2>
                  <p className="muted">{c.domain} · {c.points} points</p>
                </div>
                {!isEditing && (
                  <button className="btn" style={{ fontSize: "0.85rem" }} onClick={() => startEdit(c)}>
                    Edit Metadata
                  </button>
                )}
              </div>

              {isEditing ? (
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #334155" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Title</label>
                      <input
                        className="input"
                        value={editForm.title || ""}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Difficulty</label>
                      <input
                        className="input"
                        value={editForm.difficulty || ""}
                        onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Domain</label>
                      <input
                        className="input"
                        value={editForm.domain || ""}
                        onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Points</label>
                      <input
                        type="number"
                        className="input"
                        value={editForm.points ?? 100}
                        onChange={(e) => setEditForm({ ...editForm, points: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Incident Scenario / Description</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={editForm.scenario || ""}
                      onChange={(e) => setEditForm({ ...editForm, scenario: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Objective</label>
                    <input
                      className="input"
                      value={editForm.objective || ""}
                      onChange={(e) => setEditForm({ ...editForm, objective: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Hint 1</label>
                    <input
                      className="input"
                      value={editForm.hints?.[0] || ""}
                      onChange={(e) => {
                        const newHints = [...(editForm.hints || ["", ""])];
                        newHints[0] = e.target.value;
                        setEditForm({ ...editForm, hints: newHints });
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Hint 2</label>
                    <input
                      className="input"
                      value={editForm.hints?.[1] || ""}
                      onChange={(e) => {
                        const newHints = [...(editForm.hints || ["", ""])];
                        newHints[1] = e.target.value;
                        setEditForm({ ...editForm, hints: newHints });
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn" disabled={saving} onClick={() => handleSave(c._id)}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      className="btn"
                      style={{ backgroundColor: "#475569" }}
                      disabled={saving}
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#cbd5e1" }}>
                  <p><strong>Scenario:</strong> {c.scenario || "N/A"}</p>
                  <p><strong>Objective:</strong> {c.objective || "N/A"}</p>
                  {c.hints && c.hints.length > 0 && (
                    <p><strong>Hints:</strong> {c.hints.join(" | ")}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
