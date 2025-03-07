import { FieldPacket } from 'mysql2';
import pool from '../../../lib/db'; // Correct import for the pool
import { NextResponse } from 'next/server';

interface ReportCount
{
  total_count: number;
  unread_count: number; 
  dropped_count: number;
  on_investigation_count: number;
  solved_count: number;
}

export async function GET() {
  try {
    const query: string = `
      SELECT 
        COUNT(*) AS total_count,
        SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) AS unread_count,
        SUM(CASE WHEN status = 'on_investigation' THEN 1 ELSE 0 END) AS on_investigation_count,
        SUM(CASE WHEN status = 'dropped' THEN 1 ELSE 0 END) AS dropped_count,
        SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) AS solved_count
      FROM reports
    `;
    // Get connection to the database pool
    const connection = await pool.getConnection();
    // Run the query using the pool
    const [rows]: [ReportCount[], FieldPacket[]] = await connection.query(query) as [ReportCount[], FieldPacket[]];
   
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: 'No data returned from query' }, {status: 500});
    }

    const { total_count, unread_count, on_investigation_count, dropped_count, solved_count }: ReportCount = rows[0];
    connection.release();
    return NextResponse.json({
        total: total_count,
        unread: unread_count,
        on_investigation: on_investigation_count,
        dropped: dropped_count,
        solved: solved_count
    }, {
        status:200
    });
  } catch (error) {
    console.error('Error in report counter API:', error);
    return NextResponse.json({ message: `Error fetching report counts: ${error}` }, {status: 500});
  }
}
