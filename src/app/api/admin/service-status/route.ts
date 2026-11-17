import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.errorResponse!;

  const publicDir = path.join(process.cwd(), "public/challenges");

  const status = {
    stage1Asset: fs.existsSync(path.join(publicDir, "stage1/challenge.png")),
    stage2Service: true, // Stage 2 portal API route active
    stage3Configured: true, // Cipher generator active
    stage4Evidence: fs.existsSync(path.join(publicDir, "stage4/auth.log")),
    stage5Pcap: fs.existsSync(path.join(publicDir, "stage5/challenge.pcap")),
    stage6Service: true, // Stage 6 terminal lab exec route active
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json({ success: true, status }, { status: 200 });
}
