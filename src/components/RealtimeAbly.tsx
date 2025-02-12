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
  const remoteStream = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const myID = useRef<string | null>(null);
  const piID = useRef<string>('');
  // const [sessionIDState, setSessionIDState] = useState<string>('');
  const [sessionData, setSessionData] = useState<SessionData>(null);
  // const [isRemoteStreamSet, setIsRemoteStreamSet] = useState<boolean>(false);

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
    async function InitWebRTC() {
      if (!channel.current){
        console.log('channel.current is null');
        return;
      };

      const handleSignalingMessage = async (message: Ably.Message) => {
        const { type, from, payload, role, sessionID } = message.data;
        
        if (role !== 'Raspberry Pi') return;
        console.log('Received message from Raspberry Pi:', message.data);

        if (type === 'offer' && from !== myID.current) {
          
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
              iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
            })
            peerConnection.current.onicecandidate = async (event) => {
              console.log('Received ICE candidate:', event.candidate);
              if (!channel.current || !event.candidate) {
                console.log('channel.current or event.candidate is null in icecandidate');
                return;
              };
              console.log('Sending ICE candidate:', event.candidate);
              await channel.current.publish('WebRTC-client-register', {
                type: 'ice-candidate',
                payload: event.candidate,
                from: myID.current,
                target: piID.current,
                role: 'Admin'
              });
            };
            remoteStream.current = new MediaStream();
            if (videoRef.current) {
              videoRef.current.srcObject = remoteStream.current;
            }
            peerConnection.current.ontrack = (event) => {
              console.log('Received tracks:', event.streams[0].getTracks());
              event.streams[0].getTracks().forEach((track) => {
                if(remoteStream.current)
                remoteStream.current.addTrack(track);
              });
              // if (videoRef.current) {
              //   videoRef.current.srcObject = remoteStream.current;
              //   // videoRef.current.srcObject = event.streams[0]; // Directly assign the stream
              // }
              // videoRef.current?.play().catch((e) => console.error('Error playing video:', e));
            }
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

        if (type === 'ice-candidate' && peerConnection.current && from !== myID.current) {
          try {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload));
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }

        if (type === 'answer' && peerConnection.current && from !== myID.current) {
          try {
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
    InitWebRTC();

    return () => {
      console.log('Cleaning up WebRTC...');
      peerConnection.current?.close();
      peerConnection.current = null;
      remoteStream.current = null;
      if (channel.current){
        channel.current.unsubscribe('WebRTC-client-register');
      };
    };
  }, []);
  useEffect(() => {
    if (sessionData !== null) return;

    getSession().then(async (session) => {
      if (!session?.isLoggedIn) {
        alert('Please login again.');
        return;
      }

      setSessionData({ sessionID: session.sessionID });
      myID.current = session.sessionID;
      console.log('User ID:', myID.current);
      // setSessionIDState(session.sessionID);

    });
  }, [sessionData]);

  return (
    <div>
      <h2>WebRTC Video Stream</h2>
      <video ref={videoRef} autoPlay playsInline />
    </div>
  );
};

export default AblyConnectionComponent;
