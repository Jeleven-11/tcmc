import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
        `WITH months AS (
            SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
            UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
            UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
        )
        SELECT 
            m.month, 
            COALESCE(r.status, 'unread') AS status, 
            COUNT(r.id) AS total_reports
        FROM months m
        LEFT JOIN reports r ON m.month = MONTH(r.created_at)
        GROUP BY m.month, r.status
        ORDER BY m.month, r.status;`
    );

    connection.release();
    return NextResponse.json(rows);
}
