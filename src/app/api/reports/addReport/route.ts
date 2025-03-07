// pages/api/addReport.js
import { FieldPacket } from 'mysql2';
import pool from '../../../lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface ReportRequestBody {
    reported_by_user_id: string;
    vehicle_type: string;
    vehicle_color: string;
    plate_number: string;
    incurred_violations: string;
    image_upload: string;
  }

  export async function POST(req: NextRequest){
  if (req.method === 'POST') {
    const { reported_by_user_id, vehicle_type, vehicle_color, plate_number, incurred_violations, image_upload }: ReportRequestBody = await req.json();

    // Validate if all fields are provided
    if (!reported_by_user_id || !vehicle_type || !vehicle_color || !plate_number || !incurred_violations || !image_upload) {
      return NextResponse.json({ error: 'All fields are required' }, {status: 400});
    }

    let conn
    try
    {
      conn = await pool.getConnection()
      const [result]: [ReportRequestBody[], FieldPacket[]] = await conn.execute(
        'INSERT INTO watchlist (reported_by_user_id, vehicle_type, vehicle_color, plate_number, incurred_violations, image_upload) VALUES (?, ?, ?, ?, ?, ?)', 
        [reported_by_user_id, vehicle_type, vehicle_color, plate_number, incurred_violations, image_upload]
      ) as [ReportRequestBody[], FieldPacket[]];
      NextResponse.json({ message: 'Report added successfully', data: result }, {status: 201});
    } catch (error) {
      console.error('Database Error:', error);
      NextResponse.json({ error: 'Failed to add report' }, {status: 500});
    } finally {

      if (conn)
        conn.release()
    }
  } else {
    
    NextResponse.json({ error: 'Method Not Allowed' }, {status: 405});
  }
}
