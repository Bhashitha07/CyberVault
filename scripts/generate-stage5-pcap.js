const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "../public/challenges/stage5");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Valid Global PCAP Header (24 bytes)
const pcapGlobalHeader = Buffer.from([
  0xd4, 0xc3, 0xb2, 0xa1, // Magic Number (Little Endian)
  0x02, 0x00, 0x04, 0x00, // Version 2.4
  0x00, 0x00, 0x00, 0x00, // Timezone GMT
  0x00, 0x00, 0x00, 0x00, // Accuracy
  0xff, 0xff, 0x00, 0x00, // Snapshot Length (65535)
  0x01, 0x00, 0x00, 0x00, // Link-Layer Header Type (Ethernet = 1)
]);

// Helper to create a PCAP Packet Header + Dummy Ethernet/IP/TCP/HTTP Frame
function createPacket(payloadStr, srcIp = [172, 28, 0, 10], dstIp = [172, 28, 0, 20], srcPort = 54321, dstPort = 80) {
  const payloadBuf = Buffer.from(payloadStr);

  // Dummy Ethernet (14 bytes) + IP (20 bytes) + TCP (20 bytes) = 54 bytes
  const headerSize = 54;
  const totalFrameSize = headerSize + payloadBuf.length;

  const frame = Buffer.alloc(totalFrameSize);

  // Ethernet header (Dst MAC, Src MAC, Type 0x0800 IPv4)
  frame.set([0x00, 0x50, 0x56, 0xc0, 0x00, 0x08, 0x00, 0x0c, 0x29, 0x54, 0x82, 0x11, 0x08, 0x00], 0);

  // IPv4 header (Total length, Proto TCP = 6, Src/Dst IP)
  frame[14] = 0x45; // Version 4, IHL 5
  frame.writeUInt16BE(20 + 20 + payloadBuf.length, 16);
  frame[23] = 6; // Protocol = TCP
  frame.set(srcIp, 26);
  frame.set(dstIp, 30);

  // TCP header (Src Port, Dst Port, Seq 1, Ack 1, Data Offset 5)
  frame.writeUInt16BE(srcPort, 34);
  frame.writeUInt16BE(dstPort, 36);
  frame.writeUInt32BE(1001, 38);
  frame.writeUInt32BE(2001, 42);
  frame[46] = 0x50; // Data offset 5 words
  frame[47] = 0x18; // ACK, PSH flags

  // Payload
  frame.set(payloadBuf, headerSize);

  // PCAP Record Header (16 bytes)
  const recordHeader = Buffer.alloc(16);
  const now = Math.floor(Date.now() / 1000);
  recordHeader.writeUInt32LE(now, 0); // Timestamp sec
  recordHeader.writeUInt32LE(0, 4); // Timestamp usec
  recordHeader.writeUInt32LE(frame.length, 8); // Captured length
  recordHeader.writeUInt32LE(frame.length, 12); // Original length

  return Buffer.concat([recordHeader, frame]);
}

// 2. Build synthetic network traffic
const payloadText = `FLAG: CV{packet_hunter}\nStage 6 Access Clue: Target: stage6-lab | User: analyst | Service: SSH/http`;
const base64Exfil = Buffer.from(payloadText).toString("base64");

const packet1 = createPacket("GET /index.html HTTP/1.1\r\nHost: stage6-lab.local\r\nUser-Agent: Mozilla/5.0\r\n\r\n");
const packet2 = createPacket("HTTP/1.1 200 OK\r\nContent-Length: 24\r\n\r\nWelcome to Lab Network");
const packet3 = createPacket(`GET /exfil?data=${base64Exfil} HTTP/1.1\r\nHost: 172.28.0.20\r\nUser-Agent: CyberVault-Scanner/1.0\r\n\r\n`);
const packet4 = createPacket("HTTP/1.1 200 OK\r\nContent-Length: 15\r\n\r\nData Received\n");

const pcapContent = Buffer.concat([
  pcapGlobalHeader,
  packet1,
  packet2,
  packet3,
  packet4,
]);

const pcapPath = path.join(outputDir, "challenge.pcap");
fs.writeFileSync(pcapPath, pcapContent);

console.log("=== STAGE 5 PACKET HUNTER PCAP GENERATOR ===");
console.log("Generated valid PCAP file at:", pcapPath);
console.log("Embedded Exfiltration Payload (Base64):", base64Exfil);
console.log("Decoded Flag:", "CV{packet_hunter}");
