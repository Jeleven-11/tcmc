import { SessionOptions } from "iron-session";

export interface SessionData {
    id?: string
    username?: string;
    name?: string;
    role?: string;
    team?: string;
    contact_num?: string;
    user_id?: string;
    email?: string;
    emailVerified?: boolean;
    isLoggedIn: boolean;
    authToken: string;
    sessionID: string
  }
  
  export const defaultSession: SessionData = {
    isLoggedIn: false,
    authToken: "",
    sessionID: ""
  };
  
  export const sessionOptions: SessionOptions = {
    // You need to create a secret key at least 32 characters long.
    password: process.env.AUTH_SECRETKEY!,
    cookieName: "admin-mctc-session",
    cookieOptions: {
      httpOnly: true,
      // Secure only works in `https` environments. So if the environment is `https`, it'll return true.
      secure: process.env.NODE_ENV === "production",
    },
    ttl: 7 * 24 * 60 * 60, // 7 days
}  