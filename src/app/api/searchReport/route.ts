import pool from '../../lib/db';
import { FieldPacket, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';

// Define a type for the report data
interface Report {
  reportID: number;
  fullName: string;
  contactNumber: string;
  createdAt: Date;
  vehicleType: string;
  platenumber: string;
  color: string;
  description: string;
  reason: string;
  status: string;
}

export default async function handler(req: NextRequest) {
  const { query } = await req.json();

  if (typeof query !== 'string' || query.trim() === '') {
    return NextResponse.json({ error: 'Query parameter is required' }, {status: 400});
  }

  try {
    const [results]: [RowDataPacket[], FieldPacket[]] = await pool.query(
      `SELECT reportID, fullName, contactNumber, createdAt, vehicleType, platenumber, color, description, reason, status
      FROM reports
      WHERE reportID LIKE ? OR fullName LIKE ? OR contactNumber LIKE ? OR platenumber LIKE ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );

    if (results.length === 0) {
      return NextResponse.json({ error: 'No reports found' }, {status: 404});
    }

    NextResponse.json({ reports: results }, {status: 200});
  } catch (error) {
    console.error('Database query error:', error);
    NextResponse.json({ error: 'An error occurred while fetching the reports' }, {status: 500});
  }
}