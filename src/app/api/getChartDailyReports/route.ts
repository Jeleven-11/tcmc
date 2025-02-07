import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export const dynamic = 'force-dynamic'

export async function GET()
{
    const rows = await query(
        `SELECT 
            DATE_FORMAT(createdAt, '%Y-%m-%dT%H:%i:00') AS time,
            COUNT(*) AS count
        FROM reports
        WHERE DATE(createdAt) = CURDATE()
        GROUP BY time
        ORDER BY time ASC`
    , [])
    
    return NextResponse.json(rows)
}