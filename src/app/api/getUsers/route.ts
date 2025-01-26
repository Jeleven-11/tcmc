// pages/api/getUsers.js
import db from '../../lib/db'; // Adjust this path as needed
import { NextRequest, NextResponse } from 'next/server';
export default async function handler(req: NextRequest, res: NextResponse) {
  if (req.method === 'GET') {
    try {
        const query: string = 
        `   SELECT 
            user_id,
            username,
            password,
            name,
            role,
            contact_num                  
                FROM 
            users `;
        // Fetch users and their associated profile information
        const [users] = await db.query(query);

      NextResponse.json(users, {status: 200});
    } catch (error) {
      console.error('Database error:', error);
      NextResponse.json({ error: 'Database error' }, {status: 500});
    }
  } else {
    return new NextResponse('Method Not Allowed', { status: 405, headers: { 'Allow': 'GET' } });
  }
}
