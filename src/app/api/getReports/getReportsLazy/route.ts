import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db'; // Your database connection

export async function GET(req: NextRequest)
{
    try
    {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1', 10)
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
        const offset = (page - 1) * pageSize

        const reports = await query(`SELECT * FROM reports ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [pageSize, offset])
        const total = await query(`SELECT COUNT(*) as count FROM reports`, []) as { count: number }[]
        if (!total)
            return new Response('No reports found', { status: 404 })

        return NextResponse.json({ data: reports, total: total[0].count })
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}