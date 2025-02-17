
// self.addEventListener("push", async (event) =>
// {
//     if (!event.data)
//         return

//     const data = event.data.json()
//     self.registration.showNotification(data.title,
//     {
//         body: data.body,
//         icon: "/image.svg",
//         badge: "/image.svg",
//     })

//     // Send data to the client (Next.js app) for toast notification
//     // console.log("Sending data to client:", data)
//     self.clients.matchAll().then((clients) => clients.forEach((client) => client.postMessage(data)))

//     await fetch("/api/notifications/stream", {
//         method: "POST",
//         body: JSON.stringify({ title, body }),
//         headers: { "Content-Type": "application/json" },
//     }).catch((err) => console.error("Failed to send notification data:", err));
// })


self.addEventListener("push", async (event) =>
{
    if (event.data)
    {
        const { title, body } = event.data.json()

        // Show native push notification
        // self.registration.showNotification(title, { body })
        self.registration.showNotification(title,
        {
            body: body,
            icon: "/pnp_logo_notif.png",
            badge: "/pnp_logo_notif.png",
        })

        self.clients.matchAll().then((clients) => clients.forEach((client) => client.postMessage({ title, body })))

        await fetch("/api/notifications/stream",
        {
            method: "POST",
            body: JSON.stringify({ title, body }),
            headers: { "Content-Type": "application/json" },
        }).catch((err) => console.error("Failed to send notification data:", err))
    }
})

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