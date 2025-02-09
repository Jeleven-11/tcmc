import { NextRequest, NextResponse } from 'next/server';
import {WebSocketServer} from 'ws';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    if (req.method === 'GET') {
        // const serverHostname = req.headers.host; // Get the hostname from the HTTP request headers
        // const url = new URL(req.url, `wss://localhost`);
        // const authToken = url.searchParams.get('token');
        const wss = new WebSocketServer({port: 3000} );// I want to know which port the websocket server is being deployed on
        const webRTCClients = new Map();
        //wss://tcmc.vercel.app:3306?
        wss.on('connection', async (ws, req) => {
            const serverHostname = req.headers.host; // Get the hostname from the HTTP request headers
            // const wsurl = new URL(req.url, `wss://${serverHostname}`);
            const wsurl = req.url ? new URL(req.url, `wss://${serverHostname}`) : undefined;
            console.log('wsurl: ', wsurl);
            const authToken = wsurl!.searchParams.get('token');
            if (!authToken) {
                console.log('WebSocket connection rejected: Authentication token missing');
                ws.close(1008, 'Authentication token missing');
                return;
            }
            console.log('authToken from url: ', authToken);
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
                ws.on('message', async(message:string) => {
                    try {
                        const data = JSON.parse(message);
                        if(data.type==='register'){
                            webRTCClients.set(ws, {
                                role: data.role,
                                id: data.id,
                                userID: data.userID
                            });
                            console.log('Client registered with ID:', data.id);
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
            
        });

        console.log('WebSocket server started on port 3306');// edit this (I want to know which port the websocket server is being deployed on)
        return new Response(null, {
            status: 200,
            headers: {
              'Upgrade': 'websocket',
              'Connection': 'Upgrade',
            },
          });
        // wss.handleUpgrade(req, req.socket, req.headers, (ws) => {
        //   wss.emit('connection', ws, req);
        // });
      } else {
        return NextResponse.json({ error: 'Method not allowed' }, {status: 405});
      }
}


// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     if (req.method === 'GET') {
//         wss.handleUpgrade(req, req.socket, req.headers, (ws) => {
//             wss.emit('connection', ws, req);
//         });
//     } else {
//         return res.status(405).json({ error: 'Method not allowed' });
//     }
// }

// export default function SOCKET(req, res) {
//   if (res.socket.server.ws) return;

//   const ws = new Server({ server: res.socket.server });
//   res.socket.server.ws = ws;
//   console.log('WebSocket server started on port ', req.socket.server.address().port);
//   ws.on('connection', socket => {
//     //How do I include this commented out properly here in this websocket server integrated in api?
    
//     const serverHostname = req.headers.host; // Get the hostname from the HTTP request headers //https://tcmc.vercel.app/api/websocket
//     const url = new URL(req.url, `wss://${serverHostname}`);
//     const authToken = url.searchParams.get('token');
//     console.log('authToken from url: ', authToken);
//     if (!authToken) {
//       console.log('WebSocket connection rejected: Authentication token missing');
//       socket.close(1008, 'Authentication token missing');
//       return;
//     }
//     try{
//         console.log('authToken type: ', typeof authToken);
//         if(typeof authToken !== 'string'){
//             console.error("Token is not a string: ", typeof authToken);
//             return null;
//         }
//         const wsSecretKey = process.env.AUTH_SECRETKEY;
//         console.log('wsSecretKey from server: ', wsSecretKey);
//         if(!wsSecretKey){
//             console.error('WebSocket connection rejected: Secret key missing');
//             return null
//         }
//         const decoded = jwt.verify(authToken, wsSecretKey);
//         console.log('decoded from authToken: ', decoded);
//         if(!decoded){
//             socket.close(1008, 'Invalid authentication token');
//             return null;
//         }
//         socket.on('message', async (message) => {
//             // Handle incoming messages
//             try {
//               const data = JSON.parse(message);
//               if(data.type==='register'){
//                   webRTCClients.set(socket, {
//                       role: data.role,
//                       id: data.id,
//                       userID: data.userID
//                   });
//                   console.log('Client registered with ID:', data.id);
//               }
//               else if(data.type === 'offer'){
//                   const targetClient = Array.from(webRTCClients.entries())
//                   .find(([, info]) => info.id === data.target);
//                   if(targetClient) {
//                       const peerID = webRTCClients.get(socket);
//                       targetClient[0].send(JSON.stringify({
//                           type: data.type,
//                           payload: data.payload,
//                           from: peerID
//                       }));
//                   }
//               }           
//               else if(data.type === 'ice-candidate'){
//                   const targetClient = Array.from(webRTCClients.entries())
//                   .find(([, info]) => info.id === data.target)
//                   if(targetClient){
//                       const peerID = webRTCClients.get(socket);
//                       targetClient[0].send(JSON.stringify({
//                           type: data.type,
//                           payload: data.payload,
//                           from: peerID
//                       }
//                       ));
//                   }
//               }
//               else if(data.type === 'answer'){
//                   const targetClient = Array.from(webRTCClients.entries())
//                       .find(([, info]) => info.id === data.target);
//                       if(targetClient) {
//                           const piPeerID = webRTCClients.get(socket);
//                           targetClient[0].send(JSON.stringify({
//                               type: data.type,
//                               payload: data.payload,
//                               from: piPeerID
//                           }));
//                           console.log("sent answer to: ", data.target);
//                       } else {
//                           console.log("Unable to send answer, target not found: ", data.target);
//                       }
//               }
//               else if(data.type==='request-stream'){
//                   const targetClient = Array.from(webRTCClients.entries())
//                   .find(([, info]) => info.id === data.target);
//                   console.log(`Request Stream from: ${data.from} to: ${data.target}`);
//                   if (targetClient) {
//                       const from = data.from;
//                       targetClient[0].send(JSON.stringify({
//                       type: 'request-stream',
//                       from: from
//                       }));
//                   }
//               }
//               else if(data.type==='ping'){
//                   socket.send(JSON.stringify({type:'pong'}));
//               }
//               console.log('Websocket Server received data:', data);
              
//           } catch (error) {
//               console.error('Error processing websocket message:', error);
//           }
//           });
//           socket.on('close', () => {
//               console.log('Client disconnected');
//               webRTCClients.delete(socket);
//           });
//     } catch (err) {
//       console.error('Error verifying token:', err);
//       socket.close(1008, 'Invalid authentication token');
//       return null;
//     }
//   });
//   console.log('WebSocket server started on port ', req.socket.server.address().port);
//   res.end();
// }