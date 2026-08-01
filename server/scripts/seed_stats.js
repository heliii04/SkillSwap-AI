import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function seedStats() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const users = await User.find({});
        console.log(`Found ${users.length} users. Assigning random stats...`);

        let updatedCount = 0;
        for (const user of users) {
            // Generate random stats
            // Rating: 3.5 to 5.0
            const randomRating = (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
            // Reviews: 5 to 150
            const randomReviews = Math.floor(Math.random() * (150 - 5 + 1)) + 5;
            // Sessions: 10 to 200
            const randomSessions = Math.floor(Math.random() * (200 - 10 + 1)) + 10;
            
            // Preferred Mode
            const modes = ["Online", "Offline", "Hybrid"];
            const randomMode = modes[Math.floor(Math.random() * modes.length)];

            user.rating = parseFloat(randomRating);
            user.reviews = randomReviews;
            user.sessions = randomSessions;
            user.preferredMode = randomMode;
            await user.save();
            updatedCount++;
        }

        console.log(`Successfully updated ${updatedCount} users with random stats.`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding stats:", error);
        process.exit(1);
    }
}

seedStats();
