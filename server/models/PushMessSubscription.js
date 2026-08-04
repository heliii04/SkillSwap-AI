import mongoose from "mongoose";

const pushMessSubscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        endpoint: {
            type: String,
            required: true,
            unique: true,
        },
        keys: {
            p256dh: {
                type: String,
                required: true,
            },
            auth: {
                type: String,
                required: true,
            },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const PushMessSubscription = mongoose.models.PushMessSubscription || mongoose.model("PushMessSubscription", pushMessSubscriptionSchema);
export default PushMessSubscription;
