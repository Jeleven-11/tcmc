import { FieldPacket } from 'mysql2';
import pool from '../../lib/db'; // Adjust this path as needed
import { NextRequest, NextResponse } from 'next/server';

interface Report {
  fullName: string,
  age: number,
  sex: string,
  address: string,
  contactNumber: string,
  isOwner: string,
  driversLicense: string,
  vehicleRegistration: string,
  orCr: string,
  reason: string,
  vehicleType: string,
  platenumber: string,
  color: string,
  description: string,
  reportID: string,
  status: string,
  createdAt: string,
}

export async function GET(req: NextRequest)
{
    if (req.method === 'GET')
    {
      let conn
      try
      {
        conn =  await pool.getConnection()
        const [results]: [Report[], FieldPacket[]] = await conn.query('SELECT * FROM reports', []) as [Report[], FieldPacket[]]
        console.log('Database result:', results)

        return NextResponse.json(results, {status: 200})
      } catch (error) {
        console.error('Error fetching reports:', error)
        return NextResponse.json({ error: 'Failed to fetch reports' }, {status: 500})
      } finally {

        if (conn)
          conn.release()
      }
    } else {
        return NextResponse.json({ error: 'Method not allowed' }, {status: 405}); // Only allow GET
    }
}

export const dynamic = 'force-dynamic'