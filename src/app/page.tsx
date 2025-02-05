'use client'

import HomeClient from "@/components/HomeClient";
//import NotificationButton from "@/components/NotificationButton";
import PushNotification from "@/components/PushNotifications";

export default function Home()
{
  return (
    <>
      <PushNotification />
      <HomeClient />
    </>
  )
}