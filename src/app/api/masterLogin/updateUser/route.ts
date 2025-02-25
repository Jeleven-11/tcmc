import pool from '../../../lib/db'; // Adjust this path as needed
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, FieldPacket } from 'mysql2';

interface UpdateUserRequestBody {
    username: string;
    currPassword: string;
    newPassword: string;
    password: string;
    name: string;
    team: number;
    contact_num: string; 
    email: string
}
export async function PUT(req: NextRequest)
{
  if (req.method === 'PUT') {
    // Destructure name from req.json()
    const { username, currPassword, newPassword, password, name, team, contact_num, email}: UpdateUserRequestBody = await req.json();
    console.log("Received data:", { username, password, newPassword, name, team, contact_num, email });

    if (currPassword === newPassword)
        return NextResponse.json({ message: 'New password must be different from current password' }, { status: 400 })

    // const hCurrPass = await bcrypt.hash(currPassword, 10);
    const asd = await bcrypt.compare(currPassword, password)
    if (!asd)
        return NextResponse.json({ message: 'Old password does not match with the current password' }, { status: 400 })

    const hPassword = await bcrypt.hash(newPassword, 10);

    try {
        // Get connection to the database pool
        const connection = await pool.getConnection();
        const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(`
            UPDATE users
            SET name = ?, password = ?, team = ?, contact_num = ?, email = ?
            WHERE username = ? LIMIT 1
        `, [name, hPassword, team, contact_num, email, username]) as [ResultSetHeader, FieldPacket[]];
        //console.log('Database result:', result.affectedRows); 
        if (result.affectedRows === 0)
            return NextResponse.json({ message: 'User not found' }, { status: 404 })

        return NextResponse.json({ message: 'User updated successfully', data: {username, name, team, hPassword, contact_num, email} }, {status: 200});
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: 'Database error' }, {status: 500});
    }
  } else {
    return new NextResponse('Method Not Allowed', { status: 405, headers: { 'Allow': 'PUT' } });
  }
}
