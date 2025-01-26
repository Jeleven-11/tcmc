import pool from '../../lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { FieldPacket } from 'mysql2';

interface ReportReq {
    id: string;
    userId: string;
    reported_by_user_id: string;
}

export default async function handler(req: NextRequest) {
  if (req.method === 'DELETE') {
    const { id, userId }: ReportReq = await req.json();

    try {
      // Check if the report exists
      const [rows]: [ReportReq[], FieldPacket[]] = await pool.query('SELECT * FROM watchlist WHERE report_id = ?', [id]) as [ReportReq[], FieldPacket[]];

      if (rows.length === 0) {
        return NextResponse.json({ message: 'Report not found' }, {status: 404});
      }
      const report = rows[0];

      // Ensure the logged-in user is the owner of the report
      if (report.reported_by_user_id !== userId) {
        return NextResponse.json({ message: 'You are not authorized to delete this report' }, {status: 403});
      }

      // Proceed to delete the report
      await pool.query('DELETE FROM watchlist WHERE report_id = ?', [id]);

      return NextResponse.json({ message: 'Report deleted successfully' }, {status: 200});
    } catch (error) {
      console.error('Error deleting report:', error);
      return NextResponse.json({ message: 'An error occurred while deleting the report' }, {status: 500});
    }
  } else {
    return NextResponse.json({ message: 'Method Not Allowed' }, {status: 405});
  }
}
