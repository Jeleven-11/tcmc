import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export function middleware(request: NextRequest)
{
  const currentUser = request.cookies.get("currentUser")?.value // get current user from cookies
  const { pathname } = request.nextUrl
  console.log(pathname)
  console.log(currentUser)

  // if accessing admin dashboard and wla nag logged in, redirect to login
  if (pathname.startsWith("/admin") && !currentUser)
    return NextResponse.redirect(new URL("/login", request.url))

  // continue requests
  return NextResponse.next();
}

export const config = {
  //matcher: ["/((?!api|_next/static|_next/image|.*\\.(png|jpg|jpeg|svg|gif)).*)"],
  matcher: ["/admin:path*"],
};