import mongoose from "mongoose";

export function connectMongo(uri?: string): Promise<typeof mongoose>;
