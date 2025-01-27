import { NextRequest, NextResponse } from 'next/server';
import { FieldPacket } from 'mysql2';
import pool from '../../lib/db';

interface Report {
    report_id: number;
    reported_by_user_id: number;
    // Add other properties of the report as needed
}

interface UpdateReportRequestBody {
    id?: string;
    vehicle_type: string;
    vehicle_color: string;
    plate_number: string;
    incurred_violations: string;
    image_upload: string;
    userId: number;
}

export async function PUT(req: NextRequest) {
  if (req.method === 'PUT') {
    // const { id } = req.json(); // `id` should be a string or undefined
    const {
        id,
        vehicle_type,
        vehicle_color,
        plate_number,
        incurred_violations,
        image_upload,
        userId
    }: UpdateReportRequestBody = await req.json(); // Body type cast

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ message: 'Invalid or missing report ID' }, {status: 400});
    }

    try {
      // Fetch the report from the database
      const [rows]: [Report[], FieldPacket[]] = await pool.query('SELECT * FROM watchlist WHERE report_id = ?', [id]) as [Report[], FieldPacket[]];

      if (rows.length === 0) {
        return NextResponse.json({ message: 'Report not found' }, {status: 404});
      }
      const report = rows[0];

      // Ensure the logged-in user is the owner of the report
      if (report.reported_by_user_id !== userId) {
        pool.end();
        return NextResponse.json({ message: 'You are not authorized to edit this report' }, {status: 403});
      }

      // Update the report in the database
      await pool.query(
        'UPDATE watchlist SET vehicle_type = ?, vehicle_color = ?, plate_number = ?, incurred_violations = ?, image_upload = ? WHERE report_id = ?',
        [vehicle_type, vehicle_color, plate_number, incurred_violations, image_upload, id]
      );
      pool.end();
      NextResponse.json({ message: 'Report updated successfully' }, {status: 200});
    } catch (error) {
      console.error('Error updating report:', error);
      pool.end();
      NextResponse.json({ message: 'An error occurred while updating the report' }, {status: 500});
    }
  } else {
    pool.end();
    NextResponse.json({ message: 'Method Not Allowed' }, {status: 405});
  }
}
