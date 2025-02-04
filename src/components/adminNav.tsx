"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";
// import { signOut } from "next-auth/react";
import { logout } from "@/app/lib/actions";
function NavButton({
    onClick = () => {},
    children,
    className = "",
}: {
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <button
            className={`mx-4 text-xl font-normal bg-transparent border-none cursor-pointer ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

function MobileNav({
    open,
    setOpen,
    pathname,
}: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    pathname: string;
}) {
    interface GetActiveClassProps {
        path: string;
    }

    const getActiveClass = ({ path }: GetActiveClassProps): string =>
        pathname === path
            ? "text-blue-600 border-b-4 border-blue-600" // Active style
            : "text-gray-800 hover:text-blue-600"; // Default style

            {/* added signout handler */}
            const handleSignOut = async () => {
                await logout(); // Prevent automatic redirect from signOut
            };
        

    return (
        <div
            className={`absolute top-0 left-0 h-screen w-screen bg-white transform ${
                open ? "-translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out filter drop-shadow-md`}
        >
            <div className="flex items-center justify-center ml-6 filter drop-shadow-md bg-white h-20">
                <Link href="/admin" className="text-xl font-semibold">
                    TCMC
                </Link>
            </div>
            <div className="flex flex-col ml-4">
                <Link
                    href="/admin"
                    className={`text-xl font-medium my-4 ${getActiveClass({
                        path: "/admin"
                    })}`}
                    onClick={() => setTimeout(() => setOpen(!open), 100)}
                >
                    Home
                </Link>

                <Link
                    href="/admin/userManagement"
                    className={`text-xl font-medium my-4 ${getActiveClass({
                        path: "/admin/userManagement"
                    })}`}
                    onClick={() => setTimeout(() => setOpen(!open), 100)}
                >
                    User Management
                </Link>

                <Link
                    href="/admin/watchlist"
                    className={`text-xl font-medium my-4 ${getActiveClass({
                        path: "/admin/watchlist"
                    })}`}
                    onClick={() => setTimeout(() => setOpen(!open), 100)}
                >
                    Report Management
                </Link>

{/* added logged user's profile for mobile*/}
                <Link
                    href="/admin/profile"
                    className={`text-xl font-medium my-4 ${getActiveClass({
                        path: "/admin/profile"
                    })}`}
                    onClick={() => setTimeout(() => setOpen(!open), 100)}
                >
                    My Profile
                </Link>

                {/* added signout button for mobile*/}
                <button
                                onClick={handleSignOut}
                                className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left"
                            >
                              <FaSignOutAlt size={20} />  Sign Out
                            </button>
            </div>
        </div>
    );
}

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const pathname = usePathname();

    interface GetActiveClassProps {
        path: string;
    }

    const getActiveClass = ({ path }: GetActiveClassProps): string =>
        pathname === path
            ? "text-blue-600 border-b-4 border-blue-600" // Active style
            : "text-gray-800 hover:text-blue-600"; // Default style

    const handleSignOut = async () => {
        await logout(); // Prevent automatic redirect from signOut
    };

    return (
        <nav className="flex filter drop-shadow-md px-4 py-4 h-20 items-center bg-gradient-to-r from-blue-900 to-blue-600 text-white">
            <MobileNav open={open} setOpen={setOpen} pathname={pathname} />
            <div className="w-3/12 flex ml-2 items-center">
                <Link href="/" className="text-2xl font-semibold">
                    TCMC
                </Link>
            </div>
            <div className="w-9/12 flex justify-end items-center">
                <div
                    className="z-50 flex relative w-8 h-8 flex-col justify-between items-center md:hidden"
                    onClick={() => setOpen(!open)}
                >
                    {/* Hamburger button */}
                    <span
                        className={`h-1 w-full bg-black rounded-lg transform transition duration-300 ease-in-out ${
                            open ? "rotate-45 translate-y-3.5" : ""
                        }`}
                    />
                    <span
                        className={`h-1 w-full bg-black rounded-lg transition-all duration-300 ease-in-out ${
                            open ? "w-0" : "w-full"
                        }`}
                    />
                    <span
                        className={`h-1 w-full bg-black rounded-lg transform transition duration-300 ease-in-out ${
                            open ? "-rotate-45 -translate-y-3.5" : ""
                        }`}
                    />
                </div>

                <div className="hidden md:flex items-center space-x-4">
                    <Link
                        href="/admin"
                        className={`mx-4 text-white text-lg ${getActiveClass({ path: "/admin" })}`}
                    >
                        HOME
                    </Link>

                    <Link
                        href="/admin/userManagement"
                        className={`mx-4 text-white text-lg ${getActiveClass({
                            path: "/admin/userManagement"
                        })}`}
                    >
                        USER MANAGEMENT
                    </Link>

                    <Link
                        href="/admin/watchlist"
                        className={`mx-4 text-white text-lg ${getActiveClass({
                            path: "/admin/watchlist"
                        })}`}
                    >
                        REPORT MANAGEMENT
                    </Link>

                    {/* Profile Icon */}
                    <div className="relative">
                        <NavButton
                            onClick={() => setProfileOpen((prev) => !prev)}
                            className="mx-4"
                        >
                            PROFILE
                        </NavButton>
                        <div
                            className={`absolute top-full left-0 mt-2 bg-white shadow-lg p-2 ${
                                profileOpen ? "block" : "hidden"
                            }`}
                        >
                            <Link
                                href="/admin/profile"
                                className="block py-2 px-4 text-gray-800 hover:bg-gray-100"
                            >
                                Profile
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="block px-4 py-2 text-gray-800 hover:bg-gray-200 w-full text-left"
                            >
                              <FaSignOutAlt size={20} />  Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
