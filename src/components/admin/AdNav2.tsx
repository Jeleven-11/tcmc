'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/lib/actions';
import LogoutModal from '../LogoutModal';
import PushNotifSubscribe from './PushNotifSubscribe';
import { Button } from '@mui/material';
import { AccountBox, Logout /*Update*/ } from '@mui/icons-material';
import ActiveUsers from '../Arise';


interface SessionData {
  session: {
    isLoggedIn: boolean;
    name?: string;
    contact_num?: string;
    team?: number;
    email?: string;
  } | null;
}

export default function Navbar({ session }: SessionData)
{
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const pathname = usePathname();

  const getActiveClass = (path: string) => (pathname === path ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-800 hover:text-blue-600');

  const handleSignOut = async () => {
    await logout();
    setIsLogoutModalOpen(false);
  };

  return (
    <nav className="bg-white border-gray-200 bg-white-900 px-4 shadow-md mb-4">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-3">
        {/* Logo */}
        <Link href="/admin" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image src="/tangubpnplogo.jpeg" alt="Logo" width={32} height={32} />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">TCMC</span>
        </Link>

        {/* Right-side Icons: Notification, User Avatar, and Mobile Menu */}
        <div className="flex items-center md:order-2 space-x-4 md:space-x-3 rtl:space-x-reverse">
          <PushNotifSubscribe />
          {/* test */}
          <ActiveUsers />

          {/* User Avatar */}
          <button
            type="button"
            className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-600"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="sr-only">Open user menu</span>
            <Image src="/user.jpg" alt="logo" width={32} height={32} className="w-8 h-8 rounded-full" />
          </button>

          {/* User Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 z-50 mt-16 top-20 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow-lg">
              <div className="px-4 py-3">
                <span className="block text-sm text-gray-900">{session?.name}</span>
                <span className="block text-sm text-gray-500 truncate">{session?.email}</span>
              </div>
              <ul className="py-2 text-gray-800">
                {/* Profile Button */}
                <li>
                  <Button 
                    href="/admin/profile"
                    component={Link}
                    fullWidth
                    sx={{ 
                      justifyContent: 'flex-start', 
                      textTransform: 'none', 
                      display: 'flex', 
                      alignItems: 'center', 
                    }}
                    className="w-full text-gray-700 text-sm hover:bg-gray-100 px-4 py-2 gap-2"
                  >
                    <AccountBox className="text-gray-700 w-5 h-5" /> 
                    <span className="whitespace-nowrap text-gray-700">Profile</span>
                  </Button>
                </li>
                
                {/* Sign Out Button */}
                <li>
                  <Button 
                    onClick={() => setIsLogoutModalOpen(true)}
                    // component={setIsLogoutModalOpen(true)} 
                    fullWidth
                    sx={{ 
                      justifyContent: 'flex-start', 
                      textTransform: 'none', 
                      display: 'flex', 
                      alignItems: 'center', 
                    }}
                    className="w-full text-gray-700 text-sm hover:bg-gray-100 px-4 py-2 gap-2"
                  >
                    <Logout className="text-gray-700 w-5 h-5" />
                    <span className="whitespace-nowrap text-gray-700">Sign Out</span>
                  </Button>
                </li>
              </ul>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 dark:text-gray-400">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:flex md:w-auto md:order-1 w-full`}>
          <ul className="flex flex-col md:flex-row font-medium p-4 md:p-0 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:border-0 md:bg-white bg-white-800">
            <li><Link href="/admin" className={`block py-2 px-3 text-lg ${getActiveClass('/admin')}`}>Home</Link></li>
            <li><Link href="/admin/userManagement" className={`block py-2 px-3 text-lg ${getActiveClass('/admin/userManagement')}`}>User Management</Link></li>
            <li><Link href="/admin/watchlist" className={`block py-2 px-3 text-lg ${getActiveClass('/admin/watchlist')}`}>Report Management</Link></li>
            <li><Link href="/admin/camManagement" className={`block py-2 px-3 text-lg ${getActiveClass('/admin/camManagement')}`}>Camera Management</Link></li>
            <li><Link href="/admin/profile" className={`block py-2 px-3 text-lg ${getActiveClass('/admin/profile')}`}>My Profile</Link></li>
          </ul>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleSignOut} />
    </nav>
  )
}