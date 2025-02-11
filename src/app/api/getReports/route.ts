// /pages/api/getReports.js
import pool from '../../lib/db'; // Adjust path if needed
// import { FieldPacket, ResultSetHeader } from 'mysql2';
import { NextResponse } from 'next/server';
export async function GET()
{
  let conn
  try
  {
    conn = await pool.getConnection()
    const [rows] = await conn.query('SELECT * FROM reports WHERE status="accepted"')
    return NextResponse.json({ reports: rows }, {status: 200})
  } catch (error) {
    console.error('Error fetching reports: ', error)
    return NextResponse.json({ message: 'Error fetching reports' }, { status: 500})
  } finally {
    if (conn)
      conn.release()
  }
}