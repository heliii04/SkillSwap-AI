
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import SwapRequest from "./models/SwapRequest.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const reqs = await SwapRequest.find().populate({ path: "sender", select: "name headline location" }).populate({ path: "receiver", select: "name headline location" });
  console.log("Swap requests:");
  reqs.forEach(r => {
    console.log("Sender:", r.sender?.name, r.sender?.headline, r.sender?.location);
    console.log("Receiver:", r.receiver?.name, r.receiver?.headline, r.receiver?.location);
  });
  process.exit();
}).catch(console.error);

