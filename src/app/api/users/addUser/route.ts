import pool from '../../../lib/db';
import bcrypt from 'bcryptjs';
import { FieldPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';
import { User as newUser} from '@/app/lib/interfaces';
// interface newUser {
//   id?: string
//   username: string;
//   name: string;
//   team: number;
//   contact_num?: string;
//   password?: string;
//   user_id?: string;
//   email?: string;
//   emailVerified?: number;
//   fcmToken?: string
// }

export async function POST(req: NextRequest)
{
  // if (req.method === 'POST') {
    const { username, name, team, contact_num, password, email, emailVerified }: newUser = await req.json()
    // const emailVerified : newUser['emailVerified'] = false
    // const fcmToken: newUser['fcmToken'] = ''
    // Validate input data
    console.log('Received data:', { username, name, team, contact_num, password, email });

    if (!username || !name || !contact_num || !password || !email)
      return NextResponse.json({ error: 'All fields are required' }, {status:400})

    try {
      // Log the incoming data for debugging

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
        'INSERT INTO users (username, name, team, contact_num, password, email, isEmailVerified) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, name, team, contact_num, hashedPassword, email, emailVerified]
      )// as [newUser[], FieldPacket[]];

      // console.log('Database result:', result);
      connection.release();
      // Return success response
      return NextResponse.json({ message: 'User added successfully', user: { username, name, team, contact_num, password, email }
      }, {status: 200});
    } catch (error) {
      console.error('Error adding user:', error);
      return NextResponse.json({ error: `Failed to add user: ${error}` }, {status: 500});
    }
  // } else {
  //   // Handle unsupported request methods
  //   return NextResponse.json({ error: 'Method not allowed' }, {status: 405});
  // }
}