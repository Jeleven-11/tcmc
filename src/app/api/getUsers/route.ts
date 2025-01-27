// pages/api/getUsers.js
import pool from '../../lib/db'; // Adjust this path as needed
import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
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
        // Get connection to the database pool
        const connection = await pool.getConnection();
        // Fetch users and their associated profile information
        const [users] = await connection.query(query);
        connection.release();
      return NextResponse.json(users, {status: 200});
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: `Database error: ${error}` }, {status: 500});
    }
  } else {
    return new NextResponse('Method Not Allowed', { status: 405, headers: { 'Allow': 'GET' } });
  }
}
