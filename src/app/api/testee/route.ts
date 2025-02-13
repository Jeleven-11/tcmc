import { query } from "@/app/lib/db";
import { FieldPacket, ResultSetHeader } from "mysql2";
import { NextResponse } from "next/server";


export async function GET()
{
    const checker: [ResultSetHeader, FieldPacket[]] = await query('SELECT * FROM users', []) as [ResultSetHeader, FieldPacket[]]

    return NextResponse.json(checker)

}


