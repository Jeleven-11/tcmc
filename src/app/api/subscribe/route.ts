import { NextRequest, NextResponse } from "next/server";
import pool from "../../lib/db";
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
export async function POST(req: NextRequest) {
    const data = await req.json();
    const { fcmToken } = data;

    try {
        const connection = await pool.getConnection();
        await connection.query(
            "INSERT INTO users (fcmToken) VALUES (?)",
            [fcmToken]
        );

        connection.release();
        await admin.messaging().subscribeToTopic(fcmToken, "allUsers");

        return NextResponse.json({ message: "Subscribed successfully" });
    } catch (error) {
        console.error("Error subscribing:", error);
        return NextResponse.json({ error: "Error subscribing" }, { status: 500 });
    }
}