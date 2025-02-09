
self.addEventListener("push", (event) =>
{
    const data = event.data.json()
    self.registration.showNotification(data.title,
    {
        body: data.body,
        icon: "/image.svg",
        badge: "/image.svg",
    })
})

self.addEventListener("notificationclick", (event) =>
{
    event.notification.close()
    event.waitUntil(
      clients.openWindow("https://tcmc.vercel.app") // Change this to your site URL
    )
})