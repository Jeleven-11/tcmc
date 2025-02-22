import pool from "@/app/lib/db";
import { FieldPacket } from "mysql2";
import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';

interface Master
{
    master_id: number
    master_password: string
}

export async function POST(req: Request)
{
    if (req.method === 'POST')
    {
        let conn
        try
        {
            const { password } = await req.json()
            if (!password)
                return NextResponse.json({ error: 'Invalid username or password' }, {status: 400})

            conn = await pool.getConnection()
            const masterId = 1
            const [rows]: [Master[], FieldPacket[]] = await conn.query('SELECT * FROM master WHERE id = ?', [masterId]) as [Master[], FieldPacket[]]
            if (!rows)
                return NextResponse.json({ error: 'Invalid username or password' }, {status: 400})

            const isPassValid = await bcrypt.compare(password, rows[0].master_password)
            if (!isPassValid)
                return NextResponse.json({ error: 'Invalid username or password' }, {status: 401})

            // for updating the master password (comment all code above this line starting from const [rows])
            // const hashedPass = await bcrypt.hash(password, 10)
            // await conn.query('UPDATE master SET master_password = ? WHERE id = ?', [hashedPass, 1])

            return NextResponse.json({ success: 'Logged in' }, {status: 200})
        } catch (error) {
            console.error('Error logging in:', error)
            return NextResponse.json({ error: 'Failed to log in' }, {status: 500})
        } finally {

            if (conn)
                conn.release()
        }
    } else return NextResponse.json({ error: 'Method not allowed' }, {status: 405})
}

// export async function GET()
// {
//     let conn
//     try
//     {
//         conn = await pool.getConnection()
//         const hashedPass = await bcrypt.hash("123456", 10)
//         await conn.query('INSERT INTO master (master_password) VALUES (?)', [hashedPass])
//         return NextResponse.json({ message: 'ok' }, {status: 200})
//     } catch (error) {
//         console.error('Error logging in:', error)
//         return NextResponse.json({ error: 'Failed to log in' }, {status: 500})
//     } finally {

//         if (conn)
//             conn.release()
//     }
// }