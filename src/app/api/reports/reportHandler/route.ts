import pool from '../../../lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { Report } from '@/app/lib/interfaces';

export async function POST(request: NextRequest)
{
  const records = await request.json();
  console.log("Records: ", records)
  let connection = null;
  try
  {
    const {
      fullName,
      age,
      sex,
      address,
      region,
      province,
      city,
      barangay,
      contactNumber,
      isOwner,
      driversLicense,
      vehicleRegistration,
      orCr,
      reason,
      vehicleType,
      reportedVehicleImage,
      platenumber,
      color,
      description,
      reportID,
    }: Report = records;
    connection = await pool.getConnection();

    const query = `
      INSERT INTO reports (
        fullName, age, sex, address, contactNumber, isOwner,
        driversLicense, vehicleRegistration, orCr, reason, vehicleType, reportedVehicleImage, platenumber, color,
        description, reportID, status, createdAt
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unread', ?)
    `
    const concatenatedAddress= address+", "+barangay+", "+city+", "+province+", "+region;
    const values = [
      fullName,
      age,
      sex,
      concatenatedAddress,
      contactNumber,
      isOwner,
      driversLicense,
      vehicleRegistration,
      orCr,
      reason,
      vehicleType,
      reportedVehicleImage,
      platenumber,
      color,
      description,
      reportID,
      DateTime.now().setZone('Asia/Manila').toFormat('yyyy-MM-dd HH:mm:ss'),
    ]
    // Get connection to the database pool
    
    const [result] = await connection.query(query, values);
    connection.release();
    console.log('Report submitted successfully:', result)

    return NextResponse.json({
      message: 'Report submitted successfully',
      reportID,
      result,
    })
  } catch (error) {
    console.error('Error submitting report:', error)
    return NextResponse.json({ error: 'Internal Server Error' })
  } finally {
    if(connection) connection.release();
  }
}