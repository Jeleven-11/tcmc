import { query } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET()
{
    const asd = await query('SELECT * FROM master_password', [])
    // const asda = JSON.parse(asd)

    return NextResponse.json({ asd }, { status: 200 })
}