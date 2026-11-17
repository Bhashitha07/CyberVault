const fs = require("fs");
const path = require("path");
const { createZip } = require("./zip-helper");

const outputDir = path.join(__dirname, "../public/challenges/stage4");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const notesDir = path.join(outputDir, "notes");
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir, { recursive: true });
}

// 1. Create auth.log
const authLogContent = `Oct 06 10:15:01 cybervault-srv systemd[1]: Started Session 1 of user student.
Oct 06 10:17:22 cybervault-srv sshd[2214]: Accepted password for student from 192.168.1.50 port 52110 ssh2
Oct 06 11:40:12 cybervault-srv sshd[3310]: Failed password for invalid user admin from 192.168.1.105 port 41102 ssh2
Oct 06 12:05:44 cybervault-srv sshd[3420]: Failed password for root from 192.168.1.105 port 41104 ssh2
Oct 06 14:22:01 cybervault-srv sshd[4112]: Accepted password for analyst from 192.168.1.105 port 44210 ssh2; artifact ref: notes/encoded_artifact.txt
Oct 06 14:25:30 cybervault-srv sudo: analyst : TTY=pts/0 ; PWD=/home/analyst ; USER=root ; COMMAND=/bin/cat /var/log/audit.log
Oct 06 15:00:00 cybervault-srv CRON[4501]: (root) CMD (run-parts /etc/cron.hourly)
`;

// 2. Create system.log
const systemLogContent = `Oct 06 10:00:00 cybervault-srv kernel: [    0.000000] Linux version 6.1.0-ctf
Oct 06 10:00:01 cybervault-srv systemd[1]: Reached target Network.
Oct 06 14:22:05 cybervault-srv kernel: [ 4210.112001] e1000e 0000:00:1f.6 eth0: Link is Up 1000 Mbps
Oct 06 14:23:10 cybervault-srv process-monitor: Suspicious file access logged in notes/encoded_artifact.txt
`;

// 3. Create encoded_artifact.txt
const rawPayload = `FLAG: CV{forensics_finds_the_clue}\nStage 5 Progression Clue: Investigate network packet capture file at /challenges/stage5/challenge.pcap`;
const base64Encoded = Buffer.from(rawPayload).toString("base64");
const encodedArtifactContent = `--- INCIDENT EVIDENCE ARTIFACT #4092 ---
Encoded Payload:
${base64Encoded}
----------------------------------------
`;

const authLogPath = path.join(outputDir, "auth.log");
const systemLogPath = path.join(outputDir, "system.log");
const artifactPath = path.join(notesDir, "encoded_artifact.txt");

fs.writeFileSync(authLogPath, authLogContent);
fs.writeFileSync(systemLogPath, systemLogContent);
fs.writeFileSync(artifactPath, encodedArtifactContent);

// 4. Create standard PKZIP archive containing all evidence files
const zipBuffer = createZip([
  { name: "auth.log", content: Buffer.from(authLogContent, "utf-8") },
  { name: "system.log", content: Buffer.from(systemLogContent, "utf-8") },
  { name: "notes/encoded_artifact.txt", content: Buffer.from(encodedArtifactContent, "utf-8") },
]);

const zipPath = path.join(outputDir, "evidence.zip");
fs.writeFileSync(zipPath, zipBuffer);

console.log("Stage 4 Forensic Evidence files generated successfully:");
console.log("-", authLogPath);
console.log("-", systemLogPath);
console.log("-", artifactPath);
console.log("-", zipPath, `(${zipBuffer.length} bytes)`);
