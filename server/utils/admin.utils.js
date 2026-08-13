import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { calculateProfileCompletion } from "./profile.utils.js";

export async function getOrCreateAdminUser() {
    const adminEmail = (process.env.ADMIN_USERNAME || "admin").toLowerCase();

    // 1. Try finding admin by role
    let admin = await User.findOne({ role: "admin" });

    // 2. If not found, try finding admin by email
    if (!admin) {
        admin = await User.findOne({ email: adminEmail });
    }

    // 3. If still not found, create persistent Admin user document in DB
    if (!admin) {
        const defaultPassword = process.env.ADMIN_PASSWORD || "adminpassword";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        admin = new User({
            name: "System Admin",
            email: adminEmail,
            passwordHash: hashedPassword,
            role: "admin",
            accountStatus: "active",
            isEmailVerified: true,
            headline: "System Administrator",
            bio: "Official System Administrator account for SkillSwap AI platform.",
            location: {
                city: "Ahmedabad",
                country: "India",
            },
        });
        admin.profileCompletion = calculateProfileCompletion(admin);
        await admin.save();
    } else {
        let changed = false;
        if (admin.role !== "admin") {
            admin.role = "admin";
            changed = true;
        }
        if (!admin.location?.city && !admin.location?.country) {
            admin.location = {
                city: "Ahmedabad",
                country: "India",
            };
            changed = true;
        }
        const calculated = calculateProfileCompletion(admin);
        if (admin.profileCompletion !== calculated) {
            admin.profileCompletion = calculated;
            changed = true;
        }
        if (changed) {
            await admin.save();
        }
    }

    return admin;
}
