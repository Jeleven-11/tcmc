import pool from '../../lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request)
{
  const records = await request.json();
  try
  {
    const {
      fullName,
      age,
      sex,
      address,
      contactNumber,
      isOwner,
      driversLicense,
      vehicleRegistration,
      orCr,
      reason,
      vehicleType,
      platenumber,
      color,
      description,
      reportID,
    } = records;

    const query = `
      INSERT INTO reports (
        fullName, age, sex, address, contactNumber, isOwner,
        driversLicense, vehicleRegistration, orCr, reason, vehicleType, platenumber, color,
        description, reportID, status, createdAt
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `
    const values = [
      fullName,
      age,
      sex,
      address,
      contactNumber,
      isOwner,
      driversLicense || '',
      vehicleRegistration || '',
      orCr || '',
      reason,
      vehicleType,
      platenumber,
      color,
      description,
      reportID,
    ]

    const [result] = await pool.query(query, values)
    console.log('Report submitted successfully:', result)

    return NextResponse.json({
      message: 'Report submitted successfully',
      reportID,
      result,
    })
  } catch (error) {
    console.error('Error submitting report:', error)
    return NextResponse.json({ error: 'Internal Server Error' })
  }
}