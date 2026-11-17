import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFlagAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  username?: string;
  stageNumber: number;
  success: boolean;
  attemptedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FlagAttemptSchema = new Schema<IFlagAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String },
    stageNumber: { type: Number, required: true },
    success: { type: Boolean, required: true },
    attemptedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const FlagAttempt: Model<IFlagAttempt> =
  mongoose.models.FlagAttempt || mongoose.model<IFlagAttempt>("FlagAttempt", FlagAttemptSchema);

export default FlagAttempt;
