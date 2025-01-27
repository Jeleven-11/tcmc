import { FieldPacket, ResultSetHeader } from 'mysql2';
import pool from '../../lib/db'; // Adjust this path as needed
import { NextRequest, NextResponse } from 'next/server';
import { ParsedUrlQuery } from 'querystring';
// import { stat } from 'fs';

export async function DELETE(req: NextRequest) {
  if (req.method === 'DELETE') {
    const { id } : ParsedUrlQuery= await req.json(); // Type cast for query params

    if (!id || typeof id !== 'string') {  // Ensure `id` is a string
      return NextResponse.json({ error: 'User ID is required' }, {status: 400});
    }

    try {
      // Get connection to the database pool
      const connection = await pool.getConnection();
      // Get the result and metadata
      const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query('DELETE FROM users WHERE user_id = ?', [id]);
      connection.release();
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: 'User not found' }, {status: 404});
      }
      NextResponse.json({ message: 'User deleted successfully' }, {status: 200});
    } catch (error) {
      console.error('Database error:', error);
      NextResponse.json({ error: 'Database error' }, {status: 500});
    }
  } else {
    return new NextResponse('Method Not Allowed', { status: 405, headers: { 'Allow': 'DELETE' } });
  }
}