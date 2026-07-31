// Service Worker for handling Web Push Notifications

self.addEventListener("push", (event) => {
    let payload = {
        title: "SkillSwap AI",
        message: "New notification received.",
        link: "/dashboard"
    };

    if (event.data) {
        try {
            payload = event.data.json();
        } catch (e) {
            payload.message = event.data.text();
        }
    }

    const options = {
        body: payload.message,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        data: {
            link: payload.link || "/dashboard"
        },
        // Premium styling options
        vibrate: [100, 50, 100],
        actions: [
            { action: "view", title: "View Details" },
            { action: "close", title: "Close" }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    let targetUrl = "/dashboard";
    if (event.notification.data && event.notification.data.link) {
        targetUrl = event.notification.data.link;
    }

    if (event.action === "close") {
        return;
    }

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
            // If window is already open, focus it and redirect
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    client.postMessage({ type: "NAVIGATE", url: targetUrl });
                    return client.focus();
                }
            }
            // If no window is open, open a new tab
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
