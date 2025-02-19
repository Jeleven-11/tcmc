"use client";

import { useEffect, useState } from "react";
import { registerServiceWorker } from "@/utils/registerServiceWorker";
import { IoNotifications } from "react-icons/io5";
import { IconButton } from "@mui/material";
import { Tooltip } from "@mui/material";

const PUBLIC_VAPID_KEY = "BIK1qzjrQRCZMsOzO6GH4HeXKOBivuy0npF21_eJONISLMFHPjxwDbcuZNs7bWH-P62GPHjcywsqdoiMJ6O87A8";

const PushNotification = () =>
{
    const [subscribed, setSubscribed] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() =>
    {
        setIsMounted(true)

        const checkSubscription = async () =>
        {
            await registerServiceWorker()
            if (!("PushManager" in window))
            {
                console.warn("Push notifications are not supported.")
                return
            }

            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            setSubscribed(!!subscription)
        }
        checkSubscription()

        // const subscribeToPush = async () =>
        // {
        //     await registerServiceWorker()
        //     if (!("PushManager" in window))
        //     {
        //         console.warn("Push notifications are not supported.")
        //         return
        //     }

        //     const registration = await navigator.serviceWorker.ready
        //     const subscription = await registration.pushManager.getSubscription()
        //     if (!subscription)
        //     {
        //         const newSubscription = await registration.pushManager.subscribe({
        //             userVisibleOnly: true,
        //             applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        //         })

        //         await fetch("/api/subscribe",
        //         {
        //             method: "POST",
        //             body: JSON.stringify(newSubscription),
        //             headers: {
        //                 "Content-Type": "application/json",
        //             },
        //         }).then((res) =>
        //         {
        //             if (res.ok)
        //             {
        //                 console.log("Subscribed to push notifications!")
        //                 setSubscribed(true)
        //             }
        //         }).catch((err) => console.error(err))
        //     } else {
        //         console.log("Already subscribed to push notifications!")
        //         setSubscribed(true)
        //     }
        // }

        // subscribeToPush()
    }, [isMounted])

    if (!isMounted)
        return null

    const subscribeToPush = async () =>
    {
        try
        {
            const registration = await navigator.serviceWorker.ready
            let subscription = await registration.pushManager.getSubscription()
            if (!subscription)
            {
                console.log("No active subscription, subscribing now...");
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
                })
            } else console.log("Already subscribed, updating on server...")

            const response = await fetch("/api/notifications/subscribe",
            {
                method: "POST",
                body: JSON.stringify(subscription),
                headers: { "Content-Type": "application/json" },
            })

            if (response.ok)
            {
                console.log("Subscribed to push notifications!")
                setSubscribed(true)
            } //else console.error("Failed to register subscription:", await response.text())

            // await fetch("/api/notifications/subscribe", {
            //     method: "POST",
            //     body: JSON.stringify(subscription),
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            // }).then((res) => {
            //     if (res.ok) {
            //         console.log("Subscribed to push notifications!");
            //         setSubscribed(true)
            //     }
            // }).catch((err) => console.error(err))
        } catch (error) {
            console.error("Failed to subscribe to push notifications:", error)
        }
    }

    const unsubscribeFromPush = async () =>
    {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (subscription)
        {
            await subscription.unsubscribe()
            await fetch("/api/notifications/unsubscribe",
            {
                method: "POST",
                body: JSON.stringify(subscription),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((res) =>
            {
                if (res.ok)
                {
                    console.log("Unsubscribed from push notifications!");
                    setSubscribed(false)
                }
            }).catch((err) => console.error(err))
        }
    }

    return (
        <Tooltip onClick={subscribed ? unsubscribeFromPush : subscribeToPush} title={subscribed ? "Notified to any updates" : "Click to notify any updates" }>
            <IconButton>
                {subscribed ? "🔔" : <IoNotifications />}
            </IconButton>
        </Tooltip>
    )
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string)
{
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)))
}

export default PushNotification