import { NextRequest, NextResponse } from 'next/server';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import pool from '../../lib/db';

interface UpdateStatusRequestBody {
  reportID: number;
  status: string;
}

export async function PATCH(req: NextRequest) {
  if (req.method === 'PATCH') {
    try {
      const { reportID, status }: UpdateStatusRequestBody = await req.json();

      if (!reportID || !status) {
        return NextResponse.json({ error: 'reportID and status are required' }, {status: 400});
      }

      const query = `UPDATE reports SET status = ? WHERE reportID = ?`;
      const values = [status, reportID];

      const [result]: [ResultSetHeader, FieldPacket[]] = await pool.query(query, values);

      if (result.affectedRows > 0) {
        pool.end();
        return NextResponse.json({ message: 'Report status updated successfully' }, {status: 200});
      } else {
        pool.end();
        return NextResponse.json({ error: 'Report not found' }, {status: 404});
      }
    } catch (error) {
      pool.end();
      console.error('Error updating report status:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, {status: 500});
    }
  } else {
    pool.end();
    return NextResponse.json({ error: 'Method Not Allowed' }, {status: 405});
  }
}