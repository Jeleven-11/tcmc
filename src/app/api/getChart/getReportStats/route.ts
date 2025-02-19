import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    const connection = await pool.getConnection();
    const rows = await connection.query(
        `SELECT status, COUNT(*) as total_reports
        FROM reports
        GROUP BY status
        ORDER BY status ASC`,
        []
    );
    connection.release();

    return NextResponse.json(rows);
}
