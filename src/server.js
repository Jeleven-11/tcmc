import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { WebSocketServer } from 'ws'
import jwt from 'jsonwebtoken'
const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
 
app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const wss = new WebSocketServer({ server })
  const webRTCClients = new Map();
  wss.on('connection', async(ws, req) => {
    const serverHostname = req.headers.host; // Get the hostname from the HTTP request headers
    const url = new URL(req.url, `wss://${serverHostname}`);
    // Check if the connection is secure (HTTPS)
  if (req.headers['x-forwarded-proto'] === 'https' || req.headers['x-forwarded-ssl'] === 'on') {
    // Update the URL scheme to wss
    url.protocol = 'wss:';
  }
    const authToken = url.searchParams.get('token');
    console.log('authToken from url: ', authToken);
    if (!authToken) {
        console.log('WebSocket connection rejected: Authentication token missing');
        ws.close(1008, 'Authentication token missing');
        return;
    }
    try{
        console.log('authToken type: ', typeof authToken);
        if(typeof authToken !== 'string'){
            console.error("Token is not a string: ", typeof authToken);
            return null;
        }
        const wsSecretKey = process.env.AUTH_SECRETKEY;
        console.log('wsSecretKey from server: ', wsSecretKey);
        if(!wsSecretKey){
            console.error('WebSocket connection rejected: Secret key missing');
            return null
        }
        const decoded = jwt.verify(authToken, wsSecretKey);
        console.log('decoded from authToken: ', decoded);
        if(!decoded){
            ws.close(1008, 'Invalid authentication token');
            return null;
        }
        ws.on('message', async(message) => {
            try {
                const data = JSON.parse(message);
                if(data.type==='register'){
                    webRTCClients.set(ws, {
                        // role: data.role,
                        id: data.id,
                        // userID: data.userID
                    });
                    console.log('Client registered with ID:', data.id);
                    console.log('webRTCClients: ', webRTCClients);
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
    }catch(error){
        console.error('Websocket connection rejected: ', error);
        ws.close(1008, 'Invalid token');
    }
    
  })
  server.listen(port, () => {

    console.log(
        `> Server listening at http://localhost:${port} as ${
            dev ? 'development' : process.env.NODE_ENV
        }`
    )
    console.log(`> WebSocket server listening at port: ${port}`)
  })
  
})