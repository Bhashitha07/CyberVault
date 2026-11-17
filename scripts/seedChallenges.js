const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { connectMongo } = require("../src/lib/mongodb-connection.js");

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cybervault_ctf";

const ChallengeSchema = new mongoose.Schema(
  {
    stageNumber: { type: Number, required: true, unique: true },
    stage: { type: Number },
    title: { type: String, required: true },
    domain: { type: String, required: true },
    difficulty: { type: String, required: true },
    description: { type: String, required: true },
    scenario: { type: String },
    objective: { type: String },
    hints: { type: [String], default: [] },
    flag: { type: String },
    flagHash: { type: String },
    points: { type: Number, default: 100 },
    unlockedByDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["player", "user", "admin"], default: "player" },
    score: { type: Number, default: 0 },
    completedStages: { type: [Number], default: [] },
    currentStage: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    completedStages: { type: [Number], default: [] },
    currentStage: { type: Number, default: 1 },
    score: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    hintsUsed: { type: [String], default: [] },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Challenge = mongoose.models.Challenge || mongoose.model("Challenge", ChallengeSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Progress = mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);

const challengesData = [
  {
    stageNumber: 1,
    stage: 1,
    title: "Hidden in Plain Sight",
    domain: "Steganography",
    difficulty: "Easy",
    description:
      "An image recovered from the compromised system appears to be an ordinary company image. However, investigators suspect that someone has hidden important information inside it.",
    scenario:
      "An image recovered from the compromised system appears to be an ordinary company image. However, investigators suspect that someone has hidden important information inside it.",
    objective:
      "Download the image, inspect its metadata and contents, identify the hidden information, and recover the stage flag and progression clue.",
    hints: [
      "The image may contain more than what you can see.",
      "Check the file metadata.",
    ],
    flag: "CV{vault_01_hidden_data}",
    points: 100,
    unlockedByDefault: true,
  },
  {
    stageNumber: 2,
    stage: 2,
    title: "Broken Login",
    domain: "Web Security",
    difficulty: "Easy",
    description:
      "Information obtained from Stage 1 leads the participant to an internal employee portal. The portal contains a login page with an intentionally weak authentication mechanism.",
    scenario:
      "Information obtained from Stage 1 leads the participant to an internal employee portal. The portal contains a login page with an intentionally weak authentication mechanism.",
    objective:
      "Investigate the login mechanism, identify the weakness, gain access to the protected area, and locate the next clue.",
    hints: [
      "Do not only look at the login screen.",
      "Observe what the browser sends to the server.",
    ],
    flag: "CV{vault_02_broken_login}",
    points: 100,
    unlockedByDefault: false,
  },
  {
    stageNumber: 3,
    stage: 3,
    title: "The Forgotten Cipher",
    domain: "Cryptography",
    difficulty: "Moderate",
    description:
      "The compromised portal contains an encrypted message left by an attacker. The message contains information required to investigate the next piece of evidence.",
    scenario:
      "The compromised portal contains an encrypted message left by an attacker. The message contains information required to investigate the next piece of evidence.",
    objective:
      "Identify the encryption method, determine the required key or transformation, decrypt the message, and recover the next investigation clue.",
    hints: [
      "The message is encrypted, not hashed.",
      "Look for patterns in the characters.",
    ],
    flag: "CV{the_vault_needs_you}",
    points: 150,
    unlockedByDefault: false,
  },
  {
    stageNumber: 4,
    stage: 4,
    title: "Evidence Trail",
    domain: "Digital Forensics",
    difficulty: "Moderate",
    description:
      "The decrypted message from Stage 3 points to a collection of system evidence from the compromised environment. The participant must investigate the evidence to determine what happened next.",
    scenario:
      "The decrypted message from Stage 3 points to a collection of system evidence from the compromised environment. The participant must investigate the evidence to determine what happened next.",
    objective:
      "Examine the evidence, identify suspicious activity, correlate relevant information, and recover the next-stage network investigation clue.",
    hints: [
      "Logs record more than successful events.",
      "Search for unusual entries rather than reading everything manually.",
    ],
    flag: "CV{forensics_finds_the_clue}",
    points: 150,
    unlockedByDefault: false,
  },
  {
    stageNumber: 5,
    stage: 5,
    title: "Packet Hunter",
    domain: "Networking",
    difficulty: "Moderate-Hard",
    description:
      "The forensic investigation identifies suspicious network traffic. A packet capture contains the communication between an attacker and the compromised system.",
    scenario:
      "The forensic investigation identifies suspicious network traffic. A packet capture contains the communication between an attacker and the compromised system.",
    objective:
      "Analyze the PCAP, identify relevant conversations, follow suspicious traffic, extract the hidden information and determine the server/access information required for the final stage.",
    hints: [
      "Not every packet is important.",
      "Look for conversations rather than individual packets.",
    ],
    flag: "CV{packet_hunter}",
    points: 200,
    unlockedByDefault: false,
  },
  {
    stageNumber: 6,
    stage: 6,
    title: "The Final Breach",
    domain: "Linux / System Security",
    difficulty: "Hard",
    description:
      "Information obtained from the packet investigation identifies an isolated Linux server connected to the incident. The participant must investigate the server and obtain the final evidence.",
    scenario:
      "Information obtained from the packet investigation identifies an isolated Linux server connected to the incident. The participant must investigate the server and obtain the final evidence.",
    objective:
      "Enumerate the target, identify the intended weakness, obtain controlled access, locate the final flag and demonstrate completion of the CyberVault investigation.",
    hints: [
      "Start with enumeration.",
      "Check what the available services and permissions allow.",
    ],
    flag: "CV{the_final_breach}",
    points: 300,
    unlockedByDefault: false,
  },
];

async function seed() {
  const adminPassword = process.env.ADMIN_PASSWORD;

  console.log("Connecting to MongoDB...");
  await connectMongo(uri);

  // 1. Seed Challenges
  for (const item of challengesData) {
    const flagHash = await bcrypt.hash(item.flag, 12);
    await Challenge.updateOne(
      { stageNumber: item.stageNumber },
      {
        $set: {
          ...item,
          flagHash,
        },
      },
      { upsert: true }
    );
    console.log(`Seeded Stage ${item.stageNumber}: ${item.title}`);
  }

  if (adminPassword) {
    // 2. Seed Admin User Account
    const adminUsername = "admin";
    const adminEmail = "admin@cybervault.local";
    const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

    let adminUser = await User.findOne({ username: adminUsername });
    if (!adminUser) {
      adminUser = await User.create({
        username: adminUsername,
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: "admin",
        score: 0,
        completedStages: [],
        currentStage: 1,
      });
      console.log(`Created Admin User: ${adminUsername}`);
    } else {
      adminUser.passwordHash = adminPasswordHash;
      adminUser.role = "admin";
      await adminUser.save();
      console.log(`Updated Admin User credentials: ${adminUsername}`);
    }

    // 3. Ensure Admin Progress document exists
    const adminProgress = await Progress.findOne({ userId: adminUser._id });
    if (!adminProgress) {
      await Progress.create({
        userId: adminUser._id,
        completedStages: [],
        currentStage: 1,
        score: 0,
      });
    }

    console.log("Admin account seeded successfully.");
  } else {
    console.log("Skipped admin account seeding because ADMIN_PASSWORD is not set.");
  }

  console.log("Challenge seeding complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
