import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const getAuthClient = async () =>
{
    // const keyPath = path.join(process.cwd(), "config", "sa.json") // retrieve using path file
    // const keyFile = await fs.readFile(keyPath, "utf8")
    const credentials = JSON.parse(String(process.env.GOOGLE_GDRIVE_SECRET!))
    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    })

    return auth
}

export async function GET(req: NextRequest)
{
    try
    {
        const auth = await getAuthClient()
        const drive = google.drive({ version: "v3", auth })

        const { searchParams } = new URL(req.url)
        const pageToken = searchParams.get("pageToken") || undefined

        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!
        const response = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: "nextPageToken, files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink)",
            pageSize: 2,
            pageToken,
        })

        return NextResponse.json({
            videos: response.data.files || [],
            nextPageToken: response.data.nextPageToken || null,
        })
    } catch (error) {
        console.error("Error fetching files:", error)
        return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
    }
}