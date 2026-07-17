import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),

    PORT: z.coerce.number().positive().default(5000),

    MONGO_URI: z.string().min(1, "MONGO_URI is required"),

    JWT_SECRET: z
        .string()
        .min(32, "JWT_SECRET must contain at least 32 characters"),

    SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),

    SMTP_PORT: z.coerce
        .number()
        .int()
        .positive("SMTP_PORT must be a valid positive number"),

    SMTP_SECURE: z
        .string()
        .transform((value) => value.toLowerCase() === "true"),

    SMTP_USER: z.string().min(1, "SMTP_USER is required"),

    SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),

    MAIL_FROM_NAME: z.string().default("SkillSwap AI"),

    MAIL_FROM_ADDRESS: z
        .string()
        .email("MAIL_FROM_ADDRESS must be a valid email"),

    CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:");

    const errors = parsedEnv.error.flatten().fieldErrors;

    Object.entries(errors).forEach(([key, messages]) => {
        console.error(`${key}: ${messages?.join(", ")}`);
    });

    process.exit(1);
}

export const env = parsedEnv.data;