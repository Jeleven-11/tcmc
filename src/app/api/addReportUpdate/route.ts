// pages/api/addReportUpdate.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/actions';
import pool from '@/app/lib/db';
import { DateTime } from 'luxon';
import { FieldPacket, ResultSetHeader } from 'mysql2';

type RequestBody = {
  title: string;
  details: string;
  action: 'solved' | 'dropped' | 'save';
  reportId: number;
};

export async function POST( req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed'}, { status:405 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { title, details, action, reportId }: RequestBody = await req.json();
  console.log('Received data: ', title, details, action, reportId);

  // Validate input
  if (!title || !details || !action || !reportId) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  if (!['solved', 'dropped', 'save'].includes(action)) {
    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const currentDate = DateTime.now().setZone('Asia/Manila').toFormat('yyyy-MM-dd HH:mm:ss');
    // 1. Update report status if needed
    if (action !==  'save') {
        const updateStatusQuery = `
          UPDATE reports 
          SET status = ?, 
          updatedAt = ?
          WHERE id = ?
        `;
        await connection.execute(updateStatusQuery, [action, currentDate, reportId]);
    }
      
    const insertUpdateQuery = `
      INSERT INTO report_updates 
        (report_id, user_id, title, details, new_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    console.log("Session id: ", session.user_id);
    const [result]:[ResultSetHeader, FieldPacket[]] = await connection.execute(insertUpdateQuery, [
      reportId,
      session.user_id,
      title,
      details,
      action,
      currentDate
    ]) as [ResultSetHeader, FieldPacket[]];
    
    if (result.affectedRows === 0)
        throw new Error('Failed to update report');

    await connection.commit();
    return NextResponse.json({ message:'Update successful' }, { status: 200 });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Report update error:', error);
    return NextResponse.json({ message: 'Failed to update report' }, { status: 500 });
  } finally{
    if (connection) connection.release();
  }
}