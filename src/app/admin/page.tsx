import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Challenge from "@/models/Challenge";
import Progress from "@/models/Progress";
import FlagAttempt from "@/models/FlagAttempt";
import AdminNav from "@/components/AdminNav";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();

  const currentUser = await User.findById(session.userId);
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const [
    totalUsers,
    totalChallenges,
    allProgresses,
    totalAttempts,
    successAttempts,
    failAttempts,
  ] = await Promise.all([
    User.countDocuments(),
    Challenge.countDocuments(),
    Progress.find().lean<any>(),
    FlagAttempt.countDocuments(),
    FlagAttempt.countDocuments({ success: true }),
    FlagAttempt.countDocuments({ success: false }),
  ]);

  let completedPlayers = 0;
  let activePlayers = 0;
  const stageCompletions = [0, 0, 0, 0, 0, 0];

  for (const p of allProgresses) {
    const done: number[] = p.completedStages || [];
    if (done.length > 0) activePlayers++;
    if (done.length >= 6 || p.completed) completedPlayers++;

    for (const stageNum of done) {
      if (stageNum >= 1 && stageNum <= 6) {
        stageCompletions[stageNum - 1]++;
      }
    }
  }

  const maxStageCount = Math.max(...stageCompletions, 1);

  return (
    <main className="admin-dashboard">
      <AdminNav variant="dashboard" />
      <header className="admin-dashboard-hero">
        <div>
          <div className="eyebrow"><span className="status-dot" /> ADMINISTRATION / OVERVIEW</div>
          <h1>Command center<span>.</span></h1>
          <p>Monitor investigators, challenge progress, and activity across CyberVault.</p>
        </div>
        <div className="admin-dashboard-session">
          <span className="admin-session-label">CONTROL PANEL</span>
          <span className="admin-session-indicator"><span className="status-dot" /> LIVE PLATFORM DATA</span>
          <span className="admin-session-note">Metrics refresh with each visit.</span>
        </div>
      </header>

      <section className="admin-metrics" aria-label="Platform metrics">
        <article className="admin-metric-card">
          <div className="admin-metric-heading">
            <span>REGISTERED USERS</span>
            <span className="admin-metric-index">01</span>
          </div>
          <strong className="admin-metric-value">{totalUsers}</strong>
          <p>Total accounts on the platform</p>
        </article>
        <article className="admin-metric-card">
          <div className="admin-metric-heading">
            <span>CHALLENGES</span>
            <span className="admin-metric-index">02</span>
          </div>
          <strong className="admin-metric-value">{totalChallenges || 6}</strong>
          <p>Stages in the investigation</p>
        </article>
        <article className="admin-metric-card">
          <div className="admin-metric-heading">
            <span>COMPLETED</span>
            <span className="admin-metric-index">03</span>
          </div>
          <strong className="admin-metric-value">{completedPlayers}</strong>
          <p>Players who finished all stages</p>
        </article>
        <article className="admin-metric-card">
          <div className="admin-metric-heading">
            <span>ACTIVE</span>
            <span className="admin-metric-index">04</span>
          </div>
          <strong className="admin-metric-value">{activePlayers}</strong>
          <p>Players who started the CTF</p>
        </article>
        <article className="admin-metric-card">
          <div className="admin-metric-heading">
            <span>FLAG ATTEMPTS</span>
            <span className="admin-metric-index">05</span>
          </div>
          <strong className="admin-metric-value">{totalAttempts}</strong>
          <p>Total submissions received</p>
        </article>
        <article className="admin-metric-card admin-metric-card-results">
          <div className="admin-metric-heading">
            <span>VALIDATION RESULTS</span>
            <span className="admin-metric-index">06</span>
          </div>
          <strong className="admin-metric-value">
            <span className="admin-result-success">{successAttempts}</span>
            <span className="admin-result-divider">/</span>
            <span className="admin-result-failed">{failAttempts}</span>
          </strong>
          <p>Correct <span className="admin-result-success">/</span> failed</p>
        </article>
      </section>

      <section className="admin-stage-panel" aria-labelledby="admin-stage-title">
        <header className="admin-stage-panel-header">
          <div>
            <span className="admin-section-kicker">INVESTIGATION FLOW</span>
            <h2 id="admin-stage-title">Stage completion</h2>
            <p>Players who have successfully solved each stage.</p>
          </div>
          <span className="admin-stage-total">
            {stageCompletions.reduce((total, count) => total + count, 0)} TOTAL COMPLETIONS
          </span>
        </header>

        <div className="admin-stage-list">
          {stageCompletions.map((count, idx) => {
            const stageNum = idx + 1;
            const pct = Math.round((count / maxStageCount) * 100);
            return (
              <div className="admin-stage-row" key={stageNum}>
                <div className="admin-stage-label">
                  <span className="admin-stage-number">{String(stageNum).padStart(2, "0")}</span>
                  <span>Stage {stageNum}</span>
                </div>
                <div
                  className="admin-stage-track"
                  role="progressbar"
                  aria-label={`Stage ${stageNum} completions`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  aria-valuetext={`${count} ${count === 1 ? "user" : "users"}`}
                >
                  <div className="admin-stage-bar" style={{ width: `${pct}%` }} />
                </div>
                <span className="admin-stage-count">
                  {count} <span>{count === 1 ? "user" : "users"}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
