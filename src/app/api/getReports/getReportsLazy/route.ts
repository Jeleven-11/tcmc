import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db'; // Your database connection
import { getSession } from '@/app/lib/actions';

export async function GET(req: NextRequest)
{
    try
    {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1', 10)
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
        const search = searchParams.get('search') || ''
        const team = Number(searchParams.get('t') || 0)
        const offset = (page - 1) * pageSize

        const session = await getSession()

        console.log("TEAM:", team)

        let whereClause = ''
        let queryParams: (string | number)[] = [pageSize, offset]
        if (search) {
            whereClause = `WHERE (fullName LIKE ? OR description LIKE ? OR contactNumber LIKE ?) AND team = ?`
            queryParams = [`%${search}%`, `%${search}%`, `%${search}%`, Number(session.team), ...queryParams]
        }

        const reports = await query(`SELECT * FROM reports ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, queryParams)
        const total = await query(`SELECT COUNT(*) as count FROM reports ${whereClause}`, queryParams.slice(0, -2)) as { count: number }[]

        // const reports = await query(`SELECT * FROM reports ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [pageSize, offset])
        // const total = await query(`SELECT COUNT(*) as count FROM reports`, []) as { count: number }[]
        if (!total)
            return new Response('No reports found', { status: 404 })

        return NextResponse.json({ data: reports, total: total[0].count })
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}