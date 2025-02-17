import { NextResponse } from "next/server";

let clients: WritableStreamDefaultWriter[] = []

// Function to broadcast a notification to all connected clients
function sendNotificationToClients(notification: { title: string; body: string })
{
    const encoder = new TextEncoder()
    clients.forEach((client) => client.write(encoder.encode(`data: ${JSON.stringify(notification)}\n\n`)))
}

// SSE connection handler
export async function GET(req: Request)
{
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()

    // Add this client to the list of connected clients
    clients.push(writer)

    // Remove client on disconnect
    req.signal.addEventListener("abort", () =>
    {
        clients = clients.filter((client) => client !== writer)
        writer.close()
    })

    return new NextResponse(readable,
    {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    })
}

// API to trigger a new notification
export async function POST(req: Request)
{
    const { title, body } = await req.json()

    // broadcast
    sendNotificationToClients({ title, body })

    return NextResponse.json({ success: true })
}
