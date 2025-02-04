"use client";
import { useState } from 'react';
import Link from 'next/link';
//import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FiLogIn } from "react-icons/fi";

{/*Changed color schemes and margins, revert to prev ver if errors persists */}
function MobileNav({ open, setOpen, pathname }: { open: boolean; setOpen: (open: boolean) => void; pathname: string }) {
    const getActiveClass = (path: string) =>
        pathname === path
            ? 'text-lime-700 border-b-4 border-lime-700 font-semibold'  
            : 'text-gray-800 hover:text-lime-500';  

    return (
        <div className={`fixed top-0 right-0 h-auto max-h-screen w-[80%] max-w-sm bg-green-50 shadow-lg transform ${open ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out`}>
            <div className="flex items-center justify-end px-6 py-4 bg-green-800">
                <button onClick={() => setOpen(false)} className="text-white text-2xl">&times;</button>
            </div>
            <div className="flex flex-col px-6 py-4">
                <Link href="/" className={`text-lg font-medium py-2 ${getActiveClass('/')}`} onClick={() => setOpen(false)}>Home</Link>
                <Link href="/file-report" className={`text-lg font-medium py-2 ${getActiveClass('/file-report')}`} onClick={() => setOpen(false)}>File a Report</Link>
                <Link href="/report-updates" className={`text-lg font-medium py-2 ${getActiveClass('/report-updates')}`} onClick={() => setOpen(false)}>Check Report Update</Link>
                <Link href="/adminlogin" className="text-lg font-medium py-2 flex items-center text-gray-800 hover:text-lime-600" onClick={() => setOpen(false)}>
                    <FiLogIn className="mr-2" /> Login
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
            ? 'text-lime-400 border-b-4 border-white font-semibold' 
            : 'text-white hover:text-lime-300'; 

    return (
        <nav className="flex filter drop-shadow-md px-4 py-4 h-20 items-center bg-gradient-to-r from-green-800 to-lime-600 text-white">
            <MobileNav open={open} setOpen={setOpen} pathname={pathname} />
            <div className="w-3/12 flex ml-2 items-center">
                <Link href="/" className="text-2xl font-semibold">
                    TCMC
                </Link>
            </div>
            <div className="w-9/12 flex justify-end items-center">
                <div className="z-50 flex relative w-8 h-8 flex-col justify-between items-center md:hidden text-gray-900" onClick={() => setOpen(!open)}>
                    {/* Hamburger button */}
                    <span className={`h-1 w-full bg-gray-900 rounded-lg transform transition duration-300 ease-in-out ${open ? "rotate-45 translate-y-3.5" : ""}`} />
                    <span className={`h-1 w-full bg-gray-900 rounded-lg transition-all duration-300 ease-in-out ${open ? "w-0" : "w-full"}`} />
                    <span className={`h-1 w-full bg-gray-900 rounded-lg transform transition duration-300 ease-in-out ${open ? "-rotate-45 -translate-y-3.5" : ""}`} />
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

                    <Link href="/adminlogin" className="text-white mx-4 hover:text-lime-300">
                        <FiLogIn size={25} />
                    </Link>
                </div>
            </div>
        </nav>
    );
}
