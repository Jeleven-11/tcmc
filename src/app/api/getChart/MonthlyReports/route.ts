import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export const dynamic = 'force-dynamic';

export async function GET()
{
    try
    {
        const initDate = new Date()
        const year = initDate.getFullYear()
        const month = initDate.getMonth() + 1
        const daysInMonth = new Date(year, month, 0).getDate() // year, month + 1 (since starts at 0), day . getdate()

        const dayColumns = []
        for (let day = 1; day <= daysInMonth; day++)
            dayColumns.push(`COALESCE(SUM(CASE WHEN DAY(createdAt) = ${day} THEN 1 ELSE 0 END), 0) AS '${day}'`)

        const queryStr = `
            SELECT ${dayColumns.join(", ")}
            FROM reports
            WHERE YEAR(createdAt) = ? AND MONTH(createdAt) = ?
        `;

        const totalReportsQuery = `
            SELECT COUNT(*) AS totalReports
            FROM reports
            WHERE YEAR(createdAt) = ? AND MONTH(createdAt) = ?
        `;

        const [rows, totalRows] = await Promise.all([
            query(queryStr, [year, month]),
            query(totalReportsQuery, [year, month])
        ]) as [{ [key: string]: number }[], { totalReports: number }[]];

        if (!rows || rows.length === 0 || !totalRows || totalRows.length === 0)
            return NextResponse.json({message: "No data available for this month"}, {status: 404});

        return NextResponse.json({year, month, days: rows, totalReports: totalRows[0]?.totalReports || 0 })
    } catch (error) {
        console.error("Error fetching daily reports:", error);
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}