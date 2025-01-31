import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port:  3306});

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }); 

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server started on port 3306');