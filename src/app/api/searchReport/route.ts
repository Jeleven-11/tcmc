import pool from '../../lib/db';
import { FieldPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// Define a type for the report data
interface Report {
  reportID: number;
  fullName: string;
  contactNumber: string;
  createdAt: string;
  vehicleType: string;
  platenumber: string;
  color: string;
  description: string;
  reason: string;
  status: string;
}

export async function GET(req: NextRequest)
{
  const query = req.nextUrl.searchParams.get("query");
  if (!query || query.trim() === '')
    return NextResponse.json({ error: 'Query parameter is required!' }, {status: 400})

  let conn
  try
  {
    conn = await pool.getConnection()
    const [results]: [Report[], FieldPacket[]] = await conn.query(
      `SELECT reportID, fullName, contactNumber, createdAt, vehicleType, platenumber, color, description, reason, status
      FROM reports
      WHERE reportID LIKE ? OR fullName LIKE ? OR contactNumber LIKE ? OR platenumber LIKE ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    ) as [Report[], FieldPacket[]]
    if (results.length === 0)
      return NextResponse.json({ error: 'No reports found' }, {status: 404})

    return NextResponse.json({ reports: results }, {status: 200})
  } catch (error) {
    console.error('Database query error:', error)
    return NextResponse.json({ error: 'An error occurred while fetching the reports' }, {status: 500})
  } finally {

    if (conn)
      conn.release()
  }
}