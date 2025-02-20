// /pages/api/getReports.js
import pool from '../../lib/db'; // Adjust path if needed
// import { FieldPacket, ResultSetHeader } from 'mysql2';
import { NextResponse, NextRequest } from 'next/server';


export async function GET(req: NextRequest) {
  let conn;
  try {
    conn = await pool.getConnection();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = 'SELECT * FROM reports';
    const params: string[] = [];

    if (status) {
      query += ' WHERE LOWER(status) = LOWER(?)'; // Ensure case insensitivity
      params.push(status);
    }

    const [rows] = await conn.query(query, params);

    console.log(`🔹 Executed Query: ${query} with params:`, params);
    console.log("🔹 Query Result:", rows);

    return NextResponse.json({ reports: rows }, { status: 200 });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ message: 'Error fetching reports' }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
