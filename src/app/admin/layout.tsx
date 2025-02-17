'use client'

import Navbar from "@/components/AdNav2";
import { getSession } from "../lib/actions";
import Footer from "@/components/Footer";
import PushNotification from "@/components/PushNotifSubscribe";
import DateTimeComponent from "@/components/DateTimeComponent";
import { Loader } from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";
import { IronSession } from "iron-session";
import { SessionData } from "../lib/session";
import { ToastContainer } from "react-toastify";
import usePushNotifications from "../hooks/usePushNotifications";

// const navigation = [
//   { name: 'Admin Dashboard', href: '/admin' },
//   { name: 'Products', href: '/admin/products' },
//   { name: 'Sales', href: '/admin/purchase' },
//   { name: 'Stock', href: '/admin/listProduct' },
// ]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  usePushNotifications()

  const [session, setSession] = useState<IronSession<SessionData> | null>(null); // ✅ Use state to store session data

  useEffect(() => {
    async function fetchSession() {
      const initSession = await getSession();
      setSession(initSession); // ✅ Store session data in state
    }
    fetchSession();
  }, []); // ✅ Run once when component mounts

  return (
    <>
      <PushNotification />
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
      <Footer />
    </>
  )
}