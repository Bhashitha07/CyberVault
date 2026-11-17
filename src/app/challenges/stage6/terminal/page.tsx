"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface HistoryItem {
  cmd: string;
  output: string;
}

export default function Stage6TerminalPage() {
  const [inputCmd, setInputCmd] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      cmd: "system-connect --target stage6-lab --user analyst",
      output: "Connected to Stage 6 Isolated Linux Environment (stage6-lab).\nType 'whoami', 'id', 'ls -la', or 'sudo -l' to begin system enumeration.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputCmd.trim() || loading) return;

    const cmd = inputCmd.trim();
    setInputCmd("");
    setLoading(true);

    try {
      const res = await fetch("/api/challenges/stage6/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });

      const data = await res.json();
      setHistory((prev) => [...prev, { cmd, output: data.output || "" }]);
    } catch {
      setHistory((prev) => [...prev, { cmd, output: "Error executing command." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <nav className="nav">
        <Link href="/challenges/6">← Back to Stage 6 Brief</Link>
        <div className="brand">STAGE 6 LINUX LAB TERMINAL</div>
      </nav>

      <span className="tag">CAPSTONE LAB</span>
      <h1>Isolated Linux Target Terminal (stage6-lab)</h1>
      <p className="muted">
        System Security Capstone — Enumerate local permissions, discover misconfiguration, and recover final flag.
      </p>

      <br />

      <div
        style={{
          backgroundColor: "#090d16",
          border: "1px solid #1e293b",
          borderRadius: "12px",
          padding: "1.25rem",
          fontFamily: "monospace",
          fontSize: "0.95rem",
          minHeight: "380px",
          maxHeight: "520px",
          overflowY: "auto",
        }}
      >
        {history.map((h, i) => (
          <div key={i} style={{ marginBottom: "1rem" }}>
            <div style={{ color: "#00f0ff" }}>
              <span style={{ color: "#10b981" }}>analyst@stage6-lab:~$</span> {h.cmd}
            </div>
            <pre
              style={{
                color: "#e2e8f0",
                whiteSpace: "pre-wrap",
                margin: "0.4rem 0 0 0",
                fontFamily: "monospace",
              }}
            >
              {h.output}
            </pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <input
          className="input"
          style={{ fontFamily: "monospace", flex: 1 }}
          value={inputCmd}
          onChange={(e) => setInputCmd(e.target.value)}
          placeholder="e.g. whoami, id, ls -la, sudo -l, sudo find /opt -exec cat {} \;"
          disabled={loading}
          autoFocus
        />
        <button className="btn" disabled={loading}>
          {loading ? "Exec..." : "Run Command"}
        </button>
      </form>
    </main>
  );
}
