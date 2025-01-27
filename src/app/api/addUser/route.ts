import pool from '../../lib/db';
import bcrypt from 'bcryptjs';
import { FieldPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

interface newUser {
  id?: string
  username: string;
  name: string;
  role: string;
  contactNum?: string;
  password?: string;
  user_id?: string;
}

export async function POST(req: NextRequest) {
  if (req.method === 'POST') {
    const { username, name, role, contactNum, password }: newUser = await req.json();

    // Validate input data
    if (!username || !name || !role || !contactNum || !password) {
      return NextResponse.json({ error: 'All fields are required' }, {status:400});
    }

    try {
      // Log the incoming data for debugging
      console.log('Received data:', { username, name, role, contactNum, password });

      // Hash the password before saving it
      const hashedPassword: string = await bcrypt.hash(password, 10);

      console.log('Hashed password:', hashedPassword);
      const connection = await pool.getConnection();
      // Insert new user into the database
      const [result]: [newUser[], FieldPacket[]] = await connection.query(
        'INSERT INTO users (username, name, role, contact_num, password) VALUES (?, ?, ?, ?, ?)',
        [username, name, role, contactNum, hashedPassword]
      ) as [newUser[], FieldPacket[]];

      console.log('Database result:', result);
      connection.release();
      // Return success response
      return NextResponse.json({ message: 'User added successfully', user: { username, name, role, contactNum, password }
      }, {status: 200});
    } catch (error) {
      console.error('Error adding user:', error);
      return NextResponse.json({ error: `Failed to add user: ${error}` }, {status: 500});
    }
  } else {
    // Handle unsupported request methods
    return NextResponse.json({ error: 'Method not allowed' }, {status: 405});
  }
};