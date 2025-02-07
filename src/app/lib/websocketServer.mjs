import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port:  3306});

const webRTCClients = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }); 
    ws.on('message', async(message) => {
        try {
            const data = JSON.parse(message);
            if(data.type==='register'){
                webRTCClients.set(ws, {
                    role: data.role,
                    id: data.id,
                    userID: data.userID
                });
            }
            else if(data.type === 'offer'){
                const targetClient = Array.from(webRTCClients.entries())
                .find(([, info]) => info.id === data.target);
                if(targetClient) {
                    const peerID = webRTCClients.get(ws);
                    targetClient[0].send(JSON.stringify({
                        type: data.type,
                        payload: data.payload,
                        from: peerID
                    }));
                }
            }           
            else if(data.type === 'ice-candidate'){
                const targetClient = Array.from(webRTCClients.entries())
                .find(([, info]) => info.id === data.target)
                if(targetClient){
                    const peerID = webRTCClients.get(ws);
                    targetClient[0].send(JSON.stringify({
                        type: data.type,
                        payload: data.payload,
                        from: peerID
                    }
                    ));
                }
            }
            else if(data.type === 'answer'){
                const targetClient = Array.from(webRTCClients.entries())
                    .find(([, info]) => info.id === data.target);
                    if(targetClient) {
                        const piPeerID = webRTCClients.get(ws);
                        targetClient[0].send(JSON.stringify({
                            type: data.type,
                            payload: data.payload,
                            from: piPeerID
                        }));
                        console.log("sent answer to: ", data.target);
                    } else {
                        console.log("Unable to send answer, target not found: ", data.target);
                    }
            }
            else if(data.type==='request-stream'){
                const targetClient = Array.from(webRTCClients.entries())
                .find(([, info]) => info.id === data.target);
                console.log(`Request Stream from: ${data.from} to: ${data.target}`);
                if (targetClient) {
                    const from = data.from;
                    targetClient[0].send(JSON.stringify({
                    type: 'request-stream',
                    from: from
                    }));
                }
            }
            else if(data.type==='ping'){
                ws.send(JSON.stringify({type:'pong'}));
            }
            console.log('Websocket Server received data:', data);
        } catch (error) {
            console.error('Error processing websocket message:', error);
        }
    })

    ws.on('close', () => {
        console.log('Client disconnected');
        webRTCClients.delete(ws);
    });
});

console.log('WebSocket server started on port 3306');