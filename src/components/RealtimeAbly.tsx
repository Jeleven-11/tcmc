'use client';

import { useEffect, useRef, useState } from 'react';
import * as Ably from 'ably';
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
interface WebRTCClientInfo {
    role: string;
    id: string;
}
interface MessageType {
  type: string,
  id: string,
  role: string,
  payload: string,
  from?:string,
  target?:string
}
interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp: string;
}
export default function RealtimeDisplay () {
  // const [targetId, setTargetId] = useState('');
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [webRTCClients, setWebRTCClients] = useState<Map<string, WebRTCClientInfo>>(new Map());
  const ably = useRef<Ably.Realtime | null>(null);
  const [channelInstance, setChannelInstance] = useState<Ably.RealtimeChannel | null>(null);
  const [ownChannelInstance, setOwnChannelInstance] = useState<Ably.RealtimeChannel | null>(null);
  const [sessionData, setSessionData] = useState<SessionData>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);
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
          
        } else {
          // setSessionData({ isLoggedIn: currentSession.isLoggedIn });
          alert("Please login again.")
        }
      });
    }, []);
  useEffect(() => {
    const initAbly = async () => {
      try {
        // if(!ably.current)
        ably.current = new Ably.Realtime({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY });
        setChannelInstance(ably.current.channels.get('webrtc-signaling-channel'));
        if(sessionData===null) return;
        setOwnChannelInstance(ably.current.channels.get(`${sessionData.sessionID}`));
        if(ownChannelInstance===null) return;
        ownChannelInstance.subscribe(async (msg: Ably.Message) => {
          const data = msg.data;
          console.log('Received message: ', data);
          if (data.type === 'request-stream') {
            handleRequestStream(data);
          }
        })
        // channel.current = ably.current.channels.get('webrtc-signaling-channel');

        // Initialize WebRTC clients map in local storage
        // const storedClients = localStorage.getItem('webRTCClients');
        // if (storedClients) {
        //     const parsedClients = new Map(JSON.parse(storedClients));
        //     setWebRTCClients(parsedClients);
        // }
        if(channelInstance===null) return;
        channelInstance.subscribe(async (msg: Ably.Message) => {
          const data = msg.data;
          console.log('Received message: ', data);

          if (data.type === 'register') {
            handleRegister(data);
          } else if (data.type === 'offer') {
            handleOffer(data);
          } else if (data.type === 'answer') {
            handleAnswer(data);
          } else if (data.type === 'ice-candidate') {
            handleIceCandidate(data);
          } else if (data.type === 'request-stream') {
            handleRequestStream(data);
          }
        });
        console.log('Subscribed to webrtc-signaling-channel');
      } catch (error) {
        console.error("Ably error:", error);
      }
    };

    const handleRegister = (data: MessageType) => {
      setWebRTCClients(prevClients => {
        const newClients = new Map(prevClients);
        newClients.set(data.id, {
          role: data.role,
          id: data.id
        });
        console.log('Registered client with ID:', data.id);
        console.log('webRTCClients: ', webRTCClients);

            // Store updated clients in local storage
            // localStorage.setItem('webRTCClients', JSON.stringify(Array.from(newClients.entries())));
            return newClients;
        });
    };

    const handleOffer = async (data: MessageType) => {
      console.log('handleOffer, offer: ', data.payload)
      try{
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      setPeerConnection(peerConnection);

      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(localStream);
      
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    

      peerConnection.ontrack = (event:RTCTrackEvent) => {
        setRemoteStream(event.streams[0]);
      };

      peerConnection.onicecandidate = (event:RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          channelInstance!.publish('message', {
            type: 'ice-candidate',
            payload: event.candidate,
            target: data.from // Send to the offer initiator
          });
        }
      };
      const descriptionInit: RTCSessionDescriptionInit = {
        type: 'offer', // or 'answer', depending on the context
        sdp: data.payload,
      };
      await peerConnection.setRemoteDescription(new RTCSessionDescription(descriptionInit));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      channelInstance!.publish('message', {
        type: 'answer',
        payload: answer,
        target: data.from // Send to the offer initiator
      });
      }catch(error){
        console.error('Error during offer handling:', error);
      }
    };
    
    const handleAnswer = async (data: MessageType) => {
      try {
        const descriptionInit: RTCSessionDescriptionInit = {
          type: 'answer', // or 'answer', depending on the context
          sdp: data.payload,
        };
        if (peerConnection) {
            console.log('answer data: ', data.payload)
          await peerConnection.setRemoteDescription(new RTCSessionDescription(descriptionInit));
        }
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    };

    const handleIceCandidate = async (data: MessageType) => {
      try {
        if (peerConnection) {
          await peerConnection.addIceCandidate(JSON.parse(data.payload));
        }
      } catch (error) {
        console.error('Error adding ice candidate:', error);
      }
    };

    const handleRequestStream = async (data: MessageType) => {
      console.log('Received request stream message: ', data);
      // Implement your logic to handle stream requests
      const targetClient = Array.from(webRTCClients.entries())
      .find(([, info]) => info.id === data.target);
      console.log(`Request Stream from: ${data.from} to: ${data.target}`);
      if (targetClient) {
        const channelName = `signaling-${data.target}`;
        if(ably.current === null) return;
        const channel = ably.current.channels.get(channelName);
        channel.publish('signaling-message', {
          type: 'offer',
          payload: 'Your signaling message payload here',
          from: data.from,
        });
      }
    };

    initAbly();

    return () => {
      if (ably.current && ably.current.connection.state !== 'closed') {
        ably.current.close();
      }
      // ably.current.close();
      if (peerConnection) {
        peerConnection.close();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  // const handleTargetIdChange = (event:React.FormEvent<HTMLFormElement>) => {
  //   setTargetId(event.target.value);
  // };
  // const handleMakeOffer = async () => {
  //   if (!peerConnection) {
  //     const pc = new RTCPeerConnection({
  //       iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  //     });
  //     setPeerConnection(pc);
  //   }

  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  //     setLocalStream(stream);

  //     stream.getTracks().forEach((track) => {
  //       peerConnection.addTrack(track, stream);
  //     });

  //     const offer = await peerConnection.createOffer();
  //     await peerConnection.setLocalDescription(new RTCSessionDescription({ type: 'offer', sdp: offer }));
  //     setOffer(offer);

  //     channelInstance.publish('message', {
  //       type: 'offer',
  //       payload: offer,
  //       target: targetId,
  //     });
  //   } catch (error) {
  //     console.error('Error making offer:', error);
  //   }
  // };

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

// export default RealtimeDisplay;