import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";

const secret = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-change-me");

export async function createSession(userId: string, role: string) {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());

  (await cookies()).set("cv_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 28800,
  });
}

export async function getSession() {
  try {
    const token = (await cookies()).get("cv_session")?.value;
    if (!token) return null;
    return (await jwtVerify(token, secret())).payload as {
      userId: string;
      role: string;
    };
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).set("cv_session", "", { httpOnly: true, path: "/", maxAge: 0 });
}

export interface AdminAuthResult {
  ok: boolean;
  user?: IUser;
  errorResponse?: NextResponse;
}

export async function requireAdmin(): Promise<AdminAuthResult> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      errorResponse: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  await connectDB();
  const user = await User.findById(session.userId);

  if (!user) {
    return {
      ok: false,
      errorResponse: NextResponse.json({ message: "User account not found" }, { status: 401 }),
    };
  }

  if (user.role !== "admin") {
    return {
      ok: false,
      errorResponse: NextResponse.json(
        { message: "Forbidden: Admin privileges required" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user };
}
