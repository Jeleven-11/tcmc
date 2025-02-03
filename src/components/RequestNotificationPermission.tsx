"use client";
import { useEffect } from "react";
import { messaging } from "@/app/lib/firebaseCloudMessaging";
import { getToken } from "firebase/messaging";

const RequestNotificationPermission = () => {
    useEffect(() => {
        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const token = await getToken(messaging, {
                        vapidKey: 'BE-_gpxACBL70phtkNW2U_UaOQwI4pkC-Jl3b7TQn9RpDxTZMC0XT5yyBV3TwlnoLL2HG7MXmHEHON7hambMo_A',
                    });
                    fetch('/api/subscribe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token }),
                    });
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        };
        requestPermission();
    }, []);

    return null;
};

export default RequestNotificationPermission;
            