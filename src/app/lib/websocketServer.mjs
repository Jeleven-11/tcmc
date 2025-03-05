import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const wss = new WebSocketServer({ port: 3001 });
const webRTCClients = new Map();
const activeUsers = new Map(); // 🟢 Stores active users

wss.on('connection', async (ws, req) => {
    const serverHostname = req.headers.host;
    const url = new URL(req.url, `ws://${serverHostname}`);

    // Check if the connection is secure (HTTPS)
    if (req.headers['x-forwarded-proto'] === 'https' || req.headers['x-forwarded-ssl'] === 'on') {
        url.protocol = 'wss:';
    }

    // Extract token
    const authToken = url.searchParams.get('token');
    if (!authToken) {
        console.log('WebSocket connection rejected: Authentication token missing');
        ws.close(1008, 'Authentication token missing');
        return;
    }

    try {
        const wsSecretKey = process.env.AUTH_SECRETKEY;
        if (!wsSecretKey) throw new Error('Missing secret key');

        const decoded = jwt.verify(authToken, wsSecretKey);
        if (!decoded || !decoded.userID) {
            ws.close(1008, 'Invalid authentication token');
            return;
        }

        const userID = decoded.userID;
        activeUsers.set(userID, ws); // 🟢 Mark user as active
        console.log(`✅ User ${userID} connected. Active users: ${activeUsers.size}`);

        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);

                if (data.type === 'register') {
                    webRTCClients.set(ws, {
                        role: data.role,
                        id: data.id,
                        userID: data.userID
                    });
                    console.log('Client registered with ID:', data.id);
                } 
                else if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice-candidate') {
                    const targetClient = Array.from(webRTCClients.entries()).find(([, info]) => info.id === data.target);
                    if (targetClient) {
                        targetClient[0].send(JSON.stringify({
                            type: data.type,
                            payload: data.payload,
                            from: webRTCClients.get(ws)
                        }));
                    }
                } 
                else if (data.type === 'request-stream') {
                    const targetClient = Array.from(webRTCClients.entries()).find(([, info]) => info.id === data.target);
                    if (targetClient) {
                        targetClient[0].send(JSON.stringify({
                            type: 'request-stream',
                            from: data.from
                        }));
                    }
                } 
                else if (data.type === 'ping') {
                    ws.send(JSON.stringify({ type: 'pong' }));
                }

                console.log('WebSocket Server received data:', data);
            } catch (error) {
                console.error('❌ Error processing WebSocket message:', error);
            }
        });

        ws.on('close', () => {
            console.log(`❌ User ${userID} disconnected`);
            activeUsers.delete(userID); // ❌ Remove user on disconnect
            webRTCClients.delete(ws);
        });

    } catch (error) {
        console.error('❌ WebSocket connection rejected:', error);
        ws.close(1008, 'Invalid token');
    }
});

// 🟢 API to get active users
export function getActiveUsers() {
    return Array.from(activeUsers.keys());
}

console.log('🚀 WebSocket server started on port 3001');

console.log('WebSocket server started on port 3001');