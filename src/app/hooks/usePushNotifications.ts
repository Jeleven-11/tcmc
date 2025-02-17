"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function usePushNotifications()
{
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() =>
    {
        if (isMounted)
            return

        if (typeof window === "undefined")
            return

        setIsMounted(true)

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener("message", (event) =>
        {
            const { title, body } = event.data
            if (title && body)
                toast.info(`📢 ${title}: ${body}`)
            else
                console.warn("⚠️ No title/body in push event data")
        })

        const eventSource = new EventSource("/api/notifications/stream")
        eventSource.onmessage = (event) =>
        {
            const notification = JSON.parse(event.data)
            toast.info(`📢 ${notification.title}: ${notification.body}`)
        }

        return () => eventSource.close()
    }, [isMounted])

    return null
}