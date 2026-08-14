import { verifyAccessToken } from "../utils/token.utils.js";
import User from "../models/User.js";

/**
 * Socket.io Authentication Middleware
 * Validates JWT Access Token during socket connection handshake
 */
export async function socketAuthMiddleware(socket, next) {
    try {
        const rawToken =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization;

        if (!rawToken) {
            return next(new Error("Authentication error: Token missing"));
        }

        const token = String(rawToken).startsWith("Bearer ")
            ? String(rawToken).slice(7)
            : String(rawToken);

        const payload = verifyAccessToken(token);

        if (!payload || !payload.sub) {
            return next(new Error("Authentication error: Invalid token payload"));
        }

        if (payload.sub === "static_admin_id") {
            socket.userId = "static_admin_id";
            socket.user = { _id: "static_admin_id", role: "admin", name: "System Admin" };
            socket.join("static_admin_id");
            return next();
        }

        const user = await User.findById(payload.sub)
            .select("name email role accountStatus")
            .lean();

        if (!user || user.accountStatus !== "active") {
            return next(new Error("Authentication error: User not active or not found"));
        }

        socket.user = user;
        socket.userId = user._id.toString();

        // Automatically & securely subscribe socket to private user notification room
        socket.join(socket.userId);

        return next();
    } catch (error) {
        console.warn("⚠️ [SOCKET AUTH FAILED]:", error.message);
        return next(new Error(`Authentication error: ${error.message}`));
    }
}

export default socketAuthMiddleware;
