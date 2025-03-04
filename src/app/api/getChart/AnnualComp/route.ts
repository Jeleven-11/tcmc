import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        console.log("📊 Fetching Annual Report Data");

        // Generate months dynamically (1-12)
        const months = Array.from({ length: 12 }, (_, i) => i + 1);

        const queryStr = `
            SELECT 
                MONTH(createdAt) AS month, 
                status, 
                COUNT(*) AS total_reports
            FROM reports
            WHERE YEAR(createdAt) = ?
            GROUP BY month, status
            ORDER BY month ASC, status ASC
        `;

        console.log("🟡 Executing Query:", queryStr);

        const year = new Date().getFullYear();
        const rows = await query(queryStr, [year]) as { month: number; status: string; total_reports: number }[];

        console.log("✅ Query Success: Rows returned:", rows.length);

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: "No report data available for this year" }, { status: 404 });
        }

        // Format data into a structured response
        const statusMap: Record<string, number[]> = {
            unread: new Array(12).fill(0),
            dropped: new Array(12).fill(0),
            on_investigation: new Array(12).fill(0),
            solved: new Array(12).fill(0),
        };

        rows.forEach(({ month, status, total_reports }) => {
            if (statusMap[status]) {
                statusMap[status][month - 1] = total_reports;
            }
        });

        return NextResponse.json({ year, months, data: statusMap });
    } catch (error) {
        console.error("❌ Error Fetching Reports:", error);
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}
