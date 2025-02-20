import { google } from "googleapis";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log(session.user.accessToken)
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.user.accessToken });

    const drive = google.drive({ version: "v3", auth });
    const response = await drive.files.list({
      q: "mimeType contains 'video/'",
      fields: "files(id, name, webContentLink, thumbnailLink)",
    });

    return NextResponse.json(response.data.files);
  } catch (error) {
    console.error("Error fetching Google Drive videos:", error);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}