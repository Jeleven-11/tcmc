import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive.readonly",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
    if (account) {
        token.accessToken = account.access_token;
        token.expiresAt = account.expires_at;
    }
    return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        session.user = {}; // ✅ Ensure session.user exists before modifying it
      }
      session.user.accessToken = typeof token.access_token === 'string' ? token.access_token : undefined; // ✅ Prevent TypeScript error
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
