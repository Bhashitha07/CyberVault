"use client";

import { useState } from "react";
import Link from "next/link";

export default function Stage2PortalPage() {
  const [username, setUsername] = useState("employee1");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState("guest");
  const [message, setMessage] = useState("");
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setResultData(null);

    try {
      const res = await fetch("/api/challenges/stage2/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role,
          authenticated: false,
        }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok && data.success) {
        setResultData(data);
      }
    } catch {
      setMessage("Connection error to Employee Portal service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <nav className="nav">
        <Link href="/challenges/2">← Back to Challenge 2 Brief</Link>
        <div className="brand">INTERNAL EMPLOYEE PORTAL</div>
      </nav>

      <span className="tag">ISOLATED LAB APP</span>
      <h1>Internal Employee Access Portal</h1>
      <p className="muted">
        Restricted Corporate System — Access permitted strictly for employees. Inspect request parameters to analyze authorization.
      </p>

      <br />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="card">
          <h3>Portal Authentication</h3>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Username</label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Hidden / Editable request parameter for investigation */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                Client Authorization Role (Inspect Request)
              </label>
              <input
                className="input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <span className="muted" style={{ fontSize: "0.75rem" }}>
               Current body payload: <code>{JSON.stringify({ role })}</code>
              </span>
            </div>

            <button className="btn" disabled={loading}>
              {loading ? "Authenticating..." : "Login to Portal"}
            </button>
          </form>

          {message && (
            <p className={resultData ? "ok" : "bad"} style={{ marginTop: "1rem" }}>
              {message}
            </p>
          )}
        </div>

        <div>
          {resultData ? (
            <div className="card ok">
              <h3>🎉 Access Granted - Protected Area</h3>
              <p><strong>Employee:</strong> {resultData.protectedData?.employee}</p>
              <p><strong>Department:</strong> {resultData.protectedData?.department}</p>
              <br />
              <div style={{ backgroundColor: "#022c22", padding: "1rem", borderRadius: "8px", border: "1px solid #059669" }}>
                <p style={{ color: "#10b981", fontWeight: "bold" }}>STAGE 2 FLAG:</p>
                <code style={{ fontSize: "1.1rem", color: "#6ee7b7" }}>{resultData.flag}</code>
              </div>
              <br />
              <div style={{ backgroundColor: "#1e293b", padding: "1rem", borderRadius: "8px" }}>
                <p style={{ color: "#00f0ff", fontWeight: "bold" }}>Stage 3 Investigation Clue:</p>
                <p>{resultData.clue}</p>
              </div>
            </div>
          ) : (
            <div className="card">
              <h3>Investigation Notes</h3>
              <p className="muted">
                Analyze HTTP requests sent to <code>/api/challenges/stage2/login</code>.
                Check if the authentication decision trusts client-controlled parameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
