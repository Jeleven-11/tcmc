// import { stat } from 'fs';
// import { FieldPacket } from 'mysql2';
import pool  from '../../../lib/db'; // Adjust this path as needed
// import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { FieldPacket, ResultSetHeader } from 'mysql2';

// interface Report {
//     fullName: string;
//     age: number;
//     sex: string;
//     address: string;
//     contactNumber: string;
//     isOwner: string;
//     driversLicense: string;
//     vehicleRegistration: string;
//     orCr: string;
//     reason: string;
//     vehicleType: string;
//     platenumber: string;
//     color: string;
//     description: string;
//     reportID: string;
//     status: string;
//     createdAt: string;
//   }



export async function PUT(req:NextRequest, {params}: {params: {id: string}}) {
  
  // const id = req.query.id;
  // const { id } = await req.json(); // how do i get the id i have in the url api/reports/[id]
  const { id } = params
  const body = await req.json()
  const { newStatus } = body
  console.log(`newStatus: ${newStatus}`)
  console.log(`id: ${id}`)
  const connection = await pool.getConnection();
  if (req.method === 'PUT') {
    // const { status } = await req.json();

    try {
      
      const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query('UPDATE reports SET status = ? WHERE reportID = ?', [newStatus, id]) as [ResultSetHeader, FieldPacket[]];
      connection.release();
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 } );
      }
      return NextResponse.json({ message: 'Report status updated successfully' } ,{ status: 200 });
    } catch (error) {
      connection.release();
      console.error('Error updating report status:', error);
      return NextResponse.json({ error: 'Failed to update report status' } , { status: 500 });
    }
  } else if (req.method === 'DELETE') {
    try {
      const [result]: [ResultSetHeader, FieldPacket[]] = await connection.query('DELETE FROM reports WHERE id = ?', [id]) as [ResultSetHeader, FieldPacket[]];
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

