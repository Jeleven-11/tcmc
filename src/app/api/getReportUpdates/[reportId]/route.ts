import pool  from '../../../lib/db'; 
import { NextRequest, NextResponse } from 'next/server';
import { FieldPacket } from 'mysql2';

type ResponseData = {
    message: string;
    updates?: Array<{
        title:string;
        details: string;
        created_at: string;
        user_name: string;
    }>;
};

export async function GET(req:NextRequest, {params}: {params: {reportId: string}}) {
  
  const { reportId } = params
  console.log("id: ", reportId);
  const connection = await pool.getConnection();
  if (req.method === 'GET') {
    try {
      const query = `
      SELECT
      ru.title,
      ru.details,
      ru.created_at,
      u.name AS user_name
      FROM report_updates AS ru
      JOIN users AS u ON ru.user_id = u.user_id
      WHERE ru.report_id = ?
      ORDER BY ru.created_at DESC
      `;
      const [rows]: [ResponseData[], FieldPacket[]] = await connection.execute(query, [reportId]) as [ResponseData[], FieldPacket[]];
      console.log("ROWS;;;;", rows);
      // const updates = rows.map(row => ({
      //   ...row,
      //   created_at: new Date(row.updates!.created_at).toISOString()
      // }));
    //   if (result.affectedRows === 0) {
    //     return NextResponse.json({ error: 'Report not found' }, { status: 404 } );
    //   }
    //   console.log('Report status updated successfully');
      return NextResponse.json({ message: 'Report Updates retrieved successfully', updates: rows } ,{ status: 200 });
    } catch (error) {
      
      console.error('Error getting report updates:', error);
      return NextResponse.json({ error: 'Failed to update report status' } , { status: 500 });
    } finally {
        if(connection)connection.release();
    }
  }
} 