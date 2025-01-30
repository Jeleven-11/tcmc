import pool from '../../lib/db'; // Adjust this path as needed
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, FieldPacket } from 'mysql2';
interface UpdateUserRequestBody {
    username: string;
    password: string;
    name: string;
    role: string;
    contact_num: string; 
    email: string
}
export async function PUT(req: NextRequest) {
  if (req.method === 'PUT') {
    // Destructure name from req.json()
    const { username, password, name, role, contact_num, email}: UpdateUserRequestBody = await req.json();
    console.log("Received data:", { username, password, name, role, contact_num, email });
    try {
        // Get connection to the database pool
        const connection = await pool.getConnection();
        const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
            UPDATE users
            SET name = ?, password = ?, role = ?, contact_num = ?, email = ?
            WHERE username = ? LIMIT 1
        `, [name, password, role, contact_num, email, username]) as [ResultSetHeader, FieldPacket[]];
        console.log('Database result:', result.affectedRows); 
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'User updated successfully', data: {username, name, role, contact_num, email} }, {status: 200});
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Database error' }, {status: 500});
    }
  } else {
    return new NextResponse('Method Not Allowed', { status: 405, headers: { 'Allow': 'PUT' } });
  }
}
