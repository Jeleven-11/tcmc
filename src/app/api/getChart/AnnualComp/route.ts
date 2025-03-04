import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export const dynamic = "force-dynamic";

interface ReportRow {
    month: number;
    status: "unread" | "dropped" | "on_investigation" | "solved";
    total_reports: number;
}

export async function GET() {
    try {
        console.log("📊 Fetching Annual Report Data");

        const year = new Date().getFullYear();

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

        const rows = await query(queryStr, [year]) as ReportRow[];

        console.log("🟡 Raw Query Result:", rows);

        if (!Array.isArray(rows)) {
            console.error("❌ Query did not return an array. Check the database response.");
            return NextResponse.json({ error: "Unexpected database response" }, { status: 500 });
        }

        if (rows.length === 0) {
            console.warn("⚠ No report data available for this year.");
            return NextResponse.json({ message: "No report data available for this year" }, { status: 404 });
        }

        // Initialize the structure
        const data: Record<string, number[]> = {
            unread: new Array(12).fill(0),
            dropped: new Array(12).fill(0),
            on_investigation: new Array(12).fill(0),
            solved: new Array(12).fill(0),
        };

        // Populate data
        rows.forEach(({ month, status, total_reports }) => {
            if (data[status]) {
                data[status][month - 1] = total_reports; // Month is 1-based, array is 0-based
            } else {
                console.warn(`⚠ Unknown status "${status}" found in database.`);
            }
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("❌ Error fetching Annual Report Data:", error);
        return NextResponse.json({ error: "Failed to fetch Annual Report Data" }, { status: 500 });
    }
}
