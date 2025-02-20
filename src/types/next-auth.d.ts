import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string; // ✅ Add accessToken
    } & DefaultSession["user"]; // ✅ Ensure compatibility with NextAuth defaults
  }

  interface JWT {
    access_token?: string; // ✅ Ensure access_token exists in JWT
  }
}
