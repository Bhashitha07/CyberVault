"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logout from "./Logout";

export default function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/progress", label: "Progress" },
    { href: "/admin/challenges", label: "Challenges" },
    { href: "/admin/submissions", label: "Submissions" },
    { href: "/admin/recovery", label: "Recovery" },
  ];

  return (
    <nav className="nav" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div className="brand">CYBERVAULT ADMIN</div>
        <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.9rem" }}>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
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
      <div>
        <Link href="/dashboard" style={{ marginRight: "1rem", fontSize: "0.85rem", color: "#a0aec0" }}>
          Player View
        </Link>
        <Logout />
      </div>
    </nav>
  );
}
