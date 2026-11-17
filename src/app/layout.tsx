import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "CyberVault CTF",
  description: "Educational isolated CTF platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
