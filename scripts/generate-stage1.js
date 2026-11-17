const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "../public/challenges/stage1");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Create a valid 100x100 PNG image with embedded tEXt metadata and appended comment chunk
const pngHeader = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR Chunk header
  0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x64, // 100x100
  0x08, 0x02, 0x00, 0x00, 0x00, 0xff, 0x80, 0x02, 0x03,
]);

const hiddenPayload =
  "CyberVault Steganography Evidence Data | FLAG: CV{vault_01_hidden_data} | Next Stage Clue: Employee portal authentication may not be what it seems. Access local portal at /challenges/stage2/portal";

// Add tEXt chunk
const textChunkType = Buffer.from("tEXt");
const textChunkData = Buffer.from("Comment\0" + hiddenPayload);
const textChunkLen = Buffer.alloc(4);
textChunkLen.writeUInt32BE(textChunkData.length, 0);

// Basic CRC placeholder
const textChunkCrc = Buffer.from([0x12, 0x34, 0x56, 0x78]);

const pngIEND = Buffer.from([
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

// Appended steg string at the end of the file for strings/hexdump/exiftool inspection
const appendedComment = Buffer.from(
  "\n\n--- CYBERVAULT EVIDENCE MARKER ---\n" + hiddenPayload + "\n-----------------------------------\n"
);

const finalPng = Buffer.concat([
  pngHeader,
  textChunkLen,
  textChunkType,
  textChunkData,
  textChunkCrc,
  pngIEND,
  appendedComment,
]);

const pngPath = path.join(outputDir, "challenge.png");
const jpgPath = path.join(outputDir, "challenge.jpg");

fs.writeFileSync(pngPath, finalPng);
fs.writeFileSync(jpgPath, finalPng);

console.log("Stage 1 Steganography challenge assets generated successfully at:");
console.log("-", pngPath);
console.log("-", jpgPath);
