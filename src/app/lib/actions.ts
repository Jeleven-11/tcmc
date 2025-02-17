"use server";

import { SessionData} from '@/app/lib/session';
import { sessionOptions, defaultSession } from '@/app/lib/session';
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// import { DateTime } from "luxon"

// export async function getServerTime(){
//     return DateTime.now().setZone('Asia/Manila').;
// }

export async function getSession() {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  
    if (!session.isLoggedIn) {
      session.isLoggedIn = defaultSession.isLoggedIn;
    }
  
    return session;
}

export async function login() {
    const session = await getSession();
    session.isLoggedIn = true;
    redirect("/admin");
}

export async function logout() {
    // const session = await getSession();
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    session.destroy();
    redirect("/");
}