import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET()
{
    const rows = await query(
        `SELECT
            SUM(CASE WHEN DAYOFWEEK(createdAt) = 2 THEN 1 ELSE 0 END) AS Monday,
            SUM(CASE WHEN DAYOFWEEK(createdAt) = 3 THEN 1 ELSE 0 END) AS Tuesday,
            SUM(CASE WHEN DAYOFWEEK(createdAt) = 4 THEN 1 ELSE 0 END) AS Wednesday,
            SUM(CASE WHEN DAYOFWEEK(createdAt) = 5 THEN 1 ELSE 0 END) AS Thursday,
            SUM(CASE WHEN DAYOFWEEK(createdAt) = 6 THEN 1 ELSE 0 END) AS Friday,
            SUM(CASE WHEN DAYOFWEEK(createdAt) = 7 THEN 1 ELSE 0 END) AS Saturday,
            SUM(CASE WHEN DAYOFWEEK(createdAt) = 1 THEN 1 ELSE 0 END) AS Sunday 
        FROM reports
        WHERE YEARWEEK(createdAt, 1) = YEARWEEK(NOW(), 1)`
    , [])

    // for getting the start and end of the week
    //DATE_FORMAT(MIN(createdAt), '%Y-%m-%d 00:00:00') AS weekStartDate,
    //DATE_FORMAT(DATE_ADD(MIN(createdAt), INTERVAL 6 DAY), '%Y-%m-%d 00:00:00') AS weekEndDate

    return NextResponse.json(rows)
}