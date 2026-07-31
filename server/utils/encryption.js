import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "31a79df6fd1e012e7851a82e8c95c3f578ce15a8316d2b209f10bf488d248019";
const IV_LENGTH = 16;

export function encryptMessage(text) {
    if (!text) return text;
    // Check if it's already encrypted (useful for migrating/avoiding double encryption)
    if (text.includes(":") && text.split(":")[0].length === 32) return text;

    try {
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString("hex") + ":" + encrypted.toString("hex");
    } catch (error) {
        console.error("Encryption error:", error);
        return text;
    }
}

export function decryptMessage(text) {
    if (!text) return text;
    
    let textParts = text.split(":");
    if (textParts.length !== 2) return text;

    try {
        let iv = Buffer.from(textParts.shift(), "hex");
        let encryptedText = Buffer.from(textParts.join(":"), "hex");
        let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption error:", error);
        return text; // Return original if decryption fails (e.g. if the key changed or it wasn't actually encrypted)
    }
}
