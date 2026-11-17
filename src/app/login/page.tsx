"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const identifier = formData.get("identifier");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.role === "admin" || data.redirect === "/admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setMessage(data.message || "Invalid credentials");
      }
    } catch {
      setMessage("An error occurred during login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <nav className="site-nav auth-nav" aria-label="Main navigation">
        <Link className="brand-link" href="/" aria-label="CyberVault home">
          <span className="brand-lockup">
            <span className="logo-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 10V7.5a7 7 0 0 1 14 0V10" />
                <rect x="3.5" y="10" width="17" height="11" rx="3" />
                <path d="M12 14v3" />
              </svg>
            </span>
            <span className="brand">CYBERVAULT</span>
          </span>
        </Link>
        <Link className="auth-back" href="/">← Back to home</Link>
      </nav>

      <div className="auth-layout">
        <section className="auth-aside">
          <div className="eyebrow"><span className="status-dot" /> YOUR CASE IS STILL OPEN</div>
          <h1>Pick up where<br />you left off.</h1>
          <p>Sign in to continue your investigation and unlock the next piece of evidence.</p>
          <div className="auth-quote">
            <span className="auth-quote-mark">“</span>
            <span>Every detail matters. Every clue gets you closer.</span>
          </div>
        </section>

        <section className="auth-card" aria-labelledby="login-title">
          <header className="auth-card-header">
            <div className="eyebrow">INVESTIGATOR ACCESS</div>
            <h2 id="login-title">Welcome back</h2>
            <p>Enter your account details to access the vault.</p>
          </header>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="identifier">Username or email</label>
              <input
                autoComplete="username"
                className="input"
                id="identifier"
                name="identifier"
                placeholder="e.g. alex or alex@example.com"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                autoComplete="current-password"
                className="input"
                id="password"
                name="password"
                placeholder="Enter your password"
                type="password"
                required
              />
            </div>
            <button className="btn auth-submit" disabled={loading} type="submit">
              {loading ? "Signing in..." : "Sign in to CyberVault"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>
          {message && <p className="auth-message" role="alert">{message}</p>}
          <p className="auth-switch">
            New to the investigation? <Link href="/register">Create an account</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
