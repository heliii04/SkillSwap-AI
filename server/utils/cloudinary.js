import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

/**
 * Uploads a file buffer directly to Cloudinary
 * @param {Buffer} fileBuffer - Raw buffer of the file
 * @param {Object} options - Upload options (folder, originalName, mimeType)
 * @returns {Promise<Object>} Upload result containing secure_url
 */
export async function uploadToCloudinary(fileBuffer, options = {}) {
    const { folder = "skillswap/chat_documents" } = options;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Determine proper Cloudinary resource_type (raw for PDFs/Docs/ZIPs to preserve extensions)
    const isImageOrVideo = options.mimeType && (options.mimeType.startsWith("image/") || options.mimeType.startsWith("video/"));
    const targetResourceType = isImageOrVideo ? "auto" : "raw";
    const cleanFileName = options.originalName ? options.originalName.replace(/[^a-zA-Z0-9_.-]/g, "_") : `doc_${Date.now()}`;
    const publicId = `${Date.now()}_${cleanFileName}`;

    // If Cloudinary is configured in .env, stream upload directly to Cloudinary CDN
    if (cloudName && apiKey && apiSecret && cloudName !== "your_cloudinary_cloud_name") {
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true,
        });

        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: targetResourceType,
                    public_id: publicId,
                    use_filename: true,
                    unique_filename: false,
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error);
                        return reject(error);
                    }
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        format: result.format,
                        bytes: result.bytes,
                    });
                }
            );
            stream.end(fileBuffer);
        });
    }

    // High-res fallback if Cloudinary environment keys are pending in .env
    const mimeType = options.mimeType || "application/octet-stream";
    const base64Data = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    return {
        url: base64Data,
        publicId: `chat_doc_${Date.now()}`,
        format: options.originalName ? options.originalName.split(".").pop() : "bin",
        bytes: fileBuffer.length,
    };
}
