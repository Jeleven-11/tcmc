import pool from '../../lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { Report } from '@/app/lib/interfaces';

export async function POST(request: NextRequest)
{
  const records = await request.json();
  console.log("Records: ", records)
  try
  {
//     fullName: '',
//     age: '',
//     sex: '',
//     address: '',
// //test
//       region: "",
//       province: "",
//       city: "",
//       barangay: "",
//     contactNumber: "",
//     isOwner: 'No',
//     driversLicense: "",
//     vehicleRegistration: "",
//     orCr: "",
//     reason: 'Stolen? Involved in an incident/accident?',
//     vehicleType: 'Motorcycle',
//     reportedVehicleImage:'',
//     platenumber: '',
//     color: '',
//     description: '',
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
    const connection = await pool.getConnection();
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
  }
}