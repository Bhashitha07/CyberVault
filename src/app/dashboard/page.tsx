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
  const activeStageNumber = Math.min(Math.max(Number(currentStage) || 1, 1), stages.length);
  const activeStage = stages[activeStageNumber - 1];
  const displayName = u?.username || "Investigator";

  return (
    <main className="player-dashboard">
      <aside className="player-sidebar" aria-label="Player navigation">
        <Link className="brand-link player-sidebar-brand" href="/" aria-label="CyberVault home">
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
        <span className="player-sidebar-caption">INVESTIGATOR WORKSPACE</span>
        <nav className="player-sidebar-nav" aria-label="Dashboard sections">
          <a className="player-sidebar-link is-active" href="#overview">
            <span aria-hidden="true">01</span> Overview
          </a>
          <a className="player-sidebar-link" href="#stages">
            <span aria-hidden="true">02</span> Challenges
          </a>
        </nav>
        <div className="player-sidebar-footer">
          <span>CYBERVAULT CTF</span>
          <span>6-STAGE INVESTIGATION</span>
        </div>
      </aside>

      <div className="player-dashboard-main">
        <header className="player-dashboard-topbar">
          <div className="player-breadcrumb">
            <span>WORKSPACE</span><span aria-hidden="true">/</span> OVERVIEW
          </div>
          <div className="player-topbar-actions">
            <span className="player-account-name">{displayName}</span>
            <Logout />
          </div>
        </header>

        <div className="player-dashboard-content">
          <section className="player-welcome" id="overview" aria-labelledby="player-dashboard-title">
            <div>
              <span className="player-section-label">PLAYER DASHBOARD</span>
              <h1 id="player-dashboard-title">Welcome back, {displayName}.</h1>
              <p>Here’s the latest on your CyberVault investigation.</p>
            </div>
            <span className={`player-overall-status${isCtfCompleted ? " is-complete" : ""}`}>
              <span className="status-dot" />
              {isCtfCompleted ? "INVESTIGATION COMPLETE" : "INVESTIGATION IN PROGRESS"}
            </span>
          </section>

          <section className="player-summary-grid" aria-label="Investigation summary">
            <article className="player-summary-card">
              <span className="player-summary-label">STAGES COMPLETE</span>
              <strong>{done.length}<span> / 6</span></strong>
              <p>Challenges finished</p>
            </article>
            <article className="player-summary-card">
              <span className="player-summary-label">CURRENT STAGE</span>
              <strong>{isCtfCompleted ? "06" : String(activeStageNumber).padStart(2, "0")}</strong>
              <p>{isCtfCompleted ? "All stages complete" : activeStage[0]}</p>
            </article>
            <article className="player-summary-card">
              <span className="player-summary-label">TOTAL SCORE</span>
              <strong>{score}</strong>
              <p>Points earned</p>
            </article>
          </section>

          <section className="player-next-card" aria-labelledby="player-next-title">
            <div className="player-next-copy">
              <span className="player-section-label">
                {isCtfCompleted ? "CASE COMPLETE" : "PICK UP WHERE YOU LEFT OFF"}
              </span>
              <h2 id="player-next-title">
                {isCtfCompleted ? "Your investigation is complete." : activeStage[0]}
              </h2>
              <p>
                {isCtfCompleted
                  ? "You have recovered the evidence across all six stages."
                  : `${activeStage[1]} · ${activeStage[2]} · Stage ${String(activeStageNumber).padStart(2, "0")}`}
              </p>
              <Link className="player-continue-button" href={`/challenges/${currentStage}`}>
                {isCtfCompleted ? "Review final stage" : "Continue challenge"}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="player-next-progress">
              <div className="player-next-progress-header">
                <span>OVERALL PROGRESS</span>
                <strong>{progressPercentage}%</strong>
              </div>
              <div
                className="player-progress-track"
                role="progressbar"
                aria-label="Investigation completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercentage}
                aria-valuetext={`${done.length} of 6 stages complete`}
              >
                <div className="player-progress-fill" style={{ width: `${progressPercentage}%` }} />
              </div>
              <p>{done.length} of 6 stages completed</p>
            </div>
          </section>

          <section className="player-stages" id="stages" aria-labelledby="player-stages-title">
            <header className="player-stages-header">
              <div>
                <span className="player-section-label">YOUR CHALLENGES</span>
                <h2 id="player-stages-title">Investigation roadmap</h2>
                <p>Complete each stage to unlock the next challenge.</p>
              </div>
              <span className="player-stages-count">{done.length} / 6 COMPLETE</span>
            </header>

            <div className="player-stage-grid">
              {stages.map((stage, i) => {
                const n = i + 1;
                const isDone = done.includes(n);
                const isOpen = n <= Number(currentStage) || isDone;
                const status = isDone ? "COMPLETED" : isOpen ? "AVAILABLE" : "LOCKED";
                const cardContent = (
                  <>
                    <div className="player-stage-card-top">
                      <span className="player-stage-number">STAGE {String(n).padStart(2, "0")}</span>
                      <span className={`player-stage-status${isDone ? " is-complete" : isOpen ? " is-open" : ""}`}>
                        {status}
                      </span>
                    </div>
                    <h3>{isDone && <span aria-hidden="true">✓ </span>}{stage[0]}</h3>
                    <p className="player-stage-domain">{stage[1]}</p>
                    <div className="player-stage-card-footer">
                      <span>{stage[2]}</span>
                      {isOpen && <span aria-hidden="true">→</span>}
                    </div>
                  </>
                );

                return isOpen ? (
                  <Link className="player-stage-card is-open" href={`/challenges/${n}`} key={n}>
                    {cardContent}
                  </Link>
                ) : (
                  <article className="player-stage-card is-locked" key={n} aria-label={`Stage ${n}, locked`}>
                    {cardContent}
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
