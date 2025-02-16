import { FieldPacket, ResultSetHeader } from 'mysql2';
import pool from '../../lib/db'; // Adjust this path as needed
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json(); // Ensure `id` is correctly extracted
    console.log('Received ID:', userId);

    if (!userId)
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const connection = await pool.getConnection();

    // Check if the user exists before attempting deletion
    const [userExists]: [ResultSetHeader, FieldPacket[]] = await connection.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    console.log('User Exists:', userExists);

    if (userExists.affectedRows === 0) {
      connection.release();
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Proceed to delete the user
    const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query('DELETE FROM users WHERE user_id = ?', [userId]);
    connection.release();

    console.log('Delete Result:', result);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
