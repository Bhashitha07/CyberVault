import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, role, authenticated } = body;

    // INTENTIONAL VULNERABILITY (Stage 2 Web Security Challenge):
    // The server trusts client-controlled authorization parameters ('role')
    // sent in the request body, allowing parameter manipulation via DevTools or HTTP proxy (Burp Suite).
    // Access is restricted strictly to employees.

    const normalizedRole = String(role || "").trim().toLowerCase();

    if (normalizedRole === "employee") {
      return NextResponse.json(
        {
          success: true,
          message: "Authentication successful! Access granted to Internal Employee Records.",
          flag: "CV{vault_02_broken_login}",
          clue: "Attacker left an encrypted cipher message and you have to find it.",
          protectedData: {
            employee: username || "employee1",
            role: "employee",
            department: "Cyber Incident Response",
            secretNote: "Suspicious activity detected: Attacker left an encrypted cipher message and you have to find it.",
          },
        },
        { status: 200 }
      );
    }

    if (normalizedRole === "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Access Denied: Administrative accounts cannot access the Employee Portal. This portal is strictly restricted to employees.",
          debugHint: "Target role required: employee",
        },
        { status: 403 }
      );
    }

    // Default hardcoded rejection for unauthorized role (e.g. guest)
    return NextResponse.json(
      {
        success: false,
        message: "Access Denied: Only employees are permitted to access this portal.",
        debugHint: `Request payload rejected. Received role: '${role || "guest"}'. Portal access restricted strictly to 'employee'.`,
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Bad Request" },
      { status: 400 }
    );
  }
}
