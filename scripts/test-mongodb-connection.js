const mongoose = require("mongoose");
const { connectMongo } = require("../src/lib/mongodb-connection.js");

async function testConnection() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cybervault_ctf";
  console.log("Connecting to MongoDB...");

  try {
    await connectMongo(uri);
    console.log("Successfully connected to MongoDB!");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections in cybervault_ctf:");
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(` - ${c.name}: ${count} documents`);
    }

    // Verify challenges
    const Challenge = mongoose.models.Challenge || mongoose.model("Challenge", new mongoose.Schema({}, { strict: false }));
    const challenges = await Challenge.find().sort({ stageNumber: 1 });
    console.log(`\nVerified ${challenges.length} challenges in database:`);
    challenges.forEach((ch) => {
      console.log(`  Stage ${ch.stageNumber}: ${ch.title} (${ch.points} pts)`);
    });

    // Verify admin user
    const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({}, { strict: false }));
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      console.log(`\nVerified Admin user: ${admin.username} (${admin.email})`);
    } else {
      console.warn("\nNo Admin user found!");
    }

    await mongoose.disconnect();
    console.log("\nMongoDB verification completed successfully with 0 errors!");
  } catch (err) {
    console.error("MongoDB verification failed:", err);
    process.exit(1);
  }
}

testConnection();
