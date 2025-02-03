import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
// import { getSession } from "./app/lib/actions";

// import jsrsasign from 'jsrsasign';

export async function middleware(request: NextRequest)
{
//   const session = await getSession()
  const { pathname } = request.nextUrl
  console.log("path:", pathname)
  // if (pathname.startsWith("/admin") && session.authToken !== "")
  // {
    /*interface Token {
      id: number
      username: string
      name: string
      role: string
      contact_num: string
      password: string
      user_id: number
      email: string
      iat: number
      exp: number
    }*/
    //const asd = isVerified ? jsrsasign.KJUR.jws.JWS.parse(session.authToken).payloadObj as Token : null
    //const asdasd = jsrsasign.KJUR.jws.JWS.parse(session.authToken).payloadObj as Token
    //console.log("WHATASD:", asd?.username)

    // const isVerified = jsrsasign.KJUR.jws.JWS.verifyJWT(session.authToken, process.env.AUTH_SECRETKEY!, { alg: ['HS256'] })
    // if (!isVerified)
    // {
    //   session.destroy()
    //   return NextResponse.redirect(new URL("/adminlogin", request.url))
    // }
  // }

  // continue requests
  return NextResponse.next()
}

export const config = {
  //matcher: ["/((?!api|_next/static|_next/image|.*\\.(png|jpg|jpeg|svg|gif)).*)"],
  matcher: ["/admin/:path*"],
}