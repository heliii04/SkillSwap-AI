import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
    try {
        mongoose.set("strictQuery", true);

        const connection = await mongoose.connect(
            env.mongodbUri
        );

        console.log(
            `MongoDB connected: ${connection.connection.host}`
        );
    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);
    }
}