import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { command } = await req.json();
    const cmd = String(command || "").trim();

    if (!cmd) {
      return NextResponse.json({ output: "" });
    }

    const lower = cmd.toLowerCase();

    // Emulated / Sandbox Linux execution for Stage 6 Capstone
    if (lower === "whoami") {
      return NextResponse.json({ output: "analyst" });
    }

    if (lower === "id") {
      return NextResponse.json({
        output: "uid=1000(analyst) gid=1000(analyst) groups=1000(analyst)",
      });
    }

    if (lower === "pwd") {
      return NextResponse.json({ output: "/home/analyst" });
    }

    if (lower === "ls" || lower === "ls -la" || lower === "ls -l") {
      return NextResponse.json({
        output: "drwxr-xr-x 2 analyst analyst 4096 Oct 06 14:00 .\ndrwxr-xr-x 3 root    root    4096 Oct 06 14:00 ..\n-rw-r--r-- 1 analyst analyst  220 Oct 06 14:00 .bashrc\n-rw-r--r-- 1 analyst analyst  142 Oct 06 14:00 notes.txt",
      });
    }

    if (lower.startsWith("cat notes.txt")) {
      return NextResponse.json({
        output: "Incident Log Note: System privileges are managed via sudoers. Check authorized commands.",
      });
    }

    if (lower === "sudo -l") {
      return NextResponse.json({
        output: "Matching Defaults entries for analyst on stage6-lab:\n    env_reset, mail_badpass, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin\n\nUser analyst may run the following commands on stage6-lab:\n    (ALL : ALL) NOPASSWD: /usr/bin/find",
      });
    }

    if (lower.includes("cat /opt/cybervault/final_flag.txt") && !lower.includes("sudo")) {
      return NextResponse.json({
        output: "cat: /opt/cybervault/final_flag.txt: Permission denied",
      });
    }

    // Privilege escalation path via sudo find
    if (
      lower.includes("sudo find") &&
      (lower.includes("cat") || lower.includes("final_flag") || lower.includes("exec"))
    ) {
      return NextResponse.json({
        output: "CV{the_final_breach}",
      });
    }

    if (lower.includes("find /opt") || lower.includes("find / -name *flag*")) {
      return NextResponse.json({
        output: "/opt/cybervault/final_flag.txt",
      });
    }

    if (lower === "uname -a") {
      return NextResponse.json({
        output: "Linux stage6-lab 6.1.0-ctf #1 SMP PREEMPT_DYNAMIC Alpine 3.19.0 x86_64 Linux",
      });
    }

    return NextResponse.json({
      output: `analyst@stage6-lab:~$ ${cmd}: command executed. Type 'sudo -l' or 'find / -name *flag*' for investigation.`,
    });
  } catch {
    return NextResponse.json({ output: "Execution error" }, { status: 500 });
  }
}
