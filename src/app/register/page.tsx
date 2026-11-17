"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Register() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (!username) {
      setMessage("Please enter a username.");
      return;
    }
    if (!emailPattern.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const responseText = await response.text();
      let data: { message?: string; success?: boolean } | null = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText) as { message?: string; success?: boolean };
        } catch {
          setMessage("The server returned an invalid response. Please try again.");
          return;
        }
      }

      if (!response.ok) {
        setMessage(
          data?.message || `Registration failed (HTTP ${response.status}). Please try again.`
        );
        return;
      }
      if (data?.success !== true) {
        setMessage("The server returned an invalid response. Please try again.");
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setMessage("Unable to reach the server. Check your connection and try again.");
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
          <div className="eyebrow"><span className="status-dot" /> YOUR INVESTIGATION STARTS HERE</div>
          <h1>Curiosity is<br />your best tool.</h1>
          <p>Create an investigator account and follow a trail of clues across six hands-on challenges.</p>
          <div className="auth-quote">
            <span className="auth-quote-mark">✳</span>
            <span>One account. Six stages. A vault waiting to be opened.</span>
          </div>
        </section>

        <section className="auth-card" aria-labelledby="register-title">
          <header className="auth-card-header">
            <div className="eyebrow">NEW INVESTIGATOR</div>
            <h2 id="register-title">Create your account</h2>
            <p>Set up your profile to save your progress.</p>
          </header>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                autoComplete="username"
                className="input"
                id="username"
                name="username"
                placeholder="Choose a username"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                autoComplete="email"
                className="input"
                id="email"
                name="email"
                placeholder="you@example.com"
                type="email"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                autoComplete="new-password"
                className="input"
                id="password"
                name="password"
                placeholder="At least 8 characters"
                type="password"
                minLength={8}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="confirm">Confirm password</label>
              <input
                autoComplete="new-password"
                className="input"
                id="confirm"
                name="confirm"
                placeholder="Enter your password again"
                type="password"
                required
              />
            </div>
            <button className="btn auth-submit" disabled={loading} type="submit">
              {loading ? "Creating account..." : "Create investigator account"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>
          {message && <p className="auth-message" role="alert">{message}</p>}
          <p className="auth-switch">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
