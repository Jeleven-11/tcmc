'use client';

import { useEffect, useRef, useState } from 'react';
import * as Ably from 'ably';

const RealtimeDisplay = () => {
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [webRTCClients, setWebRTCClients] = useState(null);
  const ably = useRef(null);
  const channel = useRef(null);

  useEffect(() => {
    const initAbly = async () => {
      try {
        ably.current = new Ably.Realtime({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY });
        channel.current = ably.current.channels.get('webrtc-signaling-channel');

        // Initialize WebRTC clients map in local storage
        const storedClients = localStorage.getItem('webRTCClients');
        if (storedClients) {
            const parsedClients = new Map(JSON.parse(storedClients));
            setWebRTCClients(parsedClients);
        }

        channel.current.subscribe(async (msg) => {
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

    const handleRegister = (data) => {
        setWebRTCClients(prevClients => {
            webRTCClients.current = Map(prevClients);
            webRTCClients.current.set(data.id, {
                role: data.role,
                id: data.id
            });
            console.log('Registered client with ID:', data.id);
            console.log('webRTCClients: ', newClients);

            // Store updated clients in local storage
            // localStorage.setItem('webRTCClients', JSON.stringify(Array.from(newClients.entries())));
            return newClients;
        });
    };

    const handleOffer = async (data) => {
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
    

      peerConnection.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          channel.current?.publish('message', {
            type: 'ice-candidate',
            payload: event.candidate,
            target: data.from // Send to the offer initiator
          });
        }
      };

      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.payload));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      channel.current?.publish('message', {
        type: 'answer',
        payload: answer,
        target: data.from // Send to the offer initiator
      });
      }catch(error){
        console.error('Error during offer handling:', error);
      }
    };

    const handleAnswer = async (data) => {
      try {
        if (peerConnection) {
            console.log('answer data: ', data.payload)
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.payload));
        }
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    };

    const handleIceCandidate = async (data) => {
      try {
        if (peerConnection) {
          await peerConnection.addIceCandidate(data.payload);
        }
      } catch (error) {
        console.error('Error adding ice candidate:', error);
      }
    };

    const handleRequestStream = async (data) => {
      console.log('Received request stream message: ', data);
      // Implement your logic to handle stream requests
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

  return (
    <div>
      <h2>WebRTC Video Stream</h2>
      {remoteStream ? (
        <video autoPlay playsInline srcObject={remoteStream} />
      ) : (
        <p>Waiting for video stream...</p>
      )}
    </div>
  );
};

export default RealtimeDisplay;