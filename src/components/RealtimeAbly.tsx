'use client';

import { useEffect, useRef, useState } from 'react';
import * as Ably from 'ably';
import { getSession } from '@/app/lib/actions';

type SessionData = {
  sessionID: string;
} | null;

const AblyConnectionComponent = () => {
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const realtime = useRef<Ably.Realtime | null>(null);
  const channel = useRef<Ably.RealtimeChannel | null>(null);
  // const remoteStream = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const myID = useRef<string | null>(null);
  const [myIDState, setMyIDState] = useState<boolean>(false);
  const piID = useRef<string>('');
  const videoStreamSrc = useRef<MediaStream | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [sessionData, setSessionData] = useState<SessionData>(null);
  // const [isRemoteStreamSet, setIsRemoteStreamSet] = useState<boolean>(false);
  useEffect(() => {
    setIsClient(true);
    // if (videoRef.current && videoStreamSrc.current) {
    //   videoRef.current.srcObject = videoStreamSrc.current;
    //   console.log("📹 Video stream assigned in useEffect.");
    // }
  }, [isClient]);
  useEffect(() => {
    // setIsClient(true);
    if (videoRef.current && videoStreamSrc.current) {
      videoRef.current.srcObject = videoStreamSrc.current;
      console.log("📹 Video stream assigned in useEffect.");
    }
  }, [videoStreamSrc]);
  useEffect(() => {
    // Initialize Ably instance
    realtime.current = new Ably.Realtime({
      key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
      transportParams: { heartbeatInterval: 15000 },
    });

    channel.current = realtime.current.channels.get('webrtc-signaling-channel');

    return () => {
      console.log('Closing Ably connection...');
      if (realtime.current) realtime.current.close();
    };
  }, []);

  useEffect(() => {
    // if (!channel.current) return;

    async function InitWebRTC() {
      if (!channel.current){
        console.log('channel.current is null');
        return;
      };

      const handleSignalingMessage = async (message: Ably.Message) => {
        const { type, from, target, payload, role, sessionID } = message.data;
        
        if (role !== 'Raspberry Pi' && target !== myID.current && from === myID.current) return;

        console.log('Received message from Raspberry Pi:', message.data);

        // if (!peerConnection.current) {
        //   peerConnection.current = new RTCPeerConnection({
        //     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        //   });

          

        //   peerConnection.current.ontrack = (event) => {
        //     event.streams[0].getTracks().forEach((track) => {
        //       remoteStream.current?.addTrack(track);
        //     });
        //   };

        //   peerConnection.current.onicecandidate = async (event) => {
        //     if (event.candidate) {
        //       await channel.current?.publish('WebRTC-client-register', {
        //         type: 'ice-candidate',
        //         payload: event.candidate,
        //         from: myID.current,
        //         target: piID.current,
        //       });
        //     }
        //   };
        // }
        if (type === 'Connect' && sessionID !== myID.current){
          if (!channel.current){
            console.log('channel.current is null in icecandidate');
            return;
          };
          const registrationMessage = {
            role: 'Admin',
            id: myID.current,
            type: 'Connect',
            from: myID.current,
            camera_stream: true,
          };
    
          await channel.current.publish('WebRTC-client-register', registrationMessage);
          console.log('Sent registration message:', registrationMessage);
        }
        if (type === 'Data'){
          /*
          TO BE UPDATED...
          Data from Raspberry Pi: {
            "role": "Raspberry Pi",
            "sessionID": self.raspberry_pi_id,
            "type": "Data",
            "data": {
              "predictions": [
                {
                  "id": "1",
                  "label": "Car",}
                },
                {
                  "id": "2",
                  "label": "Truck",}
                }
              ]
          }
          */
        }
        if (type === 'offer' && from !== myID.current && target === myID.current) {
          
          console.log('Received WebRTC offer from:', from);
          piID.current = sessionID;
          // setPiIDState(sessionID);
          // if(piID.current==='')piID.current=piIDState;

          try {
            if(peerConnection.current){
              peerConnection.current.close();
              peerConnection.current = null;
            }
            peerConnection.current = new RTCPeerConnection({
              iceServers: [//{ 
                // urls: 'stun:stun.l.google.com:19302' },
                // {
                //   urls: 'turn:relay1.expressturn.com:3478',
                //   username: 'efQSLPKFVR1ANJGAHL',
                //   credential: 'p1CPPouohCkB1MO2'
                // },
                {
                  urls: "stun:stun.relay.metered.ca:80",
                },
                {
                  urls: "turn:global.relay.metered.ca:80",
                  username: "0a3a9293f3f8dd410138e0fb",
                  credential: "JAYpV4YyYPL7JwX+",
                },
                {
                  urls: "turn:global.relay.metered.ca:80?transport=tcp",
                  username: "0a3a9293f3f8dd410138e0fb",
                  credential: "JAYpV4YyYPL7JwX+",
                },
                {
                  urls: "turn:global.relay.metered.ca:443",
                  username: "0a3a9293f3f8dd410138e0fb",
                  credential: "JAYpV4YyYPL7JwX+",
                },
                {
                  urls: "turns:global.relay.metered.ca:443?transport=tcp",
                  username: "0a3a9293f3f8dd410138e0fb",
                  credential: "JAYpV4YyYPL7JwX+",
                },
              ],
            })
            peerConnection.current.onicecandidate = async (event) => {
              console.log('Received ICE candidate:', event.candidate);
              console.log('From:', from);
              if (!channel.current){
                console.log('channel.current is null in icecandidate');
                return;
              };
              if (event.candidate) {
                await channel.current.publish('WebRTC-client-register', {
                  type: 'ice-candidate',
                  payload: event.candidate,
                  from: myID.current,
                  target: piID.current,
                  role: 'Admin'
                });
              }
            };
            // remoteStream.current = new MediaStream();
            // if (videoRef.current) {
            //   videoRef.current.srcObject = remoteStream.current;
            // }
            peerConnection.current.ontrack = (event) => {
              const stream = event.streams[0];
              const tracks = stream.getTracks();
              const videoTrack = tracks.find((track) => track.kind === "video");
            
              console.log("🎥 Received MediaStream:", stream);
              console.log("🎵 Tracks:", tracks);
              console.log("📡 Receivers:", peerConnection.current?.getReceivers());
            
              if (!tracks.length) {
                console.error("⚠️ No tracks received! Check WebRTC sender.");
                return;
              }
            
              if (!videoTrack) {
                console.error("❌ No video track received.");
                return;
              }
            
              console.log(`🔹 Track type: ${videoTrack.kind}, Enabled: ${videoTrack.enabled}`);
              console.log("✅ Video track detected");
            
              const assignVideoStream = () => {
                if (!videoRef.current) {
                  console.error("❌ videoRef is NULL! Retrying in 500ms...");
                  setTimeout(assignVideoStream, 500);
                  return;
                }
            
                console.log("📹 Video stream assigned.");
                videoStreamSrc.current = stream; // Store in ref
                videoRef.current.srcObject = stream; // Assign to video element
                videoRef.current.load(); // Force a refresh
                videoRef.current.play().catch((e) => console.error('Error playing video:', e)); // Start playing the video
                console.log("🔄 Video stream refreshed.");
              };
            
              assignVideoStream();
            };
            
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload));
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            if (!channel.current){
              console.log('channel.current is null in answer');
              return;
            };
            await channel.current.publish('WebRTC-client-register', {
              type: 'answer',
              payload: answer,
              from: myID.current,
              target: piID.current,
              role: 'Admin'
            });
            console.log('Sent WebRTC answer:', {
              type: 'answer',
              payload: answer,
              from: myID.current,
              target: piID.current,
              role: 'Admin'
            });
          } catch (error) {
            console.error('Error handling offer:', error);
          }
        }

        if (type === 'ice-candidate' && peerConnection.current && from !== myID.current && target === myID.current) {
          try {
            console.log('Received ICE candidate from:', from);
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload));
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }

        if (type === 'answer' && peerConnection.current && from !== myID.current && target === myID.current) {
          try {
            console.log('Received WebRTC answer from:', from);
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload));
          } catch (error) {
            console.error('Error setting remote description:', error);
          }
        }
      };

      await channel.current.subscribe('WebRTC-client-register', handleSignalingMessage);

      const registrationMessage = {
        role: 'Admin',
        id: myID.current,
        type: 'Connect',
        from: myID.current,
        camera_stream: true,
      };

      await channel.current.publish('WebRTC-client-register', registrationMessage);
      console.log('Sent registration message:', registrationMessage);
    }
    if(myID.current!==null)InitWebRTC();

    return () => {
      console.log('Cleaning up WebRTC...');
      peerConnection.current?.close();
      if (channel.current){
        channel.current.unsubscribe('WebRTC-client-register');
        
      };
      
    };
  }, [myIDState]);
  // useEffect(() => {
  //   if (videoRef.current && remoteStream.current) {
  //     videoRef.current.srcObject = remoteStream.current;
  //     videoRef.current.play().catch((e) => console.error('Error playing video:', e));
  //   }
  // }, [remoteStream.current]);
  useEffect(() => {
    if (sessionData !== null) return;

    getSession().then(async (session) => {
      if (!session?.isLoggedIn) {
        alert('Please login again.');
        return;
      }

      setSessionData({ sessionID: session.sessionID });
      myID.current = session.sessionID;
      setMyIDState(true);
      console.log('User ID:', myID.current);
    });
  }, [sessionData]);

  return (
    <div>
      {isClient ? (
        <video ref={videoRef} className="w-full max-h-80 lg:max-h-96 rounded-lg"//w-full
        style={{ objectFit: 'contain' }}autoPlay playsInline muted //style={{ width: "100%", height: "auto"}} 
        />
      ) : (
        <p>Loading video...</p>
      )}
    </div>
  );
};

export default AblyConnectionComponent;
