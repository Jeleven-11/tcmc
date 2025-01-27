// /pages/api/getReports.js
import pool from '../../lib/db'; // Adjust path if needed
// import { FieldPacket, ResultSetHeader } from 'mysql2';
import { NextResponse } from 'next/server';
export async function GET() {
  try {
    // Get connection to the database pool
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM reports');
    connection.release();
    return NextResponse.json({ reports: rows }, {status: 200});
  } catch (error) {
    console.error('Error fetching reports: ', error);
    return NextResponse.json({ message: 'Error fetching reports' }, { status: 500});
  }
}
