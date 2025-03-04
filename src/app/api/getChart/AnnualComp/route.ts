import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Ensure environment variables are used
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
};

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
      SELECT 
        YEAR(createdAt) AS year,
        SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) AS unread,
        SUM(CASE WHEN status = 'dropped' THEN 1 ELSE 0 END) AS dropped,
        SUM(CASE WHEN status = 'on_investigation' THEN 1 ELSE 0 END) AS on_investigation,
        SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) AS solved
      FROM reports
      GROUP BY year
      ORDER BY year ASC;
    `);

    await connection.end();

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
