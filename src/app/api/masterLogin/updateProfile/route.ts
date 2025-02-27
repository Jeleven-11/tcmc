import pool from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getSession } from '@/app/lib/actions';
import { ResultSetHeader, FieldPacket } from "mysql2";
import { User } from '@/app/lib/interfaces';
import bcrypt from 'bcryptjs';
export async function POST(req: Request)
{
  const connection = await pool.getConnection();
  try
  {
    const { name, contact_num, current_password, new_password, team, email } = await req.json()
    if (!name || !contact_num)
        return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 })

    const session = await getSession()
    console.log(session)
    if (!session || !session.isLoggedIn)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })


    const sqlQuery = `SELECT * FROM users WHERE name = ? AND contact_num = ? AND email = ? LIMIT 1`

    const [rows]: [User[], FieldPacket[]] = await connection.query(sqlQuery, [name, contact_num, email]) as [User[], FieldPacket[]];
    if (!rows || !rows[0])
      return NextResponse.json({ message: 'User not found!' }, { status: 400 })

    //const data = JSON.parse(JSON.stringify(rows[0])) as User
    const data = rows[0]
    const isPassValid = await bcrypt.compare(current_password, data.password)
    if (!isPassValid)
      NextResponse.json({message: 'Entered current password is incorrect!'})

    
    const hashedPassword: string = await bcrypt.hash(new_password, 10);


    const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query("UPDATE users SET name=?, contact_num=?, team=?, email=?, password =? WHERE user_id=?", [name, contact_num, team, email, hashedPassword, session.user_id]) as [ResultSetHeader, FieldPacket[]]
    if (result.affectedRows === 0)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })

    session.isLoggedIn = true
    session.name = name
    session.contact_num = contact_num
    session.team = team
    session.email = email
    await session.save()

    return NextResponse.json({ success: true, message: "Profile updated" })
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}