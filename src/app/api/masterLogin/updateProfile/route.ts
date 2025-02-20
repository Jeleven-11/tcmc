import pool from "@/app/lib/db";
import { NextResponse } from "next/server";
import { getSession } from '@/app/lib/actions';
import { ResultSetHeader, FieldPacket } from "mysql2";

export async function POST(req: Request)
{
  try
  {
    const { name, contact_num, team, email } = await req.json()
    if (!name || !contact_num)
        return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 })

    const session = await getSession()
    console.log(session)
    if (!session || !session.isLoggedIn)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query("UPDATE users SET name=?, contact_num=?, team=?, email=? WHERE user_id=?", [name, contact_num, team, email, session.user_id])
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