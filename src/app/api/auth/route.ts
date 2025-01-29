import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import pool from '../../lib/db';
import { FieldPacket } from 'mysql2';
// import { AdapterUser } from 'next-auth/adapters';

interface User {
    id: string
    username: string;
    name?: string;
    role?: string;
    contactNum?: string;
    password: string;
    user_id?: string;
    emailVerified?: boolean
}
// interface Token {
//     id: string;
//     role?: string;
//     username: string;
//     name?: string;
//     contact_num?: string;
//     emailVerified?: boolean
// }
export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        id: { label: 'ID', type: 'text' },
        // role: { label: 'Role', type: 'text' },
      },
    async authorize(credentials):Promise<User | null> {
        if (!credentials || !credentials.username || !credentials.password) {
          throw new Error('Invalid credentials');
        }
        // Add your authentication logic here
        const { username, password}: User = credentials;

        const connection = await pool.getConnection();
        try {
          const [rows]: [User[], FieldPacket[]] = await connection.query('SELECT * FROM users WHERE username = ?', [username]) as [User[], FieldPacket[]];
      
          if (rows.length === 0) {
            throw new Error('Invalid username or password');
          }
      
          const user = rows[0];
          const isPasswordValid = await bcrypt.compare(password, user.password);
      
          if (!isPasswordValid) {
            return null;
          }
      
          // Prevent cross-role logins
        //   if (credentials.role === 'admin' && user.role !== 'admin') {
        //     throw new Error('Only admins can access this page');
        //   }
        //   if (credentials.role === 'user' && user.role !== 'user') {
        //     throw new Error('This account is not a user account');
        //   }
      
          return {
            id: user.user_id,
            username: user.username,
            name: user.name,
            role: user.role,
            contact_num: user.contactNum,
            password: '',//will not return the password, no need to return it.
          } as User;
        } finally {
          connection.release();
        }
      }
      ,
    }),
  ],
  pages: {
    signIn: '/adminlogin',
    signOut: '/',
    error: '/error',
  },
  session: {
    strategy: 'jwt',maxAge: 30 * 24 * 60 * 60, // Optional: Customize session duration
    generateSessionToken: () => {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      if (user?.role === 'admin') {
        return `admin-session-${token}`;
      }
      return `user-session-${token}`;
    },
  },
  
//   callbacks: {
//     async jwt({ token, user }: {user: User | AdapterUser, token: Token}) {
//       if (user && 'role' in user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.username = user.username; // Username for login reference
//         token.name = user.name; // Actual name to display
//         token.contact_num = user.contactNum;
//         if ('emailVerified' in user) {
//             token.emailVerified = user.emailVerified;
//         }
//       }
//       return Promise.resolve(token);
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user = session.user ?? {};
//         session.user.name = token.name; // Actual name for profile display
//       }
//       return session;
//     },
//   },
});