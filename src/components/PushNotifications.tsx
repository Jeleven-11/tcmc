"use client";

import { useEffect, useState } from "react";
import { registerServiceWorker } from "@/utils/registerServiceWorker";

const PUBLIC_VAPID_KEY = "BIK1qzjrQRCZMsOzO6GH4HeXKOBivuy0npF21_eJONISLMFHPjxwDbcuZNs7bWH-P62GPHjcywsqdoiMJ6O87A8";

const PushNotification = () =>
{
    const [subscribed, setSubscribed] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() =>
    {
        if (isMounted)
            return

        setIsMounted(true)

        const subscribeToPush = async () =>
        {
            await registerServiceWorker()
            if (!("PushManager" in window))
            {
                console.warn("Push notifications are not supported.")
                return
            }

            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            if (!subscription)
            {
                const newSubscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
                })

                await fetch("/api/subscribe",
                {
                    method: "POST",
                    body: JSON.stringify(newSubscription),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }).then((res) =>
                {
                    if (res.ok)
                    {
                        console.log("Subscribed to push notifications!")
                        setSubscribed(true)
                    }
                }).catch((err) => console.error(err))
            } else {
                console.log("Already subscribed to push notifications!")
                setSubscribed(true)
            }
        }

        subscribeToPush()
    }, [isMounted])

  return (
    <div className="text-center">
      {subscribed ? (
        <p>✅ Push Notifications Enabled!</p>
      ) : (
        <p>🔔 Enabling push notifications...</p>
      )}
    </div>
  );
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string)
{
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)))
}

export default PushNotification
