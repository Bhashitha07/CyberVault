import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  completedStages: number[];
  currentStage: number;
  score: number;
  attempts: number;
  hintsUsed: string[];
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    completedStages: { type: [Number], default: [] },
    currentStage: { type: Number, default: 1 },
    score: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    hintsUsed: { type: [String], default: [] },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Progress: Model<IProgress> =
  mongoose.models.Progress || mongoose.model<IProgress>("Progress", ProgressSchema);

export default Progress;
