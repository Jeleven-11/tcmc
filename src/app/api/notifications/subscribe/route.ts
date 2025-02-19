import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { FieldPacket } from "mysql2";

//const FILE_PATH = path.join(process.cwd(), "data", "subscriptions.json");

interface _PushSubscription {
  //endpoint: string;
  //expirationTime: number | null;
  keys: {
    p256dh: string
    auth: string
  };
}

interface Subscribers {
  auth: string | ""
  data: string | ""
}

export async function POST(req: NextRequest)
{
  let conn
  try
  {
    const subscriber_payload = await req.json()
    conn = await pool.getConnection()

    const psubscription: PushSubscription = subscriber_payload
    const _psubscription: _PushSubscription = subscriber_payload as _PushSubscription

    // Read existing subscriptions
    //const fileData = await fs.readFile(FILE_PATH, "utf8");

    const qValues = [_psubscription.keys.auth || ""].filter(Boolean)
    const [rows]: [Subscribers[], FieldPacket[]] = await conn.query('SELECT * FROM subscriptions WHERE auth = ?', [qValues]) as [Subscribers[], FieldPacket[]]
    if (rows.length === 0)
    {
      const auth = _psubscription.keys.auth
      const qStr = `INSERT INTO subscriptions (auth, data) VALUES (?, ?)`
      const isInserted = await conn.execute(qStr, [auth, JSON.stringify(psubscription)])
      if (!isInserted)
        return NextResponse.json({ message: "Subscription failed to insert..."}, { status: 400 })

      return NextResponse.json({ message: "Subscribed successfully!" }, { status: 200 })
    } else return NextResponse.json({ message: "Already subscribed!" }, { status: 400 })

    // const subscriptions = JSON.parse(fileData) as PushSubscription[]

    // Prevent duplicates
    // if (!rows.find((sub) => sub.endpoint === psubscription.endpoint)) {
    //   subscriptions.push(subscription);
    //   await fs.writeFile(FILE_PATH, JSON.stringify(subscriptions, null, 2), "utf8");
    // }

    // return NextResponse.json({ message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 })
  } finally {

    if (conn)
      conn.release()
  }
}