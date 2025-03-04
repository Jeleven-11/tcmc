import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
        `SELECT 
            months.month, 
            COALESCE(r.status, 'unread') AS status, 
            COALESCE(COUNT(r.id), 0) AS total_reports
        FROM 
            (SELECT 1 AS month UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION 
             SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION 
             SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12) AS months
        LEFT JOIN reports r ON months.month = MONTH(r.created_at)
        GROUP BY months.month, r.status
        ORDER BY months.month, r.status;
        `,
        []
    );
    connection.release();

    return NextResponse.json(rows);
}
