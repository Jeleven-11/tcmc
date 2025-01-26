import db from '../../lib/db'; // Adjust this path to your actual database connection
import { FieldPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

interface User {
    role: string;
}

export default async function handler(req: NextRequest) {
  if (req.method === 'POST') {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    try {
      const [rows]: [User[], FieldPacket[]] = await db.query('SELECT role FROM users WHERE username = ?', [username]) as [User[], FieldPacket[]];

      if (rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      } else {
        return NextResponse.json({ role: rows[0].role }, { status: 200 });
      }
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  } else {
    return new NextResponse('Method Not Allowed', { status: 405, headers: { 'Allow': 'POST' } });
  }
}
