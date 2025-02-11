'use client';

import { useEffect, useRef, useState } from 'react';
import * as Ably from 'ably';
// import { AblyProvider, useChannel, usePresence } from 'ably/react';
// import { RTCPeerConnection, RTCSessionDescription } from 'webrtc';
import { getSession } from '@/app/lib/actions';

type SessionData = {
  // isLoggedIn: boolean;
  // name?: string;
  // contact_num?: string;
  // role?: string;
  // email?: string;
  // authToken: string
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
  const realtime = useRef(new Ably.Realtime(client));
  const channel = useRef(realtime.current.channels.get('webrtc-signaling-channel'));
  // const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // const [videoState, setVideoState] = useState<HTMLVideoElement>(null);
  // const webRTCPeerChannel = useRef<Ably.RealtimeChannel>();
  const myID = useRef<string | null>(null);
  // const sentSignalingMessage = useRef<boolean>(false);
  const [sessionData, setSessionData] = useState<SessionData>(null);
  const piID = useRef<string>('');
  const [piIDState, setPiIDState] = useState<string|''>('')
    useEffect(() => {
      async function InitWebRTC() {
        if(piID.current==='' && piIDState !== ''){
          piID.current=piIDState;
        }
        try{
          await channel.current.subscribe('WebRTC-client-register', async (message) => {
            
            if(message.data.role === 'Raspberry Pi'){
              console.log("Received ably message from Raspberry Pi: ", message.data);
              peerConnection.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }], // Public STUN server
              });
              console.log("message.data.role = ", message.data.role);
              console.log("message.data.sessionID = ", message.data.sessionID);
              piID.current = message.data.sessionID;
              setPiIDState(piID.current)
              console.log('piID.current inside:', piID.current);
            
                console.log("Received streamMessage channel name piID.current: ", message);
                
                if(message.data.type === 'offer'){
                  console.log("Received offer from: ", message.data.from);
                  try{
                    // if(peerConnection.current){
                    //   peerConnection.current.close();
                    //   peerConnection.current = null;
                    // }
                    
                    // if(peerConnection.current){
                      remoteStream.current = new MediaStream();
                      videoRef.current!.srcObject = remoteStream.current;
                      peerConnection.current.ontrack = (event:RTCTrackEvent) => {
                        event.streams[0].getTracks().forEach((track) => {
                          remoteStream.current?.addTrack(track);
                        });
                        //setRemoteStream(event.streams[0]);
                      };
                      peerConnection.current.onicecandidate = async(event) => {
                        if(event.candidate){
                          await channel.current.publish('WebRTC-client-register',{
                            type: 'ice-candidate',
                            payload: event.candidate,
                            from: myID.current,
                            target: piID.current
                          })
                        }
                      };
                      
                      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(message.data.payload));
                      const answer = await peerConnection.current.createAnswer();
                      if (peerConnection.current.signalingState === 'have-remote-offer' || peerConnection.current.signalingState !== 'stable') {  
                        await peerConnection.current.setLocalDescription(answer);
                      }
                      await channel.current.publish('WebRTC-client-register',{
                        type: 'answer',
                        payload: answer,
                        from: myID.current,
                        target: piID.current
                      })
                    // }
                  } catch (error){
                    console.error("Error handling offer: ", error);
                  }   
                }
                if(message.data.type === 'ice-candidate'){
                  console.log("Received ICE candidate");
                  try{
                    if(peerConnection.current)
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(message.data.payload)) 
                  } catch (error){
                    console.error("Error adding ICE candidate:", error);
                  }
                }           
                if(message.data.type === 'answer'){
                  console.log('Received answer');
                  try {
                      if(peerConnection.current)
                      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(message.data.payload));
                  } catch (error) {
                      console.error('Error setting remote description:', error);
                  }
                }    
            }
          });
          const registrationMessage = {
            'role': 'Admin',
            'id': myID.current,
            'message':"Connect",
            'from': myID.current,
            'camera_stream': true
          };
          await channel.current.publish('WebRTC-client-register', registrationMessage)
          console.log('piID.current outside:', piID.current);
          
          console.log('Sent registration message to ably: ', registrationMessage)
        } catch (error){
          console.error(`Error encountered in Ably: `, error);
        } finally {
          return () => {
            console.log("Cleanup subscription here by unsubscribing... TODO...");
          }
        }
      }
      InitWebRTC();
      return () => {
        peerConnection.current?.close();
        // realtime.current.close();
      };
    })
    useEffect(() => {
      if(sessionData!==null) return;
      getSession().then(async (session) => {
        const currentSession = JSON.parse(JSON.stringify(session));
        if (currentSession.isLoggedIn) {
          setSessionData({
            sessionID: currentSession.sessionID
          });
          myID.current = currentSession.sessionID;
          console.log('myID.current: ', myID.current)
        } else {
          // setSessionData({ isLoggedIn: currentSession.isLoggedIn });
          alert("Please login again.")
        }
      });
    }, [sessionData]);
  // useEffect(() => {
  //   if (remoteStream) {
  //     console.log(remoteStream);
  //     console.log("Type: ", typeof remoteStream);
  //     // videoRef.current!.srcObject = remoteStream;
  //   }
  // }, [remoteStream]);
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