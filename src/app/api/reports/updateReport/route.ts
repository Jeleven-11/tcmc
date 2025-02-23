import pool from "@/app/lib/db"
import { FieldPacket, ResultSetHeader } from "mysql2"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic' 

export async function POST(res : Request)
{
    const { remark, reportID  } = await res.json()
    // if (!remark)
    //     return NextResponse.json({ error: 'Invalid remark' }, {status: 400})

    let conn  = null
    try
    {
        conn = await pool.getConnection()

        const [results]: [ResultSetHeader, FieldPacket[]] = await conn.query('UPDATE reports SET remarks = ?, updatedAt = NOW() WHERE reportID = ?', [remark, reportID]) as [ResultSetHeader, FieldPacket[]]
        if (results.affectedRows === 0)
            return NextResponse.json({ error: 'Failed to update report' }, {status: 500})

        return NextResponse.json({ remark }, {status: 200})
    } catch (error) {
        console.error('Error updating report:', error)
        return NextResponse.json({ error: 'Failed to update report' }, {status: 500})
    } finally {

        if (conn)
            conn.release()
    }
}
