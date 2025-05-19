// /api/notifications/logs/route.ts
import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { RowDataPacket, FieldPacket } from "mysql2";

export const dynamic = "force-dynamic";

interface NotificationRecord extends RowDataPacket {
  notif_id: number;
  notif_title: string;
  notif_description: string;
  notif_timestamp: string;
}

interface CountResult extends RowDataPacket {
  total: number;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "5");
  const offset = (page - 1) * pageSize;

  let conn;

  try {
    conn = await pool.getConnection();

    const [notifications]: [NotificationRecord[], FieldPacket[]] = await conn.query(
      `SELECT * FROM notifications_record ORDER BY notif_timestamp DESC LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    const [countRows]: [CountResult[], FieldPacket[]] = await conn.query(
      `SELECT COUNT(*) as total FROM notifications_record`
    );

    const total = countRows[0]?.total || 0;

    return NextResponse.json({
      data: notifications,
      total,
    });
  } catch (error) {
    console.error("DB error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
