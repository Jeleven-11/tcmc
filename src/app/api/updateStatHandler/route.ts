import { NextRequest, NextResponse } from 'next/server';
import { FieldPacket, ResultSetHeader } from 'mysql2';
import pool from '../../lib/db';

interface UpdateStatusRequestBody {
  reportID: number;
  status: string;
}

export default async function handler(req: NextRequest) {
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
        NextResponse.json({ message: 'Report status updated successfully' }, {status: 200});
      } else {
        NextResponse.json({ error: 'Report not found' }, {status: 404});
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      NextResponse.json({ error: 'Internal Server Error' }, {status: 500});
    }
  } else {
    NextResponse.json({ error: 'Method Not Allowed' }, {status: 405});
  }
}