import pool from '../../lib/db';
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
export async function POST(request: NextRequest)
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
    }: Report = records;

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

    const [result] = await pool.query(query, values);
    pool.end();
    console.log('Report submitted successfully:', result)

    return NextResponse.json({
      message: 'Report submitted successfully',
      reportID,
      result,
    })
  } catch (error) {
    pool.end();
    console.error('Error submitting report:', error)
    return NextResponse.json({ error: 'Internal Server Error' })
  }
}