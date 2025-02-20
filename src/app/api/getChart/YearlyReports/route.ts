import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request)
{
    try
    {
        const url = new URL(req.url)
        const yearOffset = parseInt(url.searchParams.get("year") || "1", 10)

        const rows = await query(
            `
                SELECT 
                    YEAR(createdAt) AS year,
                    MONTH(createdAt) AS month,
                    SUM(CASE WHEN YEAR(createdAt) THEN 1 ELSE 0 END) AS 'year_reports_total',
                    COUNT(*) AS count
                FROM reports
                WHERE YEAR(createdAt) = ?
                GROUP BY YEAR(createdAt), MONTH(createdAt)
                ORDER BY YEAR(createdAt) DESC, MONTH(createdAt) ASC
            `,
            [yearOffset]
        )

        const result: Record<string, number> = {
            Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
            Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0,
        };

        let totalReports = 0;
        (rows as { month: number; count: number }[]).forEach(row =>
        {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            result[monthNames[row.month - 1]] = row.count
            totalReports += row.count
        })

        return NextResponse.json({ [yearOffset]: result, totalReports })
    } catch (error) {
        console.error("Error fetching reports:", error)
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
    }
}