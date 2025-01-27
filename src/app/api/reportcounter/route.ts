import { FieldPacket } from 'mysql2';
import pool from '../../lib/db'; // Correct import for the pool
import { NextResponse } from 'next/server';

interface ReportCount {
    total_count: number;
    pending_count: number; 
    accepted_count: number;
    dropped_count: number;
    solved_count: number;
  }

export async function GET() {
  try {
    const query: string = `
      SELECT 
        COUNT(*) AS total_count,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) AS accepted_count,
        SUM(CASE WHEN status = 'dropped' THEN 1 ELSE 0 END) AS dropped_count,
        SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) AS solved_count
      FROM reports
    `;

    // Run the query using the pool
    const [rows]: [ReportCount[], FieldPacket[]] = await pool.query(query) as [ReportCount[], FieldPacket[]];
   
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: 'No data returned from query' }, {status: 500});
    }

    const { total_count, pending_count, accepted_count, dropped_count, solved_count }: ReportCount = rows[0];
    pool.end();
    return NextResponse.json({
        total: total_count,
        pending: pending_count,
        accepted: accepted_count,
        dropped: dropped_count,
        solved: solved_count
    }, {
        status:200
    });
  } catch (error) {
    pool.end();
    console.error('Error in report counter API:', error);
    return NextResponse.json({ message: `Error fetching report counts: ${error}` }, {status: 500});
  }
}
