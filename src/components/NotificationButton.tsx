"use client";

import { useEffect, useState } from "react";
import { requestNotificationPermission, sendNotification } from "@/utils/notifications";

const AutoNotification = () => {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);

  useEffect(() => {
    // Request permission when component mounts
    requestNotificationPermission().then(setPermission);
  }, []);

  useEffect(() => {
    if (permission === "granted") {
      const interval = setInterval(() => {
        sendNotification("🔔 Reminder!", {
          body: "This is an automatic notification sent every 10 seconds.",
          icon: "/favicon.ico",
        });
      }, 30000); // 30 seconds

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [permission]);

  return (
    <div className="text-center">
      {permission === "default" && <p>Requesting notification permission...</p>}
      {permission === "denied" && <p>Notifications are blocked. Enable them in browser settings.</p>}
      {permission === "granted" && <p>✅ Notifications will be sent every 10 seconds!</p>}
    </div>
  );
};

export default AutoNotification;
