"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";
import { logout } from "@/app/lib/actions";
import LogoutModal from "./LogoutModal";

function NavButton({ onClick = () => {}, children, className = "" }: { onClick?: React.MouseEventHandler<HTMLButtonElement>; children: React.ReactNode; className?: string }) {
  return (
    <button className={`mx-4 text-xl font-normal bg-transparent border-none cursor-pointer ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}
function MobileNav({ open, setOpen, pathname, onLogoutClick }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>>; pathname: string; onLogoutClick: () => void }) {
  const getActiveClass = (path: string) => (pathname === path ? "text-green-400 border-b-4 border-green-400" : "text-black hover:text-green-400");

  return (
    <div
  className={`fixed top-0 right-0 h-screen bg-white/80 backdrop-blur-md transform ${
    open ? "translate-x-0" : "translate-x-full"
  } transition-transform duration-300 ease-in-out shadow-lg w-[75%] max-w-[300px] p-4 z-50`}
  style={{ visibility: open ? "visible" : "hidden" }}
>
      <div className="flex items-center justify-center h-20 bg-transparent">
        <Link href="/admin" className="text-xl font-semibold text-black">
          TCMC
        </Link>
      </div>
      <div className="flex flex-col">
        <Link href="/admin" className={`text-xl font-medium my-4 ${getActiveClass("/admin")}`} onClick={() => setTimeout(() => setOpen(false), 100)}>
          Home
        </Link>
        <Link href="/admin/userManagement" className={`text-xl font-medium my-4 ${getActiveClass("/admin/userManagement")}`} onClick={() => setTimeout(() => setOpen(false), 100)}>
          User Management
        </Link>
        <Link href="/admin/watchlist" className={`text-xl font-medium my-4 ${getActiveClass("/admin/watchlist")}`} onClick={() => setTimeout(() => setOpen(false), 100)}>
          Report Management
        </Link>
        <Link href="/admin/camManagement" className={`text-xl font-medium my-4 ${getActiveClass("/admin/camManagement")}`} onClick={() => setTimeout(() => setOpen(false), 100)}>
          Camera Management
        </Link>
        <Link href="/admin/profile" className={`text-xl font-medium my-4 ${getActiveClass("/admin/profile")}`} onClick={() => setTimeout(() => setOpen(false), 100)}>
          My Profile
        </Link>

        {/* Sign Out Button */}
        <button onClick={onLogoutClick} className="flex items-center gap-2 px-4 py-2 text-black hover:text-green-400 hover:bg-white/20 rounded-md transition">
          <FaSignOutAlt size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const pathname = usePathname();

  const getActiveClass = (path: string) => (pathname === path ? "text-blue-600 border-b-4 border-blue-600" : "text-gray-800 hover:text-blue-600");

  const handleSignOut = async () => {
    await logout();
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <nav className="flex filter drop-shadow-md px-4 py-4 h-20 items-center bg-gradient-to-r from-blue-900 to-blue-600 text-white">
      <div className="md:hidden">
  <MobileNav open={open} setOpen={setOpen} pathname={pathname} onLogoutClick={() => setIsLogoutModalOpen(true)} />
</div>
 <div className="w-3/12 flex ml-2 items-center">
          <Link href="/" className="text-2xl font-semibold">
            TCMC
          </Link>
        </div>
        <div className="w-9/12 flex justify-end items-center space-x-2">
        <div className="md:hidden relative flex-shrink-0">
          <div className="z-50 flex relative w-6 h-6 flex-col justify-between items-right" onClick={() => setOpen(!open)}>
            <span className={`h-1 w-8 bg-gray-900 rounded-sm transform transition duration-300 ease-in-out ${open ? "rotate-45 translate-y-2.5" : ""}`} />
            <span className={`h-1 w-8 bg-gray-900 rounded-sm transition-all duration-300 ease-in-out ${open ? "bg-transparent" : "bg-gray-900"}`} />
            <span className={`h-1 w-8 bg-gray-900 rounded-sm transform transition duration-300 ease-in-out ${open ? "-rotate-45 -translate-y-2.5" : ""}`} />
          </div>
        </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/admin" className={`mx-4 text-white text-lg ${getActiveClass("/admin")}`}>
              HOME
            </Link>
            <Link href="/admin/userManagement" className={`mx-4 text-white text-lg ${getActiveClass("/admin/userManagement")}`}>
              USER MANAGEMENT
            </Link>
            <Link href="/admin/watchlist" className={`mx-4 text-white text-lg ${getActiveClass("/admin/watchlist")}`}>
              REPORT MANAGEMENT
            </Link>
            <Link href="/admin/camManagement" className={`mx-4 text-white text-lg ${getActiveClass("/admin/camManagement")}`}>
              CAMERA MANAGEMENT
            </Link>

            {/* Profile Icon */}
            <div className="relative hidden md:flex">
                <NavButton onClick={() => setProfileOpen((prev) => !prev)} className="mx-4 relative">
                  PROFILE
                </NavButton>
                <div className={`absolute top-[200%] right-[-15px] bg-white shadow-lg rounded-md overflow-hidden w-48 ${profileOpen ? "block" : "hidden"}`}>
                  <Link href="/admin/profile" className="block py-2 px-4 text-gray-800 hover:bg-gray-100">
                    Profile
                  </Link>
                  {/* Updated Sign Out Button (Triggers Modal) */}
                  <button onClick={() => setIsLogoutModalOpen(true)} className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left items-center">
                    <FaSignOutAlt size={18} className="mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

      {/* Logout Confirmation Modal */}
      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleSignOut} />
    </>
  );
}
