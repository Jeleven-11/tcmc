'use client'

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function DynamicTitlePage()
{
  const route = usePathname()
  useEffect(() =>
  {
    const titles: { [key: string]: string } =
    {
      '/': 'Home',
      '/file-report': 'Filing Report',
      '/report-updates': 'Report Updates',
      '/adminlogin': 'Administrator Login',
      '/admin': 'Admin Dashboard',
      '/admin/userManagement': 'Users Management',
      '/admin/watchlist': 'Reports Watchlist',
      '/admin/camManagement': 'Camera Management',
      '/admin/profile': 'Profile',
    //   '/admin/[id]/test': 'Tinapaklay',
    }

    const pageTitle = titles[route as string] || '';
    // if (route?.startsWith('/admin/page_with_id/') && route.includes('/edit')) // if naay id sa route
    // {
    //   const id = route.split('/')[3]
    //   pageTitle = `Editing Tinapaklay ${id}`
    // }

    // Update the document title
    document.title = `${pageTitle} | ${process.env.WEBAPP_TITLE as unknown as string}`
  }, [route])

  return null
}