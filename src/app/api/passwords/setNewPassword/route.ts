import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, FieldPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import pool from '@/app/lib/db';
export async function POST(req: NextRequest){
    let connection;
    try {
        const { password, email } = await req.json();
        if (!password || !email) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }
        console.log('Password: ', password)
        console.log("Email: ", email)


        connection = await pool.getConnection();
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateQuery = "UPDATE users SET password=? WHERE email=?"
        const values = [hashedPassword, email]
        const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query(updateQuery, values) as [ResultSetHeader, FieldPacket[]]
        if (result.affectedRows === 0)
            return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
        return NextResponse.json({ success: true, message: "Password have been reset successfully" }, {status: 200})
    } catch (error) {
        return NextResponse.json({message: String(error)}, {status: 400});
    } finally {
        if(connection) connection.release();
    }

}