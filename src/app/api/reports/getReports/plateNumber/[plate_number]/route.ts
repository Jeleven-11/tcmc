import pool  from '../../../../../lib/db'; 
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';

export async function GET(req:NextRequest, {params}: {params: {plate_number: string}}) {
    const { plate_number } = params;
    const connection = await pool.getConnection();
    try {
        
        const [result] = await connection.query<RowDataPacket[]>('SELECT * FROM reports WHERE platenumber = ?', [plate_number]);
        
        if (result.length === 0) {
        return NextResponse.json({ error: `No matching report found for ${plate_number}` }, { status: 404 } );
        }
        return NextResponse.json({ data:result[0], message: `Matching report found for ${plate_number}` } ,{ status: 200 });
    } catch (error) {
        console.error('Error fetching report for a license plate match:', error);
        return NextResponse.json({ error: 'Failed to fetch report for a license plate match' } , { status: 500 });
    } finally {
        if(connection) connection.release();
    }
}