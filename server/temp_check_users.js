import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/skillswap";

async function checkUsers() {
  try {
    await mongoose.connect(mongoUri);
    const users = await User.find({}, "name email");
    console.log("Users:");
    console.log(users);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
