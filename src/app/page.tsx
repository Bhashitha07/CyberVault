import Link from "next/link";

const stages = [
  { number: "01", name: "Steganography", state: "READY" },
  { number: "02", name: "Web security", state: "LOCKED" },
  { number: "03", name: "Cryptography", state: "LOCKED" },
];

function BrandMark() {
  return (
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
  );
}

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand-link" href="/" aria-label="CyberVault home">
          <BrandMark />
        </Link>
        <div className="nav-actions">
          <Link className="nav-login" href="/login">Log in</Link>
          <Link className="btn btn-small" href="/register">Create account</Link>
        </div>
      </nav>

      <section className="home-hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> INTERACTIVE CYBERSECURITY CHALLENGE</div>
          <h1>Every clue opens<br />another <span>door.</span></h1>
          <p className="hero-description">
            Follow the evidence through six hands-on security challenges. Think like an investigator,
            uncover what was hidden, and find your way into the vault.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/register">
              Start your investigation <span aria-hidden="true">→</span>
            </Link>
            <Link className="text-link" href="/login">I already have an account <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="hero-meta">
            <span><span className="meta-icon">06</span> connected stages</span>
            <span><span className="meta-icon">01</span> investigation</span>
            <span><span className="meta-icon">∞</span> ways to think</span>
          </div>
        </div>

        <div className="vault-preview" aria-label="Preview of the investigation stages">
          <div className="preview-topline">
            <span className="preview-label">CASE FILE <strong>CV-0132</strong></span>
            <span className="preview-live"><span className="status-dot" /> SYSTEM ONLINE</span>
          </div>
          <div className="case-heading">
            <span className="case-kicker">ACTIVE INVESTIGATION</span>
            <h2>The missing<br />signal</h2>
            <p>A trail of digital evidence. One locked vault.</p>
          </div>
          <div className="stage-list">
            {stages.map((stage, index) => (
              <div className={`stage-row${index === 0 ? " stage-current" : ""}`} key={stage.number}>
                <span className="stage-number">{stage.number}</span>
                <span className="stage-name">{stage.name}</span>
                <span className={`stage-state${index === 0 ? " state-ready" : ""}`}>
                  {index === 0 && <span className="stage-check">✓</span>}
                  {stage.state}
                </span>
              </div>
            ))}
            <div className="stage-more"><span /> 3 MORE CHALLENGES AHEAD</div>
          </div>
          <div className="preview-footer">
            <span>YOUR NEXT CLUE IS WAITING</span>
            <span className="footer-arrow" aria-hidden="true">↗</span>
          </div>
          <span className="preview-orbit orbit-one" aria-hidden="true" />
          <span className="preview-orbit orbit-two" aria-hidden="true" />
        </div>
      </section>

      <section className="home-bottom" aria-label="About the challenge">
        <div>
          <span className="bottom-label">BUILT FOR THE CURIOUS</span>
          <p>Learn by investigating real-world security concepts in a guided, hands-on lab.</p>
        </div>
        <div className="topic-list" aria-label="Challenge topics">
          <span>Forensics</span><span>Web security</span><span>Networking</span><span>Linux</span>
        </div>
        <span className="course-note">IE3132 <span>·</span> PENETRATION TESTING</span>
      </section>
    </main>
  );
}
