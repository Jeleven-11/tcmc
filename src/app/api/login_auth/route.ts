"use server";
// import { AuthOptions } from 'next-auth';
// import NextAuth from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { query } from '../../lib/db';
import { FieldPacket } from 'mysql2'; 
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
// import { SessionData } from '../../lib/session';
// import { cookies } from 'next/headers';
// import { sessionOptions, defaultSession } from '../../lib/session';
// import { getIronSession } from "iron-session";
import { getSession } from '../../lib/actions';
// import { NextApiRequest } from 'next';
// import {SignJWT, jwtVerify} from 'jose'
// import { AdapterUser } from 'next-auth/adapters';

interface User {
  id?: string
  username: string;
  name: string;
  role: string;
  contact_num?: string;
  password?: string;
  user_id?: string;
  email?: string;
  emailVerified?: boolean;
}

function generateAuthToken(userData:User, remember:boolean=false) {
  const secretKey = process.env.AUTH_SECRETKEY;
  
  // Check if the AUTH_SECRETKEY environment variable is set
  if (!secretKey) {
    throw new Error('AUTH_SECRETKEY environment variable is not set');
  }
  
  // Extract relevant user data to include in the JWT payload
  const { id, username, name, role, contact_num, user_id }: User = userData;

  // Define the payload to be included in the token
  const payload = {
    id,
    username,
    name,
    role,
    contact_num,
    user_id
  };
  function getExpiryInSeconds(expiry: string): number {
    const num = parseInt(expiry.slice(0, -1), 10);
    const unit = expiry.slice(-1);
    switch (unit) {
      case 's':
        return num;
      case 'm':
        return num * 60;
      case 'h':
        return num * 60 * 60;
      case 'd':
        return num * 60 * 60 * 24;
      default:
        throw new Error(`Invalid expiry unit: ${unit}`);
    }
  }
  let tokenExpiry = '2d';
  if (remember)
      tokenExpiry = '14d'

  const expiryInSeconds = getExpiryInSeconds(tokenExpiry)
  const secretKeyBuffer = Buffer.from(secretKey, 'utf8')
  // Generate the token with the specified payload and secret key
  const token = jwt.sign(payload, secretKeyBuffer, { expiresIn: expiryInSeconds })
  console.log(`Generated a token that expires in ${tokenExpiry}`)
  return token;
}

export async function POST(req: NextRequest)
{
  if (req.method === "POST")
  {
    try
    {
      const { username, password } = await req.json();
      if (!username || !password)
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 })

      const column = (username.length > 0) && username.startsWith('0') ? 'contact_num' : 'username'
      const sqlQuery = `SELECT * FROM users WHERE ${column} = ? LIMIT 1`

      const queryValues = [username || "", password || ""].filter(Boolean)
      const rows: [User, FieldPacket[]] = await query(sqlQuery, queryValues) as [User, FieldPacket[]]
      if (!rows || !rows[0])
        return NextResponse.json({ message: 'User not found or invalid credentials' }, { status: 400 })

      //const data = JSON.parse(JSON.stringify(rows[0])) as User
      const data = rows[0]
      const isPassValid = await bcrypt.compare(password, data.password!)
      if (!isPassValid)
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 })
      const session = await getSession();
      if(session)
      {
        const userData = {
          id: data.id,
          username: data.username,
          name: data.name,
          role: data.role,
          contact_num: data.contact_num,
          password: '',//do not include the password
          user_id: data.user_id,
          email: data.email
        }
        const authToken = generateAuthToken(userData, true)
        session.isLoggedIn = true
        session.id = data.id
        session.username = data.username
        session.name = data.name
        session.role = data.role
        session.contact_num = data.contact_num
        session.user_id = data.user_id
        session.email = data.email
        session.emailVerified = data.emailVerified
        session.authToken = authToken
        session.sessionID = uuidv4().slice(0, 16).toUpperCase()
        await session.save()

        return NextResponse.json({ message: "Login successful", token: authToken }, { status: 200 })
      }
    } catch (error) {
      console.error('Database Error:', error)
      return NextResponse.json({ message: 'An error occurred while connecting to the satellite...' }, { status: 500 })
    }
  } else return NextResponse.json({ message: 'Invalid request method' }, { status: 405 })
}

// interface Token {
//     id: string;
//     role?: string;
//     username: string;
//     name?: string;
//     contact_num?: string;
//     emailVerified?: boolean
// }
// const authOptions: AuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         username: { label: 'Username', type: 'text' },
//         password: { label: 'Password', type: 'password' },
//         id: { label: 'ID', type: 'text' },
//         // role: { label: 'Role', type: 'text' },
//       },
//     async authorize(credentials):Promise<User | null> {
//         if (!credentials || !credentials.username || !credentials.password) {
//           throw new Error('Invalid credentials');
//         }
//         // Add your authentication logic here
//         const { username, password}: User = credentials;

//         const connection = await pool.getConnection();
//         try {
//           const [rows]: [User[], FieldPacket[]] = await connection.query('SELECT * FROM users WHERE username = ?', [username]) as [User[], FieldPacket[]];
      
//           if (rows.length === 0) {
//             throw new Error('Invalid username or password');
//           }
      
//           const user = rows[0];
//           const isPasswordValid = await bcrypt.compare(password, user.password);
      
//           if (!isPasswordValid) {
//             return null;
//           }
      
//           // Prevent cross-role logins
//         //   if (credentials.role === 'admin' && user.role !== 'admin') {
//         //     throw new Error('Only admins can access this page');
//         //   }
//         //   if (credentials.role === 'user' && user.role !== 'user') {
//         //     throw new Error('This account is not a user account');
//         //   }
      
//           return {
//             id: user.user_id,
//             username: user.username,
//             name: user.name,
//             role: user.role,
//             contact_num: user.contactNum,
//             password: '',//will not return the password, no need to return it.
//           } as User;
//         } finally {
//           connection.release();
//         }
//       }
//       ,
//     }),
//   ],
//   pages: {
//     signIn: '/admin',
//     signOut: '/',
//     error: '/error',
//   },
//   session: {
//     strategy: 'jwt',maxAge: 30 * 24 * 60 * 60, // Optional: Customize session duration
//     generateSessionToken: () => {
//       const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
//       const user = JSON.parse(sessionStorage.getItem('user') || '{}');
//       if (user?.role === 'admin') {
//         return `admin-session-${token}`;
//       }
//       return `user-session-${token}`;
//     },
//   },
  
// //   callbacks: {
// //     async jwt({ token, user }: {user: User | AdapterUser, token: Token}) {
// //       if (user && 'role' in user) {
// //         token.id = user.id;
// //         token.role = user.role;
// //         token.username = user.username; // Username for login reference
// //         token.name = user.name; // Actual name to display
// //         token.contact_num = user.contactNum;
// //         if ('emailVerified' in user) {
// //             token.emailVerified = user.emailVerified;
// //         }
// //       }
// //       return Promise.resolve(token);
// //     },
// //     async session({ session, token }) {
// //       if (token) {
// //         session.user = session.user ?? {};
// //         session.user.name = token.name; // Actual name for profile display
// //       }
// //       return session;
// //     },
// //   },
// };
// NextAuth(authOptions);