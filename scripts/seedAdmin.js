const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { connectMongo } = require("../src/lib/mongodb-connection.js");

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cybervault_ctf";
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminEmail = process.env.ADMIN_EMAIL || "admin@cybervault.local";
const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";

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

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Progress = mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);

async function seedAdmin() {
  console.log("Connecting to MongoDB...");
  await connectMongo(uri);

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  let adminUser = await User.findOne({
    $or: [{ username: adminUsername }, { email: adminEmail.toLowerCase() }],
  });

  if (!adminUser) {
    adminUser = await User.create({
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      role: "admin",
      score: 0,
      completedStages: [],
      currentStage: 1,
    });
    console.log(`Successfully created Admin account: ${adminUsername} (${adminEmail})`);
  } else {
    adminUser.username = adminUsername;
    adminUser.email = adminEmail;
    adminUser.passwordHash = passwordHash;
    adminUser.role = "admin";
    await adminUser.save();
    console.log(`Successfully updated existing Admin account: ${adminUsername} (${adminEmail})`);
  }

  const progress = await Progress.findOne({ userId: adminUser._id });
  if (!progress) {
    await Progress.create({
      userId: adminUser._id,
      completedStages: [],
      currentStage: 1,
      score: 0,
    });
  }

  console.log("Admin account seed complete!");
  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error("Admin seeding failed:", err);
  process.exit(1);
});
