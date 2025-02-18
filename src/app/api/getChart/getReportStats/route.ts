import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    const rows = await query(
        `SELECT status, COUNT(*) as total_reports
        FROM reports
        GROUP BY status
        ORDER BY status ASC`,
        []
    );

    return NextResponse.json(rows);
}
