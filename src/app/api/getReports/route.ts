// /pages/api/getReports.js
import pool from '../../lib/db'; // Adjust path if needed
// import { FieldPacket, ResultSetHeader } from 'mysql2';
import { NextResponse } from 'next/server';
export default async function handler() {
  try {
    const [rows] = await pool.query('SELECT * FROM reports');
    NextResponse.json({ reports: rows }, {status: 200});
  } catch (error) {
    console.error('Error fetching reports: ', error);
    NextResponse.json({ message: 'Error fetching reports' }, { status: 500});
  }
}
