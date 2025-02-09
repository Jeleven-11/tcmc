export const requestNotificationPermission = async (): Promise<NotificationPermission> =>
{
  if (!("Notification" in window))
  {
    console.error("This browser does not support desktop notifications.")
    return "denied"
  }

  return Notification.requestPermission()
}

export const sendNotification = (title: string, options?: NotificationOptions): void =>
{
  if (Notification.permission === "granted")
    new Notification(title, options);
  else
    console.warn("Notification permission is not granted.")
}