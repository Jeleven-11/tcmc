import db from '../../lib/db'; // Adjust this path as needed
import { NextRequest, NextResponse } from 'next/server';
import { FieldPacket, ResultSetHeader } from 'mysql2';
interface UpdateUserRequestBody {
    id: string;
    username: string;
    password: string;
    name: string;
    role: string;
    contactNum: string; 
}
export async function PUT(req: NextRequest) {
  if (req.method === 'PUT') {
    // Destructure name from req.json()
    const { id, username, password, name, role, contactNum }: UpdateUserRequestBody = await req.json();
    try {
        const [result]: [ResultSetHeader, FieldPacket[]] = await db.query(`
            UPDATE users
            SET username = ?, name = ?, password = ?, role = ?, contact_num = ?
            WHERE user_id = ?
        `, [username, name, password, role, contactNum, id]);

        if (result.affectedRows === 0) {
            db.end();
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ id, username, name, role, contactNum }, {status: 200});
    } catch (error) {
        db.end();
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Database error' }, {status: 500});
    }
  } else {
    return new NextResponse('Method Not Allowed', { status: 405, headers: { 'Allow': 'PUT' } });
  }
}
