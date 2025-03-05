import { NextResponse } from 'next/server';
import { getActiveUsers } from '@/app/lib/websocketServer.mjs';

export async function GET() {
    try {
        const activeUsers = getActiveUsers();
        return NextResponse.json(activeUsers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get active users' }, { status: 500 });
    }
}
