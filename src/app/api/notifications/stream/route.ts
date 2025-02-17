import { NextResponse } from "next/server";

// Store all active SSE clients
let clients: WritableStreamDefaultWriter<Uint8Array>[] = []

// Function to broadcast new notifications to all clients
function sendNotificationToClients(notification: { title: string; body: string })
{
    const encoder = new TextEncoder()
    clients.forEach((client) => client.write(encoder.encode(`data: ${JSON.stringify(notification)}\n\n`)))
}

// SSE connection handler (no saved notifications)
export async function GET(req: Request)
{
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()
    clients.push(writer)

    // Clean up disconnected clients
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

// API to push new notifications to clients
export async function POST(req: Request)
{
    try
    {
        const { title, body } = await req.json()

        if (!title || !body)
            return NextResponse.json({ error: "Title and body are required." }, { status: 400 })

        // Broadcast the new notification immediately
        sendNotificationToClients({ title, body })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error sending notification:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}