import { NextResponse } from "next/server";
import webpush from "web-push";
import { promises as fs } from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "data", "subscriptions.json");

const PUBLIC_VAPID_KEY = "BIK1qzjrQRCZMsOzO6GH4HeXKOBivuy0npF21_eJONISLMFHPjxwDbcuZNs7bWH-P62GPHjcywsqdoiMJ6O87A8";
const PRIVATE_VAPID_KEY = "cylMrhbw_OdJSgOSDGs6GNe16c31jUE3Z_evaZV452w";

webpush.setVapidDetails(
  "mailto:teamsapphire003@gmail.com",
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

export async function GET()
{
    try
    {
        const fileData = await fs.readFile(FILE_PATH, "utf8");
        const subscriptions = JSON.parse(fileData) as webpush.PushSubscription[];

        if (subscriptions.length === 0)
            return NextResponse.json({ message: "No subscribers available", subscriptions });

        const notificationPayload = JSON.stringify({
            title: "🔔 Persistent Push Notification",
            body: "This is a push notification stored in a JSON file!",
        });

        subscriptions.forEach((sub) => {
            return webpush.sendNotification(sub, notificationPayload).catch((err) => console.error(err));
        });

        return NextResponse.json({ message: "Notification sent!", subscriptions });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
    }
  }
  
