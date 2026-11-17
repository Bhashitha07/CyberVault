"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FlagForm({ stage }: { stage: number }) {
  const [flag, setFlag] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!flag.trim() || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/flags/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageNumber: stage, flag }),
      });

      const data = await res.json();
      setMessage(data.message || (res.ok ? "Correct flag!" : "Incorrect flag. Try again."));
      setIsSuccess(res.ok);

      if (res.ok) {
        setFlag("");
        router.refresh();
      }
    } catch {
      setMessage("Error submitting flag. Please try again.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return ( <form onSubmit={handleSubmit} className="card">
      <h3>Submit Flag</h3>
      <input
        className="input"
        name="flag"
        value={flag}
        onChange={(e) => setFlag(e.target.value)}
        placeholder="CV{...}"
        disabled={loading}
        required
      />
      <button className="btn" disabled={loading}>
        {loading ? "Validating..." : "Submit Flag"}
      </button>
      {message && <p className={isSuccess ? "ok" : "bad"}>{message}</p>}
    </form>
  );
}
   
