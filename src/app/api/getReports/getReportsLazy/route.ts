import { NextRequest, NextResponse } from 'next/server';
import { FieldPacket } from 'mysql2';
import pool from '@/app/lib/db'; // Your database connection
interface Counter {
    count: number
}
export async function GET(req: NextRequest)
{
    try
    {
        const connection = await pool.getConnection();
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1', 10)
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
        const search = searchParams.get('search') || ''
        // const team = Number(searchParams.get('t') || 0)
        const offset = (page - 1) * pageSize

        if (!search.match('^[a-zA-Z0-9_.-]*$') && search !== '')
            return NextResponse.json({ data: [], total: 0 }, { status: 400 })

        // const session = await getSession()

        // console.log("TEAM:", session)

        let whereClause = ''
        let queryParams: (string | number)[] = [pageSize, offset]
        if (search) {
            whereClause = `WHERE (fullName LIKE ? OR description LIKE ? OR contactNumber LIKE ?)`
            queryParams = [`%${search}%`, `%${search}%`, `%${search}%`, ...queryParams]
        }

        const reports = await connection.query(`SELECT * FROM reports ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, queryParams)
        const total:[Counter[], FieldPacket[]] = await connection.query(`SELECT COUNT(*) as count FROM reports ${whereClause}`, queryParams.slice(0, -2)) as [Counter[], FieldPacket[]]
        connection.release();
        // const reports = await query(`SELECT * FROM reports ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [pageSize, offset])
        // const total = await query(`SELECT COUNT(*) as count FROM reports`, []) as { count: number }[]
        if (!total)
            return new Response('No reports found', { status: 404 })
        return NextResponse.json({ data: reports[0], total: total[0][0].count })
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}