import { NextRequest, NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { FieldPacket } from 'mysql2';
import db from '../../lib/db';
import { IncomingMessage } from 'http';

async function getSessionWithNextRequest(req: NextRequest) {
  // Create a compatible request object
  const compatibleReq: Partial<IncomingMessage> = {
    headers: Object.fromEntries(req.headers.entries()),
    method: req.method,
    url: req.url,
  };

  // Fetch the session using the compatible request object
  const session = await getSession({ req: compatibleReq });

  return session;
}
interface User {
  name: string;
  contact_num: string;
}

export default async function handler(req: NextRequest) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return NextResponse.json({ message: 'Method Not Allowed' }, {status: 405});
  }

  // Fetch the session to identify the logged-in user
  const session = await getSessionWithNextRequest(req);

  if (!session || !session.user || !session.user.name) {
    return NextResponse.json({ message: 'Unauthorized' }, {status: 401});
  }
  
  const { name: username } = session.user;

  try {
    const [user]: [User[], FieldPacket[]] = await db.query(
      `SELECT name, contact_num FROM users WHERE username = ?`,
      [username]
    ) as [User[], FieldPacket[]];

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, {status: 404});
    }

    NextResponse.json(user, {status: 200});
  } catch (error) {
    console.error('Error fetching profile:', error);
    NextResponse.json({ message: 'Internal Server Error' }, {status: 500});
  }
}