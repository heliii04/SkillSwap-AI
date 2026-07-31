import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/skillswap";
const targetEmail = process.argv[2] || "vyasheli67@gmail.com";

async function makeAdmin() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Database connected.");

    const user = await User.findOne({ email: targetEmail.toLowerCase() });

    if (!user) {
      console.error(`User with email "${targetEmail}" not found.`);
      return;
    }

    user.role = "admin";
    await user.save();

    console.log(`Successfully elevated user "${user.name}" (${user.email}) to "admin" role!`);
  } catch (err) {
    console.error("Error making user admin:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
}

makeAdmin();
