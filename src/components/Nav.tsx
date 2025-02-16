'use client';

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiLogIn } from "react-icons/fi";
import { Menu, X } from "lucide-react";

// Mobile Navigation Component
type MobileNavProps = {
  isOpen: boolean;
  toggleOpen: (isOpen: boolean) => void;
  currentPath: string;
};

function MobileNav({ isOpen, toggleOpen, currentPath }: MobileNavProps) {
  const getLinkClass = (path: string) =>
    currentPath === path
      ? "text-blue-600 border-b-4 border-blue-600 font-semibold"
      : "text-gray-800 hover:text-blue-600";

  return (
    <div
      className={`fixed top-0 right-0 h-screen w-[70%] max-w-sm bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out 
            ${isOpen ? "translate-x-0" : "translate-x-full"} overflow-hidden z-50 flex flex-col`}
    >
      <button onClick={() => toggleOpen(false)} className="self-end p-4 text-gray-500 dark:text-white">
        <X className="w-6 h-6" />
      </button>
      <div className="flex flex-col p-4 space-y-4">
        <Link href="/" className={`text-lg font-medium py-2 ${getLinkClass("/")}`} onClick={() => toggleOpen(false)}>
          Home
        </Link>
        <Link href="/file-report" className={`text-lg font-medium py-2 ${getLinkClass("/file-report")}`} onClick={() => toggleOpen(false)}>
          File a Report
        </Link>
        <Link href="/report-updates" className={`text-lg font-medium py-2 ${getLinkClass("/report-updates")}`} onClick={() => toggleOpen(false)}>
          Check Report Update
        </Link>
        <Link href="/adminlogin" className="text-lg font-medium py-2 flex items-center text-gray-800 hover:text-blue-600" onClick={() => toggleOpen(false)}>
          <FiLogIn className="mr-2" /> Login
        </Link>
      </div>
    </div>
  );
}

// Main Navbar Component
export default function Navbar() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const currentPath: string = usePathname();

  const getLinkClass = (path: string) =>
    currentPath === path
      ? "text-blue-600 border-b-4 border-blue-600 font-semibold"
      : "text-gray-800 hover:text-blue-600";

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md mb-4">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-semibold">
          TCMC
        </Link>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Navigation */}
        <MobileNav isOpen={isOpen} toggleOpen={setIsOpen} currentPath={currentPath} />

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4">
          <Link href="/" className={`text-lg ${getLinkClass("/")}`}>
            HOME
          </Link>
          <Link href="/file-report" className={`text-lg ${getLinkClass("/file-report")}`}>
            FILE A REPORT
          </Link>
          <Link href="/report-updates" className={`text-lg ${getLinkClass("/report-updates")}`}>
            CHECK REPORT UPDATE
          </Link>
          <Link href="/adminlogin" className="text-gray-800 dark:text-white hover:text-blue-600">
            <FiLogIn size={25} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
