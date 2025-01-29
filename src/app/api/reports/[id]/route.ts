// import { stat } from 'fs';
import { FieldPacket } from 'mysql2';
import pool, { query } from '../../../lib/db'; // Adjust this path as needed
import { NextRequest, NextResponse } from 'next/server';

interface Report {
    fullName: string;
    age: number;
    sex: string;
    address: string;
    contactNumber: string;
    isOwner: string;
    driversLicense: string;
    vehicleRegistration: string;
    orCr: string;
    reason: string;
    vehicleType: string;
    platenumber: string;
    color: string;
    description: string;
    reportID: string;
    status: string;
    createdAt: string;
  }

export async function GET(req: NextRequest) {
    if (req.method === 'GET') {
      try {
        const [results]: [Report[], FieldPacket[]] = await query('SELECT * FROM reports', {}) as [Report[], FieldPacket[]];
        return NextResponse.json(results, {status: 200});
      } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, {status: 500});
      }
    } else {
        return NextResponse.json({ error: 'Method not allowed' }, {status: 405}); // Only allow GET
    }
  }

export async function PUT(req:NextRequest) {
  const { id } = await req.json();

  if (req.method === 'PUT') {
    const { status } = await req.json();

    try {
      await pool.query('UPDATE reports SET status = ? WHERE id = ?', [status, id]);
      return NextResponse.json({ message: 'Report status updated successfully' }, {status: 200});
    } catch (error) {
      console.error('Error updating report status:', error);
      return NextResponse.json({ error: 'Failed to update report status' }, {status: 500});
    }
  } else if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM reports WHERE id = ?', [id]);
      return NextResponse.json({ message: 'Report deleted successfully' }, {status: 200});
    } catch (error) {
      console.error('Error deleting report:', error);
      return NextResponse.json({ error: 'Failed to delete report' }, {status: 500});
    }
  } else {
    return NextResponse.json({ error: 'Method not allowed' }, {status: 405}); // Only allow PUT and DELETE
  }
}

