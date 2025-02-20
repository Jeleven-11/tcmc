import { NextRequest, NextResponse } from 'next/server';
// import { getSession } from 'next-auth/react';
import { FieldPacket } from 'mysql2';
import pool from '../../lib/db';
// import { get, IncomingMessage } from 'http';
import { getSession } from '../../lib/actions';

// async function getSessionWithNextRequest(req: NextRequest) {
//   // Create a compatible request object
//   const compatibleReq: Partial<IncomingMessage> = {
//     headers: Object.fromEntries(req.headers.entries()),
//     method: req.method,
//     url: req.url,
//   };

//   // Fetch the session using the compatible request object
//   const session = await getSession();

//   return session;
// }
interface User {
  id?: string
  username: string;
  name: string;
  contact_num?: string;
  password?: string;
  user_id?: string;
  email?: string;
  emailVerified?: boolean;
}

export async function GET(req: NextRequest) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return NextResponse.json({ message: 'Method Not Allowed' }, {status: 405});
  }

  // Fetch the session to identify the logged-in user
  const session = await getSession();

  if (!session || !session.username || !session.isLoggedIn) {
    return NextResponse.json({ message: 'Unauthorized' }, {status: 401});
  }
  
  // const { username: string } = session.username;

  try {
    // Get connection to the database pool
    const connection = await pool.getConnection();
    const [user]: [User[], FieldPacket[]] = await connection.query(
      `SELECT name, contact_num FROM users WHERE username = ?`,
      [session.username]
    ) as [User[], FieldPacket[]];
    connection.release();
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, {status: 404});
    }
    return NextResponse.json(user, {status: 200});
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, {status: 500});
  }
}