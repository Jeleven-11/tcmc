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
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  // const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [webRTCPeerChannel, setWebRTCPeerChannel] = useState<Ably.RealtimeChannel>();
  const myID = useRef<string | null>(null);
  const sentSignalingMessage = useRef<boolean>(false);
  const [sessionData, setSessionData] = useState<SessionData>(null);
  
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
          const InitAblyConnection = async(sessionID: string) => {
  
            const realtime = new Ably.Realtime(client)
            const channel = realtime.channels.get('webrtc-signaling-channel')
            await channel.subscribe('WebRTC-client-register', async (message) => {
              console.log("Received ably message: ", message.data);
              if(message.data.role === 'Raspberry Pi'){
                console.log("message.data.role = ", message.data.role);
                setWebRTCPeerChannel(realtime.channels.get(message.data.id));
                if(webRTCPeerChannel){
                  await webRTCPeerChannel?.subscribe('Stream', async (streamMessage) => {
                    if(sentSignalingMessage.current === false){
                      await webRTCPeerChannel?.publish('Stream', {
                        type: 'start_live_stream', 
                        target: message.data.id,
                        camera_stream: true
                      })
                      sentSignalingMessage.current = true;
                    }
                    if(streamMessage.data.type === 'offer'){
                      console.log("Received offer from: ", streamMessage.data.from);
                      try{
                        if(peerConnection){
                          peerConnection.close();
                          setPeerConnection(null);
                        }
                        setPeerConnection(new RTCPeerConnection());
                        if(peerConnection){
                          peerConnection.onicecandidate = async(event) => {
                            if(event.candidate){
                              await webRTCPeerChannel.publish('Stream',{
                                type: 'ice-candidate',
                                payload: event.candidate,
                                from: myID.current
                              })
                            }
                          };
                          peerConnection.ontrack = (event:RTCTrackEvent) => {
                            setRemoteStream(event.streams[0]);
                          };
                          await peerConnection.setRemoteDescription(new RTCSessionDescription(streamMessage.data.payload));
                          const answer = await peerConnection.createAnswer();
                          await peerConnection.setLocalDescription(answer);
                          await webRTCPeerChannel.publish('Stream',{
                            type: 'answer',
                            payload: answer,
                            from: streamMessage.data.from.id
                          })
                        }
                      } catch (error){
                        console.error("Error handling offer: ", error);
                      }
                      const answer = {
                        type: streamMessage.data.type,
                        payload: streamMessage.data.payload,
                        from: myID.current
                      }
                      await webRTCPeerChannel.publish('Stream', answer);    
                    }
                    if(streamMessage.data.type === 'ice-candidate'){
                      console.log("Received ICE candidate");
                      try{
                        await peerConnection?.addIceCandidate(new RTCIceCandidate(streamMessage.data.payload)) 
                      } catch (error){
                        console.error("Error adding ICE candidate:", error);
                      }
                    }           
                    if(streamMessage.data.type === 'answer'){
                      console.log('Received answer');
                      try {
                          await peerConnection?.setRemoteDescription(new RTCSessionDescription(streamMessage.data.payload));
                      } catch (error) {
                          console.error('Error setting remote description:', error);
                      }
                    }    
                  });
                }
              }
            });
            const registrationMessage = {
              'role': 'Admin',
              'id': sessionID,
              'message':"Connect"
            };
            await channel.publish('WebRTC-client-register', registrationMessage)
            console.log('Sent registration message to ably: ', registrationMessage)
          }
          InitAblyConnection(currentSession.sessionID);
        } else {
          // setSessionData({ isLoggedIn: currentSession.isLoggedIn });
          alert("Please login again.")
        }
      });
    }, [sessionData, webRTCPeerChannel, peerConnection]);
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