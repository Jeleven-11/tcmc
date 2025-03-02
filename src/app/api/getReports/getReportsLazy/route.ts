import { NextRequest, NextResponse } from 'next/server';
import { FieldPacket } from 'mysql2';
import pool from '@/app/lib/db'; // Your database connection
import { getSession } from '@/app/lib/actions';
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

        if (search && !search.match(/^[a-zA-Z0-9_.-\s]*$/)) 
            return NextResponse.json({ data: [], total: 0 }, { status: 400 });
        
        const session = await getSession();
        console.log("TEAM:", session.team); // Debugging
        
        let whereClause = ''; 
        const queryParams: (string | number)[] = [];
        
        if (session.team === 0) {
            whereClause = `WHERE status = ?`;
            queryParams.push('unread');
        } else {
            whereClause = `WHERE status IN (?, ?, ?)`;
            queryParams.push('on_investigation', 'dropped', 'solved');
        }
        
        if (search) {
            whereClause += ` AND (reportID LIKE ? OR vehicleType LIKE ? OR address LIKE ? OR platenumber LIKE ? OR reason LIKE ? OR color LIKE ? OR fullName LIKE ? OR description LIKE ? OR contactNumber LIKE ?)`;
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        queryParams.push(pageSize, offset); // Always add pagination at the end
        
        const reports = await connection.query(
            `SELECT * FROM reports ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
            queryParams
        );
        
        const countParams = queryParams.slice(0, -2); // Exclude pagination for COUNT query
        const total: [Counter[], FieldPacket[]] = await connection.query(
            `SELECT COUNT(*) as count FROM reports ${whereClause}`,
            countParams
        ) as [Counter[], FieldPacket[]];
        
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