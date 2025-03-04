import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(req: NextRequest) {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows] = await connection.execute(`
            SELECT YEAR(created_at) AS year, status, COUNT(*) as count
            FROM reports
            GROUP BY year, status
            ORDER BY year ASC;
        `);

        await connection.end();

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching annual report statuses:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
