
self.addEventListener("push", (event) =>
{
    if (!event.data)
        return

    const data = event.data.json()
    self.registration.showNotification(data.title,
    {
        body: data.body,
        icon: "/image.svg",
        badge: "/image.svg",
    })

    // Send data to the client (Next.js app) for toast notification
    // self.clients.matchAll().then((clients) => clients.forEach((client) => client.postMessage(data)))
})


// self.addEventListener("push", async (event) => {
//     if (event.data) {
//         const { title, body } = event.data.json();

//         // Show native push notification
//         self.registration.showNotification(title, { body });

//         // Debug: Log when push event occurs
//         console.log("Push event received in service worker:", { title, body });

//         // Send message to React client
//         // self.clients.matchAll().then((clients) => {
//         //     clients.forEach((client) => {
//         //         console.log("Sending message to React client:", { title, body }); // Debug
//         //         client.postMessage({ title, body });
//         //     });
//         // });

//         await fetch("/api/notifications/stream", {
//             method: "POST",
//             body: JSON.stringify({ title, body }),
//             headers: { "Content-Type": "application/json" },
//         }).catch((err) => console.error("Failed to send notification data:", err));
//     }
// });

// self.addEventListener("push", (event) => {
//     if (event.data) {
//         const { title, body } = event.data.json();

//         // Show push notification
//         self.registration.showNotification(title, {
//             body,
//             icon: "/public/pnp.jpg", // Optional: Replace with your logo
//         });

//         // Send data to the React client
//         self.clients.matchAll().then((clients) => {
//             clients.forEach((client) => {
//                 client.postMessage({ title, body });
//             });
//         });
//     }
// });

self.addEventListener("notificationclick", (event) =>
{
    event.notification.close()
    event.waitUntil(
      clients.openWindow("https://tcmc.vercel.app")
    )
})