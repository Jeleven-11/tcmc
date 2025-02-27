import { NextResponse } from "next/server";
import { google } from "googleapis";
import path from "path";
import { promises as fs } from "fs";

const getAuthClient = async () =>
{
    const keyPath = path.join(process.cwd(), "config", "sa.json")
    const keyFile = await fs.readFile(keyPath, "utf8")
    const credentials = JSON.parse(keyFile)
    console.log(keyPath)

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    })

    return auth
}

export async function GET()
{
    try
    {
        const auth = await getAuthClient()
        const drive = google.drive({ version: "v3", auth })

        // const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
        const folderId = "1jfdeg-r2M8eaxiqIVyGiy9dfYD4eN8b6"
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: "files(id, name, mimeType, webViewLink, webContentLink)",
        });

        return NextResponse.json(response.data.files)
    } catch (error) {
        console.error("Error fetching files:", error)
        return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
    }
}