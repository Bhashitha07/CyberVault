import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Progress from "@/models/Progress";
import User from "@/models/User";
import Logout from "@/components/Logout";

const stages = [
  ["Hidden in Plain Sight", "Steganography", "Easy"],
  ["Broken Login", "Web Security", "Easy"],
  ["The Forgotten Cipher", "Cryptography", "Moderate"],
  ["Evidence Trail", "Digital Forensics", "Moderate"],
  ["Packet Hunter", "Networking", "Moderate-Hard"],
  ["The Final Breach", "Linux/System Security", "Hard"],
];

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();

  const [p, u] = await Promise.all([
    Progress.findOne({ userId: session.userId }).lean<any>(),
    User.findById(session.userId).lean<any>(),
  ]);

  const done: number[] = p?.completedStages || u?.completedStages || [];
  const score = p?.score ?? u?.score ?? 0;
  const currentStage = p?.currentStage ?? u?.currentStage ?? 1;
  const progressPercentage = Math.round((done.length / 6) * 100);
  const isCtfCompleted = done.length >= 6;

  return (
    <main className="wrap">
      <nav className="nav">
        <div className="brand">CYBERVAULT</div>
        <div>
          {u?.username || "Investigator"} &nbsp; <Logout />
        </div>
      </nav>
      <h1>Incident Investigation</h1>
      <p className="muted">Complete all six layers and recover the final evidence.</p>

      {isCtfCompleted && (
        <div className="card ok" style={{ marginBottom: "1rem" }}>
           <strong>CTF Complete!</strong> You have successfully recovered all evidence across all six stages!
        </div>
      )}

      <div className="progress">
        <div className="bar" style={{ width: `${progressPercentage}%` }} />
      </div>
      <p>
        {done.length}/6 complete ({progressPercentage}%) · Score {score}
      </p>

      <div className="grid">
        {stages.map((x, i) => {
          const n = i + 1;
          const isDone = done.includes(n);
          const isOpen = n <= Number(currentStage) || isDone;

          return (
            <Link
              key={n}
              href={isOpen ? `/challenges/${n}` : "#"}
              className={`card ${isOpen ? "" : "locked"}`}
            >
              <span className="tag">STAGE {String(n).padStart(2, "0")}</span>
              <h2>
                {isDone ? "✓ " : isOpen ? "▶ " : "🔒 "}
                {x[0]}
              </h2>
              <p>{x[1]}</p>
              <span className="tag">{x[2]}</span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
