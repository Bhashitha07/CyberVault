"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logout from "./Logout";

interface AdminNavProps {
  variant?: "default" | "dashboard";
}

export default function AdminNav({ variant = "default" }: AdminNavProps) {
  const pathname = usePathname();
  const isDashboard = variant === "dashboard";

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/progress", label: "Progress" },
    { href: "/admin/challenges", label: "Challenges" },
    { href: "/admin/submissions", label: "Submissions" },
    { href: "/admin/recovery", label: "Recovery" },
  ];

  return (
    <nav
      className={`nav${isDashboard ? " admin-dashboard-nav" : ""}`}
      style={isDashboard ? undefined : { flexWrap: "wrap", gap: "0.5rem" }}
    >
      <div
        className={isDashboard ? "admin-dashboard-nav-main" : undefined}
        style={isDashboard ? undefined : { display: "flex", alignItems: "center", gap: "1rem" }}
      >
        <div className={isDashboard ? "brand-lockup admin-dashboard-brand" : "brand"}>
          {isDashboard && (
            <span className="logo-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 10V7.5a7 7 0 0 1 14 0V10" />
                <rect x="3.5" y="10" width="17" height="11" rx="3" />
                <path d="M12 14v3" />
              </svg>
            </span>
          )}
          <span>CYBERVAULT{isDashboard ? "" : " ADMIN"}</span>
          {isDashboard && <span className="admin-brand-label">CONTROL</span>}
        </div>
        <div
          className={isDashboard ? "admin-dashboard-nav-links" : undefined}
          style={isDashboard ? undefined : { display: "flex", gap: "0.75rem", fontSize: "0.9rem" }}
        >
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={isDashboard ? `admin-dashboard-nav-link${isActive ? " is-active" : ""}` : undefined}
                style={isDashboard ? undefined : {
                  color: isActive ? "#00f0ff" : "#a0aec0",
                  fontWeight: isActive ? "bold" : "normal",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className={isDashboard ? "admin-dashboard-nav-actions" : undefined}>
        <Link
          href="/dashboard"
          className={isDashboard ? "admin-dashboard-player-link" : undefined}
          style={isDashboard ? undefined : { marginRight: "1rem", fontSize: "0.85rem", color: "#a0aec0" }}
        >
          Player View
        </Link>
        <Logout />
      </div>
    </nav>
  );
}
