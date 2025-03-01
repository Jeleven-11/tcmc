import pool  from '../../../lib/db'; 
import { NextRequest, NextResponse } from 'next/server';
import { FieldPacket, ResultSetHeader } from 'mysql2';

export async function PUT(req:NextRequest, {params}: {params: {id: string}}) {
  
  const { id } = params
  const body = await req.json()
  const newStatus =  body.status
  const connection = await pool.getConnection();
  if (req.method === 'PUT') {
    // const { status } = await req.json();

    try {
      
      const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query('UPDATE reports SET status = ?, updatedAt = NOW() WHERE reportID = ?', [newStatus, id]) as [ResultSetHeader, FieldPacket[]];
      connection.release();
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 } );
      }
      console.log('Report status updated successfully');
      return NextResponse.json({ message: 'Report status updated successfully' } ,{ status: 200 });
    } catch (error) {
      connection.release();
      console.error('Error updating report status:', error);
      return NextResponse.json({ error: 'Failed to update report status' } , { status: 500 });
    }
  }
} 
export async function DELETE(req:NextRequest, {params}: {params: {id: string}}) 
{if (req.method === 'DELETE') {
  const { id } = params
  const connection = await pool.getConnection();
    try {
      const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query('DELETE FROM reports WHERE reportID = ?', [id]) as [ResultSetHeader, FieldPacket[]];
      connection.release();
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: 'Report not found' } , { status: 404 }); 
      }
      return NextResponse.json({ message: 'Report deleted successfully' } , { status: 200 });
    } catch (error) {
      connection.release();
      console.error('Error deleting report:', error);
      return NextResponse.json({ error: 'Failed to delete report' } , { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Method not allowed' } ,{ status: 405 }); // Only allow PUT and DELETE
  }
}

export async function POST(req: NextRequest) 
{
  let conn = null
  try
  {
    const { reportID, status } = await req.json()
    conn = await pool.getConnection()

    const [result]: [ResultSetHeader, FieldPacket[]] = await conn.query('UPDATE reports SET team = ?, updatedAt = NOW() WHERE reportID = ?', [status, reportID]) as [ResultSetHeader, FieldPacket[]]
    if (result.affectedRows === 0)
      return NextResponse.json({ error: 'Report not found' }, { status: 404 } )

    return NextResponse.json({ message: 'Report team status updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error updating report team status:', error)
    return NextResponse.json({ error: 'Failed to update report team status' } , { status: 500 })
  } finally {

    if (conn)
      conn.release()
  }
}

export const dynamic = 'force-dynamic'

