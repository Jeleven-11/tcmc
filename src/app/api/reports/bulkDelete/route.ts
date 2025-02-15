import pool  from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { FieldPacket, ResultSetHeader } from 'mysql2';

export async function POST(req:NextRequest) 
{
    if (req.method === 'POST')
    {
        const { ids  } = await req.json()
        console.log(ids)

        if (!Array.isArray(ids) || ids.length === 0)
            return NextResponse.json({ error: 'Invalid or empty ID list!' }, { status: 400 })

        let conn = null
        try
        {
            conn = await pool.getConnection()
            const [result]: [ResultSetHeader, FieldPacket[]] = await conn.query(`DELETE FROM reports WHERE reportID IN (${ids.map(() => '?').join(', ')})`, ids)
            // const [result]: [ResultSetHeader, FieldPacket[]] = await conn.query('DELETE FROM reports WHERE reportID = ?', [id]) as [ResultSetHeader, FieldPacket[]];
            if (result.affectedRows === 0)
                return NextResponse.json({ error: 'Report not found' } , { status: 404 })

            return NextResponse.json({ message: 'Report deleted successfully' } , { status: 200 })
        } catch (error) {
            console.error('Error deleting report:', error)
            return NextResponse.json({ error: 'Failed to delete report' } , { status: 500 })
        } finally {

            if (conn)
                conn.release()
        }
    } else {
        return NextResponse.json({ error: 'Method not allowed' } ,{ status: 405 })
    }
}

export const dynamic = 'force-dynamic'