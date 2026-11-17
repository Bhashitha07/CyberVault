import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Progress from "@/models/Progress";
import Challenge from "@/models/Challenge";
import User from "@/models/User";
import FlagForm from "@/components/FlagForm";

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ stage: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const n = Number((await params).stage);
  if (!Number.isInteger(n) || n < 1 || n > 6) notFound();

  await connectDB();

  const [p, u] = await Promise.all([
    Progress.findOne({ userId: session.userId }).lean<any>(),
    User.findById(session.userId).lean<any>(),
  ]);

  const completedStages: number[] = p?.completedStages || u?.completedStages || [];
  const currentStage: number = p?.currentStage ?? u?.currentStage ?? 1;
  const isAdmin = u?.role === "admin";

  // Server-side stage access check: allow admins to view any stage, or unlocked/completed stages
  if (!isAdmin && n > currentStage && !completedStages.includes(n)) {
    redirect("/dashboard");
  }

  // Fetch challenge and explicitly exclude flag fields
  const c = await Challenge.findOne({
    $or: [{ stageNumber: n }, { stage: n }],
  })
    .select("-flag -flagHash")
    .lean<any>();

  if (!c) {
    return (
      <main className="wrap">
        <nav className="nav">
          <Link href="/dashboard">← Dashboard</Link>
          <div className="brand">CYBERVAULT</div>
        </nav>
        <p>
          Challenge data not seeded. Run <code>npm run seed</code>.
        </p>
      </main>
    );
  }

  return (
    <main className="wrap">
      <nav className="nav">
        <Link href="/dashboard">← Dashboard</Link>
        <div className="brand">CYBERVAULT</div>
      </nav>
      <span className="tag">STAGE {String(n).padStart(2, "0")}</span>{" "}
      <span className="tag">{c.difficulty}</span>
      <h1>{c.title}</h1>
      <p className="muted">{c.domain}</p>

      <section className="card">
        <h3>Incident Brief</h3>
        <p>{c.scenario || c.description}</p>
        <h3>Objective</h3>
        <p>{c.objective || "Locate and recover the stage flag."}</p>

        {/* STAGE 1 ACTION */}
        {n === 1 && (
          <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <img
              src="/challenges/stage1/challenge.jpg"
              alt="Stage 1 challenge image"
              style={{ width: "100%", maxWidth: 520, borderRadius: 12, marginBottom: 12 }}
            />
            <p>
              <a className="btn" href="/challenges/stage1/challenge.jpg" download="challenge.jpg">
                Download Image Asset (challenge.jpg)
              </a>
            </p>
          </div>
        )}

        {/* STAGE 2 ACTION */}
        {n === 2 && (
          <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <p>Access the isolated local web challenge server:</p>
            <Link className="btn" href="/challenges/stage2/portal">
              Open Employee Portal
            </Link>
          </div>
        )}

        {/* STAGE 3 ACTION */}
        {n === 3 && (
          <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <p><strong>Intercepted Attacker Ciphertext Payload:</strong></p>
            <div
              style={{
                backgroundColor: "#0f172a",
                border: "1px solid #00f0ff",
                padding: "1rem",
                borderRadius: "8px",
                fontFamily: "monospace",
                fontSize: "1.1rem",
                color: "#00f0ff",
                wordBreak: "break-all",
              }}
            >
              PI&#123;gur_inhyg_arrqf_lbh&#125;
            </div>
            <p className="muted" style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
              Analyze the pattern and apply the appropriate classical transformation (ROT13 / Caesar cipher) to recover the plaintext.
            </p>
          </div>
        )}

        {/* STAGE 4 ACTION */}
        {n === 4 && (
          <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <p>Download the complete forensic evidence package or inspect individual logs:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              <a className="btn" href="/challenges/stage4/evidence.zip" download="evidence.zip">
                📦 Download Complete Evidence (.zip)
              </a>
              <a className="btn" style={{ backgroundColor: "#334155" }} href="/challenges/stage4/auth.log" download="auth.log">
                📄 auth.log
              </a>
              <a className="btn" style={{ backgroundColor: "#334155" }} href="/challenges/stage4/system.log" download="system.log">
                📄 system.log
              </a>
              <a className="btn" style={{ backgroundColor: "#334155" }} href="/challenges/stage4/notes/encoded_artifact.txt" download="encoded_artifact.txt">
                📄 encoded_artifact.txt
              </a>
            </div>

            <details style={{ marginTop: "0.75rem", backgroundColor: "#0f172a", padding: "0.75rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
              <summary style={{ cursor: "pointer", color: "#38bdf8", fontWeight: 600 }}>
                🔍 Quick View: Evidence Package Contents
              </summary>
              <div style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#cbd5e1" }}>
                <p>The archive contains:</p>
                <ul style={{ paddingLeft: "1.25rem", margin: "0.5rem 0" }}>
                  <li><code>auth.log</code> — Linux authentication and SSH connection log</li>
                  <li><code>system.log</code> — Kernel and system monitor logs</li>
                  <li><code>notes/encoded_artifact.txt</code> — Suspicious artifact referenced by incident logs</li>
                </ul>
              </div>
            </details>
          </div>
        )}

        {/* STAGE 5 ACTION */}
        {n === 5 && (
          <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <p>Download the captured network traffic file:</p>
            <a className="btn" href="/challenges/stage5/challenge.pcap" download>
              Download Capture File (challenge.pcap)
            </a>
          </div>
        )}

        {/* STAGE 6 ACTION */}
        {n === 6 && (
          <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
            <p>Launch the interactive isolated Linux terminal lab:</p>
            <Link className="btn" href="/challenges/stage6/terminal">
              Access Linux Lab Terminal
            </Link>
          </div>
        )}

        {/* HINTS */}
        {c.hints && c.hints[0] && (
          <details style={{ marginTop: "1rem" }}>
            <summary>Hint 1 (-5 pts)</summary>
            <p>{c.hints[0]}</p>
          </details>
        )}
        {c.hints && c.hints[1] && (
          <details>
            <summary>Hint 2 (-10 pts)</summary>
            <p>{c.hints[1]}</p>
          </details>
        )}
      </section>

      <br />
      <FlagForm stage={n} />
    </main>
  );
}
