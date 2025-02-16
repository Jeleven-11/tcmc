
import Navbar from "@/components/AdNav2";
import { getSession } from "../lib/actions";
import Footer from "@/components/Footer";
import PushNotification from "@/components/PushNotifications";
import DateTimeComponent from "@/components/DateTimeComponent";

// const navigation = [
//   { name: 'Admin Dashboard', href: '/admin' },
//   { name: 'Products', href: '/admin/products' },
//   { name: 'Sales', href: '/admin/purchase' },
//   { name: 'Stock', href: '/admin/listProduct' },
// ]

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const initSession = await getSession()

  return (
    <>
      <PushNotification />
      <DateTimeComponent />
      <Navbar session={initSession} />
        {children}
      <Footer />
    </>
  )
}