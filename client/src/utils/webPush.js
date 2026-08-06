import { getAccessToken } from "../api/tokenStore";

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function registerWebPushSubscription() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Web Push is not supported in this browser environment.");
        return;
    }

    try {
        if (Notification.permission !== "granted") {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                console.warn("Notification permission was not granted by user.");
                return;
            }
        }

        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey =
            import.meta.env.VITE_VAPID_PUBLIC_KEY ||
            "BB95gOB6bqm62mGfFk49ShIwZ2cu_5I4QvMs7c8hM32rDsSfkKXh880XrFTecdsDHQc7UTavNgvkmnkIk3MdXI0";

        if (!vapidPublicKey) {
            console.warn("VAPID public key missing.");
            return;
        }

        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey,
            });
        }

        const token = getAccessToken();
        if (!token) return;

        const API_URL =
            import.meta.env.VITE_API_BASE_URL ||
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000/api/v1";

        const response = await fetch(`${API_URL}/notifications/subscribe-push`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(subscription),
            credentials: "include",
        });

        if (response.ok) {
            console.log("Web Push Subscription successfully registered on backend!");
        } else {
            console.error("Failed to register Web Push Subscription on backend.");
        }
    } catch (err) {
        console.error("Error in registerWebPushSubscription:", err);
    }
}
