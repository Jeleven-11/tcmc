'use client'

import HomeClient from "@/components/HomeClient";
//import NotificationButton from "@/components/NotificationButton";
import PushNotification from "@/components/PushNotifications";
import { DateTime } from "luxon";
export default function Home()
{
  const asd = DateTime.now();
  const asdd = new Date().toISOString();
  return (
    <>
      { asd.toString() }
      { asdd.toString() }
      <PushNotification />
      <HomeClient />
    </>
  )
}