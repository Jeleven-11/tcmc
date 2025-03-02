'use client'

import Navbar from "@/components/admin/AdNav2";
import { getSession } from "../lib/actions";
import DateTimeComponent from "@/components/admin/DateTimeComponent";
import { Loader } from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";
import { IronSession } from "iron-session";
import { SessionData } from "../lib/session";
import { ToastContainer } from "react-toastify";
import usePushNotifications from "../hooks/usePushNotifications";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  usePushNotifications()

  const [session, setSession] = useState<IronSession<SessionData> | null>(null);

  useEffect(() => {
    async function fetchSession() {
      const initSession = await getSession();
      setSession(initSession);
    }
    fetchSession();
  }, []);

  return (
    <>
      <DateTimeComponent />
      <Navbar session={session} />
      <Suspense
          fallback={
            <div className="flex gap-6 justify-center mt-32">
              <Loader className="size-14 animate-spin bg-black" />
            </div>
          }
        >
          {children}
      </Suspense>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}