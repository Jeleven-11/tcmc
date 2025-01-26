"use client";
import { useState } from 'react';
import Link from 'next/link';
//import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FiLogIn } from "react-icons/fi";


function MobileNav({ open, setOpen, pathname }: { open: boolean; setOpen: (open: boolean) => void; pathname: string }) {
    const getActiveClass = (path: string) =>
        pathname === path
            ? 'text-blue-600 border-b-4 border-blue-600' // Active style
            : 'text-gray-800 hover:text-blue-600'; // Default style

    return (
        <div className={`absolute top-0 left-0 h-screen w-screen bg-white transform ${open ? "-translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out filter drop-shadow-md`}>
            <div className="flex items-center justify-center ml-6 filter drop-shadow-md bg-blue-600 h-20">
                <Link href="/" className="text-xl font-semibold">
                    TCMC
                </Link>
            </div>
            <div className="flex flex-col ml-4">
                <Link
                    href="/"
                    className={`text-xl font-medium my-4 ${getActiveClass('/')}`}
                    onClick={() => setTimeout(() => { setOpen(!open) }, 100)}
                >
                    Home
                </Link>

                <Link
                    href="/file-report"
                    className={`text-xl font-medium my-4 ${getActiveClass('/file-report')}`}
                    onClick={() => setTimeout(() => { setOpen(!open) }, 100)}
                >
                    File a Report
                </Link>

                <Link
                    href="/report-updates"
                    className={`text-xl font-medium my-4 ${getActiveClass('/report-updates')}`}
                    onClick={() => setTimeout(() => { setOpen(!open) }, 100)}
                >
                    Check Report Update
                </Link>

           
            </div>
        </div>
    );
}

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const getActiveClass = (path: string) =>
        pathname === path
            ? 'text-blue-600 border-b-4 border-white' // Active style
            : 'text-gray-800 hover:text-cyan-400'; // Default style

    return (
        <nav className="flex filter drop-shadow-md px-4 py-4 h-20 items-center bg-gradient-to-r from-blue-900 to-blue-600 text-white">
            <MobileNav open={open} setOpen={setOpen} pathname={pathname} />
            <div className="w-3/12 flex ml-2 items-center">
                <Link href="/" className="text-2xl font-semibold">
                    TCMC
                </Link>
            </div>
            <div className="w-9/12 flex justify-end items-center">
                <div className="z-50 flex relative w-8 h-8 flex-col justify-between items-center md:hidden" onClick={() => setOpen(!open)}>
                    {/* Hamburger button */}
                    <span className={`h-1 w-full bg-black rounded-lg transform transition duration-300 ease-in-out ${open ? "rotate-45 translate-y-3.5" : ""}`} />
                    <span className={`h-1 w-full bg-black rounded-lg transition-all duration-300 ease-in-out ${open ? "w-0" : "w-full"}`} />
                    <span className={`h-1 w-full bg-black rounded-lg transform transition duration-300 ease-in-out ${open ? "-rotate-45 -translate-y-3.5" : ""}`} />
                </div>

                <div className="hidden md:flex">
                    <Link href="/" className={`mx-4 text-lg text-white ${getActiveClass('/')}`}>
                        HOME
                    </Link>

                    <Link href="/file-report" className={`mx-4 text-lg text-white ${getActiveClass('/file-report')}`}>
                        FILE A REPORT
                    </Link>

                    <Link href="/report-updates" className={`mx-4 text-lg text-white ${getActiveClass('/report-updates')}`}>
                       CHECK REPORT UPDATE
                    </Link>

 <Link href="/adminlogin" className="text-white mx-4 hover:text-cyan-400">
 <FiLogIn size={25} />
                   </Link>

                  
                 
                </div>
                
            </div>
        </nav>
    );
}
