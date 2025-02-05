import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const FILE_PATH = path.join(process.cwd(), "data", "subscriptions.json");

export async function POST(req: NextRequest) {
  try {
    const subscription: PushSubscription = await req.json();

    // Read existing subscriptions
    const fileData = await fs.readFile(FILE_PATH, "utf8");
    const subscriptions = JSON.parse(fileData) as PushSubscription[];

    // Prevent duplicates
    if (!subscriptions.find((sub) => sub.endpoint === subscription.endpoint)) {
      subscriptions.push(subscription);
      await fs.writeFile(FILE_PATH, JSON.stringify(subscriptions, null, 2), "utf8");
    }

    return NextResponse.json({ message: "Subscribed successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
