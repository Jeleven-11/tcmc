'use client'

import HomeClient from "@/components/HomeClient";
import PushNotification from "@/components/PushNotifications";
  
export default function Home() {

  return (
    <>
      <PushNotification />
      <HomeClient />
    </>
  );
}
