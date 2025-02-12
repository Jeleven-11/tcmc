import pool from '../../lib/db';
import bcrypt from 'bcryptjs';
import { FieldPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

interface newUser {
  id?: string
  username: string;
  name: string;
  role: string;
  contact_num?: string;
  password?: string;
  user_id?: string;
  email?: string;
  emailVerified?: boolean;
}

export async function POST(req: NextRequest) {
  if (req.method === 'POST') {
    const { username, name, role, contact_num, password, email }: newUser = await req.json();

    // Validate input data
    if (!username || !name || !role || !contact_num || !password || !email) {
      return NextResponse.json({ error: 'All fields are required' }, {status:400});
    }

    try {
      // Log the incoming data for debugging
      console.log('Received data:', { username, name, role, contact_num, password, email });

      // Hash the password before saving it
      const hashedPassword: string = await bcrypt.hash(password, 10);

      console.log('Hashed password:', hashedPassword);
      const connection = await pool.getConnection();
      const checker: [newUser[], FieldPacket[]] = await connection.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      ) as [newUser[], FieldPacket[]];

      if (checker[0].length > 0) {
        connection.release();
        return NextResponse.json({ error: 'Username already exists' }, {status: 400});
      }
      // Insert new user into the database
      //const [result]: [newUser[], FieldPacket[]] = 
      await connection.query(
        'INSERT INTO users (username, name, role, contact_num, password, email, isEmailVerified, fcmToken) VALUES (?, ?, ?, ?, ?)',
        [username, name, role, contact_num, hashedPassword, email, 0, '']
      )// as [newUser[], FieldPacket[]];

      // console.log('Database result:', result);
      connection.release();
      // Return success response
      return NextResponse.json({ message: 'User added successfully', user: { username, name, role, contact_num, password, email }
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