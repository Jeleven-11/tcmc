"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiLogIn } from "react-icons/fi";

type MobileNavProps = {
  isOpen: boolean;
  toggleOpen: (isOpen: boolean) => void;
  currentPath: string;
};

function MobileNav({ isOpen, toggleOpen, currentPath }: MobileNavProps) {
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isOpen);
  }, [isOpen]);

  const getLinkClass = (path: string) =>
    currentPath === path
      ? "text-lime-700 border-b-4 border-lime-700 font-semibold"
      : "text-gray-800 hover:text-lime-500";

  return (
    <div
      className={`fixed top-0 right-0 h-screen w-[70%] max-w-sm bg-green-50 shadow-lg transform transition-transform duration-300 ease-in-out 
            ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"} overflow-hidden`}
    >
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
        <Link href="/adminlogin" className="text-lg font-medium py-2 flex items-center text-gray-800 hover:text-lime-600" onClick={() => toggleOpen(false)}>
          <FiLogIn className="mr-2" /> Login
        </Link>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const currentPath = usePathname();

  const getLinkClass = (path: string) =>
    currentPath === path
      ? "text-lime-400 border-b-4 border-white font-semibold"
      : "text-white hover:text-lime-300";

  return (
    <nav className="flex drop-shadow-md px-6 py-6 h-20 items-center bg-gradient-to-r from-green-800 to-lime-600 text-white">
      <MobileNav isOpen={isOpen} toggleOpen={setIsOpen} currentPath={currentPath} />
      <div className="w-3/12 flex ml-2 items-center">
        <Link href="/" className="text-2xl font-semibold">
          TCMC
        </Link>
      </div>
      <div className="w-9/12 flex justify-end items-center space-x-2">
        <div className="md:hidden relative flex-shrink-0">
          <div className="z-50 flex relative w-6 h-6 flex-col justify-between items-right" onClick={() => setIsOpen(!isOpen)}>
            <span className={`h-1 w-8 bg-gray-900 rounded-sm transform transition duration-300 ease-in-out ${isOpen ? "rotate-45 translate-y-2.5" : ""}`} />
            <span className={`h-1 w-8 bg-gray-900 rounded-sm transition-all duration-300 ease-in-out ${isOpen ? "bg-transparent" : "bg-gray-900"}`} />
            <span className={`h-1 w-8 bg-gray-900 rounded-sm transform transition duration-300 ease-in-out ${isOpen ? "-rotate-45 -translate-y-2.5" : ""}`} />
          </div>
        </div>

        <div className="hidden md:flex">
          <Link href="/" className={`mx-4 text-lg text-white ${getLinkClass("/")}`}>
            HOME
          </Link>
          <Link href="/file-report" className={`mx-4 text-lg text-white ${getLinkClass("/file-report")}`}>
            FILE A REPORT
          </Link>
          <Link href="/report-updates" className={`mx-4 text-lg text-white ${getLinkClass("/report-updates")}`}>
            CHECK REPORT UPDATE
          </Link>
          <Link href="/adminlogin" className="text-white mx-4 hover:text-lime-300">
            <FiLogIn size={25} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

