import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
        `SELECT MONTH(createdAt) AS month, status, COUNT(*) AS total_reports
        FROM reports
        WHERE YEAR(createdAt) = YEAR(CURDATE()) -- Only fetch current year's data
        GROUP BY month, status
        ORDER BY month ASC, status ASC`,
        []
    );
    connection.release();

    return NextResponse.json(rows);
}
