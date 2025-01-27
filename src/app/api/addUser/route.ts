import pool from '../../lib/db';
import bcrypt from 'bcryptjs';
import { FieldPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

interface newUser {
    username: string;
    name: string;
    role: string; 
    contactNumber: string;
    password: string;
}

export async function POST(req: NextRequest) {
  if (req.method === 'POST') {
    const { username, name, role, contactNumber, password }: newUser = await req.json();

    // Validate input data
    if (!username || !name || !role || !contactNumber || !password) {
      return NextResponse.json({ error: 'All fields are required' }, {status:400});
    }

    try {
      // Log the incoming data for debugging
      console.log('Received data:', { username, name, role, contactNumber, password });

      // Hash the password before saving it
      const hashedPassword: string = await bcrypt.hash(password, 10);

      console.log('Hashed password:', hashedPassword);

      // Insert new user into the database
      const [result]: [newUser[], FieldPacket[]] = await pool.query(
        'INSERT INTO users (username, name, role, contact_num, password) VALUES (?, ?, ?, ?, ?)',
        [username, name, role, contactNumber, hashedPassword]
      ) as [newUser[], FieldPacket[]];

      console.log('Database result:', result);
      pool.end();
      // Return success response
      return NextResponse.json({ message: 'User added successfully'}, {status: 200});
    } catch (error) {
      console.error('Error adding user:', error);
      pool.end();
      return NextResponse.json({ error: `Failed to add user: ${error}` }, {status: 500});
    }
  } else {
    pool.end();
    // Handle unsupported request methods
    return NextResponse.json({ error: 'Method not allowed' }, {status: 405});
  }
};