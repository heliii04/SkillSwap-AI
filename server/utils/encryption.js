import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const ENCRYPTION_KEY =
    process.env.ENCRYPTION_KEY ||
    "31a79df6fd1e012e7851a82e8c95c3f578ce15a8316d2b209f10bf488d248019";
const IV_LENGTH = 16;

/**
 * AES-256-CBC UTF-8 Message Encryption
 */
export function encryptMessage(text) {
    if (!text || typeof text !== "string") return text;
    // Check if it's already encrypted
    if (text.includes(":") && text.split(":")[0].length === 32) return text;

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(
            "aes-256-cbc",
            Buffer.from(ENCRYPTION_KEY, "hex"),
            iv
        );
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        return iv.toString("hex") + ":" + encrypted;
    } catch (error) {
        console.error("Encryption error:", error);
        return text;
    }
}

/**
 * AES-256-CBC UTF-8 Message Decryption
 */
export function decryptMessage(text) {
    if (!text || typeof text !== "string") return text;

    const textParts = text.split(":");
    if (textParts.length !== 2 || textParts[0].length !== 32) return text;

    try {
        const iv = Buffer.from(textParts[0], "hex");
        const encryptedText = textParts[1];
        const decipher = crypto.createDecipheriv(
            "aes-256-cbc",
            Buffer.from(ENCRYPTION_KEY, "hex"),
            iv
        );
        let decrypted = decipher.update(encryptedText, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch (error) {
        console.error("Decryption error:", error);
        return text;
    }
}
