import { NextResponse } from "next/server";
import { google } from "googleapis";
// import oauth2Client from "@/utils/gdrive";
// import path from "path";
// import fs from "fs/promises";

const getAuthClient = async () =>
{
  // const keyPath = path.join(process.cwd(), "/src/config", "sa.json")
  // const keyFile = await fs.readFile(keyPath, "utf8")
  const credentials = JSON.parse(String(process.env.SERVICE_ACCOUNT!))

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  })

  return auth
}

export async function GET()
{
  try {
    const auth = await getAuthClient();
    const drive = google.drive({ version: "v3", auth });

    const folderId = "14y2Arew7POKwhPLVRuqLaW4jBG0rAuYg";
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, webViewLink, webContentLink, createdTime)",
    });

    return NextResponse.json(response.data.files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}