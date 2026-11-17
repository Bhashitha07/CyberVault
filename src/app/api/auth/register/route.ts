import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User, { USER_ROLES, type UserRole } from "@/models/User";
import Progress from "@/models/Progress";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value.trim());
}

export async function POST(req: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      const parsedBody: unknown = await req.json();
      if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) {
        return NextResponse.json({ message: "A valid JSON object is required." }, { status: 400 });
      }
      body = parsedBody as Record<string, unknown>;
    } catch {
      return NextResponse.json({ message: "Request body must be valid JSON." }, { status: 400 });
    }

    const username = typeof body.username === "string" ? body.username.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const requestedRole = typeof body.role === "string" ? body.role.trim().toLowerCase() : "player";

    if (!username) {
      return NextResponse.json({ message: "Please enter a username." }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (requestedRole !== "player" && requestedRole !== "user") {
      return NextResponse.json(
        { message: "Only player and user roles can be created publicly" },
        { status: 400 }
      );
    }

    await connectDB();

    const role: UserRole = USER_ROLES.includes(requestedRole as UserRole)
      ? (requestedRole as UserRole)
      : "player";

    const normalizedEmail = email.toLowerCase();
    if (await User.exists({ username })) {
      return NextResponse.json({ message: "That username is already taken." }, { status: 409 });
    }
    if (await User.exists({ email: normalizedEmail })) {
      return NextResponse.json(
        { message: "An account with that email is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      score: 0,
      completedStages: [],
      currentStage: 1,
    });

    await Progress.create({
      userId: user._id,
      completedStages: [],
      currentStage: 1,
      score: 0,
      attempts: 0,
      hintsUsed: [],
      completed: false,
    });

    return NextResponse.json({ success: true, userId: user._id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof Error && error.name === "MongooseServerSelectionError") {
      return NextResponse.json(
        { message: "Registration is temporarily unavailable because the database is offline. Start MongoDB and try again." },
        { status: 503 }
      );
    }
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
