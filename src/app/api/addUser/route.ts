import pool from '../../lib/db';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

interface newUser {
    username: string;
    name: string;
    role: string; 
    contactNumber: string;
    password: string;
}

const handler = async (req: NextRequest, res: NextResponse) => {
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
      const [result]: any[] = await pool.query(
        'INSERT INTO users (username, name, role, contact_num, password) VALUES (?, ?, ?, ?, ?)',
        [username, name, role, contactNumber, hashedPassword]
      );

      console.log('Database result:', result);

      // Return success response
      return NextResponse.json({ message: 'User added successfully', userId: result.insertId }, {status: 200});
    } catch (error) {
      console.error('Error adding user:', error);
      return NextResponse.json({ error: 'Failed to add user' }, {status: 500});
    }
  } else {
    // Handle unsupported request methods
    return NextResponse.json({ error: 'Method not allowed' }, {status: 405});
  }
};

export default handler;