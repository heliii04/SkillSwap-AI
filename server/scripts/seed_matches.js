import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Skill from "../models/Skill.js";
import bcrypt from "bcryptjs";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/skillswap";

const usersData = [
    {
        name: "Rahul Sharma", email: "rahul@example.com", bio: "Software engineer looking to learn design.",
        teach: { title: "React Development", category: "technology", level: "expert", exp: 4, mode: "online" },
        learn: { title: "UI/UX Design", category: "design", current: "beginner", target: "intermediate", mode: "online" }
    },
    {
        name: "Priya Patel", email: "priya@example.com", bio: "Product designer wanting to master marketing.",
        teach: { title: "UI/UX Design", category: "design", level: "advanced", exp: 3, mode: "online" },
        learn: { title: "Digital Marketing", category: "marketing", current: "beginner", target: "advanced", mode: "online" }
    },
    {
        name: "Amit Singh", email: "amit@example.com", bio: "Data analyst picking up music.",
        teach: { title: "Python Programming", category: "technology", level: "expert", exp: 5, mode: "online" },
        learn: { title: "Acoustic Guitar", category: "music", current: "complete-beginner", target: "beginner", mode: "both" }
    },
    {
        name: "Neha Gupta", email: "neha@example.com", bio: "Marketer exploring frontend.",
        teach: { title: "Digital Marketing", category: "marketing", level: "expert", exp: 4, mode: "online" },
        learn: { title: "React JS", category: "technology", current: "complete-beginner", target: "intermediate", mode: "online" }
    },
    {
        name: "Rohan Desai", email: "rohan@example.com", bio: "Musician looking to improve communication.",
        teach: { title: "Acoustic Guitar", category: "music", level: "advanced", exp: 6, mode: "both" },
        learn: { title: "Spoken English", category: "languages", current: "intermediate", target: "advanced", mode: "online" }
    },
    {
        name: "Sneha Reddy", email: "sneha@example.com", bio: "English tutor learning to code.",
        teach: { title: "Spoken English", category: "languages", level: "expert", exp: 5, mode: "online" },
        learn: { title: "Python Basics", category: "technology", current: "complete-beginner", target: "beginner", mode: "online" }
    },
    {
        name: "Vikram Joshi", email: "vikram@example.com", bio: "Data Scientist into creative arts.",
        teach: { title: "Data Science", category: "technology", level: "expert", exp: 7, mode: "online" },
        learn: { title: "Graphic Design", category: "design", current: "beginner", target: "intermediate", mode: "online" }
    },
    {
        name: "Pooja Verma", email: "pooja@example.com", bio: "Graphic designer learning video editing.",
        teach: { title: "Graphic Design", category: "design", level: "advanced", exp: 4, mode: "online" },
        learn: { title: "Video Editing", category: "design", current: "beginner", target: "intermediate", mode: "online" }
    },
    {
        name: "Karan Malhotra", email: "karan@example.com", bio: "Video editor pursuing photography.",
        teach: { title: "Video Editing", category: "design", level: "expert", exp: 3, mode: "online" },
        learn: { title: "Portrait Photography", category: "photography", current: "intermediate", target: "advanced", mode: "both" }
    },
    {
        name: "Riya Kapoor", email: "riya@example.com", bio: "Photographer wanting to get fit.",
        teach: { title: "Portrait Photography", category: "photography", level: "advanced", exp: 5, mode: "both" },
        learn: { title: "Yoga & Mindfulness", category: "fitness", current: "complete-beginner", target: "beginner", mode: "online" }
    },
    {
        name: "Ajay Kumar", email: "ajay@example.com", bio: "Fitness trainer getting into backend tech.",
        teach: { title: "Yoga & Mindfulness", category: "fitness", level: "expert", exp: 8, mode: "online" },
        learn: { title: "Node.js API", category: "technology", current: "beginner", target: "intermediate", mode: "online" }
    },
    {
        name: "Meera Nair", email: "meera@example.com", bio: "Backend dev learning data science.",
        teach: { title: "Node.js API", category: "technology", level: "advanced", exp: 4, mode: "online" },
        learn: { title: "Data Science", category: "technology", current: "intermediate", target: "advanced", mode: "online" }
    },
    {
        name: "Siddharth Jain", email: "siddharth@example.com", bio: "Spanish speaker learning business.",
        teach: { title: "Conversational Spanish", category: "languages", level: "expert", exp: 6, mode: "online" },
        learn: { title: "Startup Strategy", category: "business", current: "beginner", target: "intermediate", mode: "online" }
    },
    {
        name: "Ananya Iyer", email: "ananya@example.com", bio: "Business consultant learning French.",
        teach: { title: "Startup Strategy", category: "business", level: "advanced", exp: 5, mode: "online" },
        learn: { title: "French Basics", category: "languages", current: "complete-beginner", target: "beginner", mode: "online" }
    },
    {
        name: "Kabir Das", email: "kabir@example.com", bio: "French speaker wanting to learn Spanish.",
        teach: { title: "French Basics", category: "languages", level: "expert", exp: 4, mode: "online" },
        learn: { title: "Conversational Spanish", category: "languages", current: "beginner", target: "intermediate", mode: "online" }
    }
];

async function seedMatches() {
    try {
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        // 1. Delete previous test_ai users
        const oldEmails = ["test_ai_1@example.com", "test_ai_2@example.com", "test_ai_3@example.com"];
        const oldUsers = await User.find({ email: { $in: oldEmails } });
        if (oldUsers.length > 0) {
            const oldIds = oldUsers.map(u => u._id);
            await Skill.deleteMany({ owner: { $in: oldIds } });
            await User.deleteMany({ _id: { $in: oldIds } });
            console.log("Cleaned up previous 3 test users.");
        }

        // 2. Clear existing seeded users if we run this multiple times
        const newEmails = usersData.map(u => u.email);
        const existingUsers = await User.find({ email: { $in: newEmails } });
        if (existingUsers.length > 0) {
            const existingIds = existingUsers.map(u => u._id);
            await Skill.deleteMany({ owner: { $in: existingIds } });
            await User.deleteMany({ _id: { $in: existingIds } });
            console.log("Cleaned up previous 15 seeded users.");
        }

        const passwordHash = await bcrypt.hash("SkillSwap@123", 10);
        console.log("Seeding 15 new users...");

        for (const data of usersData) {
            const user = await User.create({
                name: data.name,
                email: data.email,
                passwordHash,
                bio: data.bio,
                isEmailVerified: true
            });

            // Teach skill
            await Skill.create({
                owner: user._id,
                type: "teach",
                title: data.teach.title,
                normalizedTitle: data.teach.title.toLowerCase().replace(/\s+/g, ' '),
                category: data.teach.category,
                level: data.teach.level,
                description: `I can teach you ${data.teach.title} with my ${data.teach.exp} years of experience.`,
                yearsOfExperience: data.teach.exp,
                teachingMode: data.teach.mode,
                availability: { days: ["monday", "wednesday", "saturday"], timeSlot: "flexible" }
            });

            // Learn skill
            await Skill.create({
                owner: user._id,
                type: "learn",
                title: data.learn.title,
                normalizedTitle: data.learn.title.toLowerCase().replace(/\s+/g, ' '),
                category: data.learn.category,
                currentLevel: data.learn.current,
                targetLevel: data.learn.target,
                learningGoal: `I want to improve my skills in ${data.learn.title}.`,
                priority: "high",
                preferredLearningMode: data.learn.mode,
                availability: { days: ["monday", "wednesday", "saturday"], timeSlot: "flexible" }
            });
        }

        console.log("Successfully seeded 15 test users with diverse skills!");
        console.log("All passwords are set to: SkillSwap@123");

    } catch (err) {
        console.error("Error seeding:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

seedMatches();
