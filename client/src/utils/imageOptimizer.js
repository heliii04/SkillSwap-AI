/**
 * Cloudinary & General Image Optimization Helper
 * Injects f_auto, q_auto and dynamic width parameters into Cloudinary URLs
 * for automatic WebP/AVIF format conversion and instant payload compression.
 */
export function getOptimizedImageUrl(url, options = {}) {
    if (!url || typeof url !== "string") {
        return null;
    }

    const {
        width = 300,
        quality = "auto",
        format = "auto",
        crop = "fill",
    } = options;

    // Check if URL is a Cloudinary URL
    if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
        // Prevent duplicate transformation injection
        if (url.includes("/upload/f_auto") || url.includes("/upload/w_")) {
            return url;
        }
        const transformation = `f_${format},q_${quality},w_${width},c_${crop}`;
        return url.replace("/upload/", `/upload/${transformation}/`);
    }

    return url;
}

/**
 * Generates an initials SVG avatar URI when avatar image is missing
 */
export function getAvatarFallback(name = "User") {
    const cleanName = String(name || "User").trim();
    const initials = cleanName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#f97316" rx="50"/>
        <text x="50%" y="54%" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
