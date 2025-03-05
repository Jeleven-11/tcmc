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

    const folderId = "1jfdeg-r2M8eaxiqIVyGiy9dfYD4eN8b6";
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, webViewLink, webContentLink)",
    });

    return NextResponse.json(response.data.files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
  // try {
  //   const drive = google.drive({ version: "v3", auth: oauth2Client });

  //   const response = await drive.files.list({
  //     q: "1jfdeg-r2M8eaxiqIVyGiy9dfYD4eN8b6", // Replace with your folder ID
  //     // q: "'your-folder-id' in parents", // Replace with your folder ID
  //     fields: "files(id, name, mimeType, webViewLink, webContentLink)",
  //   })

  //   return NextResponse.json(response.data.files);
  // } catch (error) {
  //   console.error("Error fetching files:", error);
  //   return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  // }
}


// import { google } from "googleapis";
// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";

// export async function GET() {
//   const session = await getServerSession(authOptions);
//   if (!session || !session.user?.accessToken) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     console.log(session.user.accessToken)
//     const auth = new google.auth.OAuth2();
//     auth.setCredentials({ access_token: session.user.accessToken });

//     const drive = google.drive({ version: "v3", auth });
//     const response = await drive.files.list({
//       q: "mimeType contains 'video/'",
//       fields: "files(id, name, webContentLink, thumbnailLink)",
//     });

//     return NextResponse.json(response.data.files);
//   } catch (error) {
//     console.error("Error fetching Google Drive videos:", error);
//     return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
//   }
// }