import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

// import serviceAccount from "../../lib/tcmc-ac38a-firebase-adminsdk-fbsvc-ec6e20fa54.json";
if(!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            "type": "service_account",
            "project_id": "tcmc-ac38a",
            "private_key_id": "ec6e20fa5411e9ad4df460c862be373856d7daf2",
            "private_key": process.env.FIREBASE_PRIVATE_KEY,
            "client_email": "firebase-adminsdk-fbsvc@tcmc-ac38a.iam.gserviceaccount.com",
            "client_id": "102904395537028858357",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tcmc-ac38a.iam.gserviceaccount.com",
            "universe_domain": "googleapis.com"
          } as admin.ServiceAccount)
    });
}
export async function POST(request: NextRequest) {
    const { title, body } = await request.json();
    const message = {
        notification: {
            title,
            body: body,
            click_action: "https://tcmc.vercel.app/",
        },
        topic: 'allUsers'
    };
    try {
        const response = await admin.messaging().send(message);
        return NextResponse.json({ success: true, response }, { status: 200 });
    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json({ success: false, error: "Error sending notification" }, { status: 500 });
    }
}