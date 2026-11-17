import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  challengeId?: mongoose.Types.ObjectId;
  stageNumber: number;
  status: "locked" | "unlocked" | "in-progress" | "completed";
  attempts: number;
  solved: boolean;
  solvedAt?: Date;
  lastAttemptAt?: Date;
  completedStages?: number[];
  currentStage?: number;
  score?: number;
  hintsUsed?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    challengeId: { type: Schema.Types.ObjectId, ref: "Challenge" },
    stageNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ["locked", "unlocked", "in-progress", "completed"],
      default: "locked",
    },
    attempts: { type: Number, default: 0 },
    solved: { type: Boolean, default: false },
    solvedAt: { type: Date },
    lastAttemptAt: { type: Date },
    completedStages: { type: [Number], default: [] },
    currentStage: { type: Number, default: 1 },
    score: { type: Number, default: 0 },
    hintsUsed: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Compound unique index so user cannot have duplicate progress records for the same stage
UserProgressSchema.index({ userId: 1, stageNumber: 1 }, { unique: true });

const UserProgress: Model<IUserProgress> =
  mongoose.models.UserProgress || mongoose.model<IUserProgress>("UserProgress", UserProgressSchema);

export default UserProgress;
