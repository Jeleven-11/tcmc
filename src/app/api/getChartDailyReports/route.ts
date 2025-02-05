import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET()
{
    const rows = await query(
        `SELECT 
            DATE_FORMAT(createdAt, '%Y-%m-%dT%H:00:00') AS time,
            COUNT(*) AS count
        FROM reports
        WHERE YEARWEEK(createdAt, 1) = YEARWEEK(NOW(), 1) AND createdAt >= NOW() - INTERVAL 1 DAY
        GROUP BY time
        ORDER BY time ASC`
    , [])
    
    return NextResponse.json(rows)
}