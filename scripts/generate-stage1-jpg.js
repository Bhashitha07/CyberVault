const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "../public/challenges/stage1");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Minimal valid JPEG header + COM (Comment) segment + EOI
const jpegSOI = Buffer.from([0xff, 0xd8]); // Start of Image

const payload =
  "CyberVault Steganography Evidence | FLAG: CV{vault_01_hidden_data} | Next Stage Clue: Employee portal authentication may not be what it seems. Access local portal at /challenges/stage2/portal";

const commentData = Buffer.from(payload, "utf-8");
const commentLen = commentData.length + 2;
const commentHeader = Buffer.alloc(4);
commentHeader[0] = 0xff;
commentHeader[1] = 0xfe; // COM Marker
commentHeader.writeUInt16BE(commentLen, 2);

// Application 0 (JFIF Header)
const jfifHeader = Buffer.from([
  0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00,
  0x48, 0x00, 0x48, 0x00, 0x00,
]);

// Start of Scan (SOS) & dummy image data
const sosHeader = Buffer.from([
  0xff, 0xda, 0x00, 0x0c, 0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3f,
  0x00,
]);
const dummyBytes = Buffer.from([0x00, 0x3f, 0xff, 0xd9]); // EOI

const appendedComment = Buffer.from(
  "\n\n--- CYBERVAULT STAGE 1 EVIDENCE MARKER ---\nFLAG: CV{vault_01_hidden_data}\nClue: Employee portal authentication may not be what it seems. Access local portal at /challenges/stage2/portal\n-------------------------------------------\n"
);

const finalJpeg = Buffer.concat([
  jpegSOI,
  jfifHeader,
  commentHeader,
  commentData,
  sosHeader,
  dummyBytes,
  appendedComment,
]);

const jpgPath = path.join(outputDir, "challenge.jpg");
const pngPath = path.join(outputDir, "challenge.png");

fs.writeFileSync(jpgPath, finalJpeg);
fs.writeFileSync(pngPath, finalJpeg);

console.log("Generated Stage 1 JPEG challenge asset at:");
console.log("-", jpgPath);
console.log("-", pngPath);
