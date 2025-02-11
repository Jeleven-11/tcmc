'use client';

import { useEffect, useRef, useState } from 'react';
import * as Ably from 'ably';
// import { AblyProvider, useChannel, usePresence } from 'ably/react';
// import { RTCPeerConnection, RTCSessionDescription } from 'webrtc';
import { getSession } from '@/app/lib/actions';

type SessionData = {
  isLoggedIn: boolean;
  name?: string;
  contact_num?: string;
  role?: string;
  email?: string;
  authToken: string
  sessionID: string
} | null;
// interface WebRTCClientInfo {
//     role: string;
//     id: string;
// }
// interface MessageType {
//   type: string,
//   id: string,
//   sessionID: string | '',
//   role: string,
//   payload: string,
//   from?:string,
//   target?:string
// }
// interface RTCSessionDescriptionInit {
//   type: 'offer' | 'answer' | 'pranswer' | 'rollback';
//   sdp: string;
// }
const client = {
  key : process.env.NEXT_PUBLIC_ABLY_API_KEY,
  transportParams: { heartbeatInterval: 15000 }
}
const AblyConnectionComponent = () => {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  // const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // const webRTCPeerChannel = useRef<Ably.RealtimeChannel>();
  const myID = useRef<string | null>(null);
  const sentSignalingMessage = useRef<boolean>(false);
  const [sessionData, setSessionData] = useState<SessionData>(null);
  const piID = useRef<string>('');
    useEffect(() => {
      if(sessionData!==null) return;
      getSession().then(async (session) => {
        const currentSession = JSON.parse(JSON.stringify(session));
        if (currentSession.isLoggedIn) {
          setSessionData({
            isLoggedIn: currentSession.isLoggedIn,
            name: currentSession.name,
            contact_num: currentSession.contact_num,
            role: currentSession.role,
            email: currentSession.email,
            authToken: currentSession.authToken,
            sessionID: currentSession.sessionID
          });
          myID.current = currentSession.sessionID;
          console.log('myID.current: ', myID.current)
          const InitAblyConnection = async(sessionID: string) => {
  
            const realtime = new Ably.Realtime(client)
            const channel = realtime.channels.get('webrtc-signaling-channel')
            await channel.subscribe('WebRTC-client-register', async (message) => {
              console.log("Received ably message: ", message.data);
              if(message.data.role === 'Raspberry Pi'){
                console.log("message.data.role = ", message.data.role);
                console.log("message.data.sessionID = ", message.data.sessionID);
                piID.current = message.data.sessionID;//does this rerender the component? piID is a dependency
                console.log('piID.current inside:', piID.current);
                if(piID.current !== ''){
                  await channel.subscribe(piID.current, async (streamMessage) => {
                    console.log("Received streamMessage: ", streamMessage);
                    console.log('sentSignalingMessage.current:', sentSignalingMessage.current)
                    // if(sentSignalingMessage.current === false){
                    //   await channel.publish(piID.current, {
                    //     type: 'start_live_stream', 
                    //     target: piID.current,
                    //     camera_stream: true
                    //   })
                    //   sentSignalingMessage.current = true;
                    //   console.log('sentSignalingMessage.current:', sentSignalingMessage.current)
                    // }
                    if(streamMessage.data.type === 'offer'){
                      console.log("Received offer from: ", streamMessage.data.from);
                      try{
                        if(peerConnection.current){
                          peerConnection.current.close();
                          peerConnection.current = null;
                          // setPeerConnection(null);
                        }
                        // setPeerConnection(new RTCPeerConnection());
                        peerConnection.current = new RTCPeerConnection();
                        if(peerConnection.current){
                          peerConnection.current.onicecandidate = async(event) => {
                            if(event.candidate){
                              await channel.publish(piID.current,{
                                type: 'ice-candidate',
                                payload: event.candidate,
                                from: myID.current
                              })
                            }
                          };
                          peerConnection.current.ontrack = (event:RTCTrackEvent) => {
                            setRemoteStream(event.streams[0]);
                          };
                          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(streamMessage.data.payload));
                          const answer = await peerConnection.current.createAnswer();
                          await peerConnection.current.setLocalDescription(answer);
                          await channel.publish(piID.current,{
                            type: 'answer',
                            payload: answer,
                            from: myID.current
                          })
                        }
                      } catch (error){
                        console.error("Error handling offer: ", error);
                      }
                      // const answer = {
                      //   type: streamMessage.data.type,
                      //   payload: streamMessage.data.payload,
                      //   from: myID.current
                      // }
                      // await webRTCPeerChannel.publish(piID.current, answer);    
                    }
                    if(streamMessage.data.type === 'ice-candidate'){
                      console.log("Received ICE candidate");
                      try{
                        if(peerConnection.current)
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(streamMessage.data.payload)) 
                      } catch (error){
                        console.error("Error adding ICE candidate:", error);
                      }
                    }           
                    if(streamMessage.data.type === 'answer'){
                      console.log('Received answer');
                      try {
                          if(peerConnection.current)
                          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(streamMessage.data.payload));
                      } catch (error) {
                          console.error('Error setting remote description:', error);
                      }
                    }    
                  });
                }
                // const webRTCPeerChannel = realtime.channels.get(piID.current);
                
                // if(webRTCPeerChannel.current !== undefined){
                  
                // }
              }
            });
            const registrationMessage = {
              'role': 'Admin',
              'id': sessionID,
              'message':"Connect",
              'from':sessionID
            };
            await channel.publish('WebRTC-client-register', registrationMessage)
            console.log('piID.current outside:', piID.current);
            
            console.log('Sent registration message to ably: ', registrationMessage)
          }
          InitAblyConnection(currentSession.sessionID);
        } else {
          // setSessionData({ isLoggedIn: currentSession.isLoggedIn });
          alert("Please login again.")
        }
      });
    }, [sessionData]);
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);
  return (
    <div>
      <h2>WebRTC Video Stream</h2>
      {remoteStream ? (
        <video ref={videoRef} autoPlay playsInline />
      ) : ( 
        <p>Waiting for video stream...</p>
      )}
      {/* <div>
      <input type="text" value={targetId} onChange={handleTargetIdChange} placeholder="Enter target ID" />
      <button onClick={handleMakeOffer}>Make Offer</button>
      {remoteStream && (
        <video ref={(video) => {
          if (video) {
            video.srcObject = remoteStream;
          }
        }} autoPlay playsInline />
      )}
    </div> */}
    </div>
    
  );
};


export default AblyConnectionComponent;