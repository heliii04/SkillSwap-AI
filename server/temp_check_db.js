import mongoose from "mongoose";
import dotenv from "dotenv";
import Notification from "./models/Notification.js";
import Chat from "./models/Chat.js";
import Message from "./models/Message.js";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/skillswap";

async function checkDb() {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const notificationsCount = await Notification.countDocuments();
    console.log("Total Notifications in DB:", notificationsCount);

    const latestNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5);

    console.log("Latest 5 Notifications:");
    console.log(JSON.stringify(latestNotifications, null, 2));

    const chatsCount = await Chat.countDocuments();
    console.log("Total Chats in DB:", chatsCount);

    const messagesCount = await Message.countDocuments();
    console.log("Total Messages in DB:", messagesCount);

  } catch (err) {
    console.error("Error checking database:", err);
  } finally {
    await mongoose.disconnect();
  }
}

checkDb();
