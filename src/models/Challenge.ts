import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChallenge extends Document {
  stageNumber: number;
  stage: number;
  title: string;
  domain: string;
  difficulty: string;
  description: string;
  scenario?: string;
  objective?: string;
  hints: string[];
  flag?: string;
  flagHash?: string;
  points: number;
  unlockedByDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>(
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

// Pre-save hook to keep stage and stageNumber in sync
ChallengeSchema.pre("save", function (next) {
  if (this.stageNumber !== undefined && this.stage === undefined) {
    this.stage = this.stageNumber;
  } else if (this.stage !== undefined && this.stageNumber === undefined) {
    this.stageNumber = this.stage;
  }
  next();
});

const Challenge: Model<IChallenge> =
  mongoose.models.Challenge || mongoose.model<IChallenge>("Challenge", ChallengeSchema);

export default Challenge;
