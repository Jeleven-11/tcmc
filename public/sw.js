
// // self.addEventListener("push", async (event) =>
// // {
// //     if (!event.data)
// //         return

// //     const data = event.data.json()
// //     self.registration.showNotification(data.title,
// //     {
// //         body: data.body,
// //         icon: "/image.svg",
// //         badge: "/image.svg",
// //     })

// //     // Send data to the client (Next.js app) for toast notification
// //     // console.log("Sending data to client:", data)
// //     self.clients.matchAll().then((clients) => clients.forEach((client) => client.postMessage(data)))

// //     await fetch("/api/notifications/stream", {
// //         method: "POST",
// //         body: JSON.stringify({ title, body }),
// //         headers: { "Content-Type": "application/json" },
// //     }).catch((err) => console.error("Failed to send notification data:", err));
// // })

// importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js")
// importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js")

// firebase.initializeApp(
// {
//     apiKey: "AIzaSyDSIDM9nvXhULmLUy0kOR_aoQoV4wn9B_k",
//     authDomain: "tcmcv1-33748.firebaseapp.com",
//     projectId: "tcmcv1-33748",
//     storageBucket: "tcmcv1-33748.firebasestorage.app",
//     messagingSenderId: "764509673946",
//     appId: "1:764509673946:web:1b12999fb27a0843f088e3",
//     vapidKey: "cylMrhbw_OdJSgOSDGs6GNe16c31jUE3Z_evaZV452w",
// })

// const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) =>
// {
//     console.log("Background Notification:", payload);
//     self.registration.showNotification(payload.notification.title,
//     {
//         body: payload.notification.body,
//         icon: "/pnp_logo_notif.svg",
//     })
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
            icon: "/pnp_logo_notif.svg",
            badge: "/pnp_logo_notif.svg",
        })

        self.clients.matchAll().then((clients) => clients.forEach((client) => client.postMessage({ title, body })))

        // Save notification to Firebase
        // const db = getDatabase();
        // set(ref(db, `notifications/${Date.now()}`), { title, body });

        // await fetch("/api/notifications/stream",
        // {
        //     method: "POST",
        //     body: JSON.stringify({ title, body }),
        //     headers: { "Content-Type": "application/json" },
        // }).catch((err) => console.error("Failed to send notification data:", err))
    }
})

// // self.addEventListener("push", (event) => {
// //     if (event.data) {
// //         const { title, body } = event.data.json();

// //         // Show push notification
// //         self.registration.showNotification(title, {
// //             body,
// //             icon: "/public/pnp.jpg", // Optional: Replace with your logo
// //         });

// //         // Send data to the React client
// //         self.clients.matchAll().then((clients) => {
// //             clients.forEach((client) => {
// //                 client.postMessage({ title, body });
// //             });
// //         });
// //     }
// // });

self.addEventListener("notificationclick", (event) =>
{
    event.notification.close()
    event.waitUntil(
      clients.openWindow("https://tcmc.vercel.app/admin")
    )
})