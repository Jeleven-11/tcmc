import asyncio
# import websockets
import json
import cv2
import sys
import base64
import subprocess
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from aiortc import VideoStreamTrack, RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, RTCConfiguration, RTCIceServer
from aiortc.contrib.media import MediaRecorder, MediaPlayer, MediaRelay
from av import VideoFrame
import os
import jwt
import time
import pytz
from ultralytics import YOLO
# from websockets.exceptions import ConnectionClosedError
from datetime import datetime, timedelta, timezone
import torch
from torch.utils.data import DataLoader, SubsetRandomSampler
from torch import optim
from torch.optim.lr_scheduler import MultiStepLR
from torch.utils.tensorboard import SummaryWriter
from torchvision import datasets, transforms
# from facenet_pytorch import MTCNN, InceptionResnetV1, fixed_image_standardization, training
import pandas as pd
from PIL import Image, ImageEnhance
from picamera2 import Picamera2
import libcamera
import uuid
import requests
import io
import random
from pathlib import Path
import atexit
import logging
from ably import AblyRealtime
# import the InferencePipeline interface
from inference_sdk import InferenceHTTPClient
# import a built in sink called render_boxes (sinks are the logic that happens after inference)
from inference.core.interfaces.stream.sinks import render_boxes

# logging.basicConfig(level=logging.DEBUG)
# from gpiozero import PWMLED
# --- LOGGING CONFIGURATION --- #
# log_directory = '/home/myboardhub/mctc/YOLOv11/LOGS'
# log_file_name="service" + datetime.now(pytz.timezone('Asia/Manila')).strftime("%Y-%m-%d_%H:%M:%S") + ".log"
# log_file = os.path.join(log_directory, log_file_name)
# os.makedirs(log_directory, exist_ok=True)
# logging.basicConfig(
#     filename=log_file,
#     level=logging.DEBUG,  # Use DEBUG for detailed logs, INFO for general logs
#     format='%(asctime)s - %(levelname)s - %(message)s',
#     datefmt='%Y-%m-%d %H:%M:%S'
# )
# --- CONFIGURATION --- #
SERVER_URL = "tcmc.vercel.app"
ABLY_API_KEY = os.environ.get("ABLY_API_KEY")

websocket_status = "Disconnected"
camera = None
stream = None
pc = None
executor = ThreadPoolExecutor(max_workers=2)

# --- WebRTC Data Configurations --- #
local_tz = pytz.timezone("Asia/Manila")


now_live = False
isCameraConfigured = False
surveillanceTask = None




def get_wifi_ssid():
    result = subprocess.run(['iwgetid'], stdout=subprocess.PIPE)
    ssid = result.stdout.decode().strip()
    return ssid

def count_immediate_folders(parent_folder):
    try:
        # List all entries in the parent_folder
        entries = os.listdir(parent_folder)
        
        # Filter only directories
        subfolders = [entry for entry in entries if os.path.isdir(os.path.join(parent_folder, entry))]
        
        # Count and return the number of subfolders
        return len(subfolders)
    except FileNotFoundError:
        print(f"The folder '{parent_folder}' does not exist.")
        return 0
    except Exception as e:
        print(f"An error occurred: {e}")
        return 0

def get_cpu_serial():
    try:
        with open('/proc/cpuinfo', 'r') as f:
            for line in f:
                if line.strip().startswith('Serial'):
                    return line.strip().split(':')[1].strip()
    except Exception as e:
        print(f"Error getting CPU serial: {e}")
        return None

def generate_token(device_id):
    secret_key = os.environ.get("AUTH_SECRETKEY")
    if not secret_key:
        print("Error: AUTH_SECRETKEY environment variable not set.")
        exit(1)
    payload = {
        'raspberry_pi_id' : device_id,
        'AccountType': 'Raspberry Pi',
        'exp' : datetime.now(timezone.utc) + timedelta(days=1)
    }
    token = jwt.encode(payload, secret_key, algorithm = 'HS256')
    print("Generated token.")
    return token#.decode()

myCamera = None
def get_camera():
    global myCamera
    if myCamera is None:
        frame_width = 1280#640#480#640#1280#1920
        frame_height = 720#360#270#360#720#1080
        # Initialize Picamera2
        myCamera = Picamera2()
        camera_config = myCamera.create_preview_configuration(main={"size": (frame_width, frame_height)})
        myCamera.configure(camera_config)
        # myCamera.start()
    return myCamera

surveillance_running = True
async def surveillance_loop():
    global surveillance_running, stream
    while True:
        if surveillance_running:
            stream.surveillanceMode
            await asyncio.sleep(0.04)
def setup_model():
    model_path = "YOLOv11/runs/detect/train5/weights/best.pt"  # Path to the best model
    # device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = YOLO(model_path)
    return model

def release_camera():
    global myCamera
    if myCamera is not None:
        myCamera.close()
        myCamera = None
        print("Camera released.")

def parse_candidate(candidate_str):
    parts = candidate_str.split(" ")
    candidate = {
        "foundation": parts[0].split(":")[1],
        "component": int(parts[1]),
        "priority": int(parts[3]),
        "ip": parts[4],
        "port": int(parts[5]),
        "type": parts[7],
        "protocol": parts[2],
        "relatedAddress": None,
        "relatedPort": None,
        "sdpMid": None,
        "sdpMLineIndex": None,
        "tcpType": None
    }
    return candidate
        
async def close_web_rtc_session(peer_id, peer_connections):
    global pc
    if peer_id in peer_connections:
        pc = peer_connections[peer_id]
        # Stop all transceivers and their tracks
        for transceiver in pc.getTransceivers(): 
            if transceiver.sender.track: 
                transceiver.sender.track.stop() 
            if transceiver.receiver.track: 
                transceiver.receiver.track.stop() 
            # Close the PeerConnection
            await pc.close() 
            del peer_connections[peer_id]
            print(f"Cleaned up peer connection for --> {peer_id}.")
            pc = None 
            print("WebRTC session closed")
async def cleanup_peer_connection(peer_id, peer_connections):
    # global peer_connections
    if peer_id in peer_connections:
        try:
            pc = peer_connections[peer_id]
            await pc.close()

            for sender in pc.getSenders():
                track = sender.track
                if track:
                    track.stop()

            del peer_connections[peer_id]
            print(f"Cleaned up peer connection for {peer_id}.")
            
        except Exception as e:
            print(f"Error cleaning up peer connection {peer_id}: {e}")
    print(f"peer is not found: {peer_id}")
    return

class WebRTCConnection():
    def __init__(self):
        self.peer_connections = {}
        self.media_relay = MediaRelay()
        # self.webRTCChannel = None
        self.ably_client = AblyRealtime(ABLY_API_KEY)
        self.webRTCChannel=self.ably_client.channels.get('webrtc-signaling-channel')
        self.newPeerId = None
        self.stream = None
        self.relayed_stream = None
        self.isRecording = False
        self.rtc_config = RTCConfiguration(
        iceServers=[
            # RTCIceServer("stun:stun.l.google.com:19302"),
            RTCIceServer(
                "turn:relay1.expressturn.com:3478",
                username="efQSLPKFVR1ANJGAHL",
                credential="p1CPPouohCkB1MO2"
            )
        ]
    )
    class CameraStreamTrack(VideoStreamTrack):
        def __init__(self, parent):
            super().__init__()
            # global camera, isCameraConfigured
            global isCameraConfigured
            # self.camera = camera
            self.parent = parent
            self.camera = None
            self.workers = 0 if os.name == 'nt' else 4 
            # --- Camera Setup ---
            output_folder = os.path.join(os.getcwd(), "Recordings")

            # Create the output folder if it doesn't exist
            if not os.path.exists(output_folder):
                os.makedirs(output_folder)
            self.video_output = os.path.join(output_folder, "rec_video"+ datetime.now(pytz.timezone('Asia/Manila')).strftime("%Y%m%d_%H%M%S") +".mp4")
            self.frame_rate = 30
            self.frames_to_save = []
            self.frame_buffer_size =  1 * 60 * self.frame_rate # 1 minute
            # Initialize the video writer
            self.fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec for .mp4
            self.out = cv2.VideoWriter(self.video_output, self.fourcc, 30, (640, 480))
            self.temp_file = 'temp.raw'
            # Define the FFmpeg command
            self.command = [
                "ffmpeg",
                "-y",
                "-f", "rawvideo",
                "-pix_fmt", "bgr24",
                "-s", "1280x720",
                "-r", "30",
                "-i", self.temp_file,
                "-c:v", "libx264",
                "-crf", "18",
                "-pix_fmt", "yuv420p",
                self.video_output
            ]

            atexit.register(self.cleanup)
            self.initializeCamera()
            # --- Model Setup ---
            self.inference_client = InferenceHTTPClient(api_url="https://detect.roboflow.com", api_key="YdtoLOJufCKAjGZC1IkJ")
            # self.model = self.inference_client.get_model("local-vehicles-opjyd/10")
            self.model_id = "local-vehicles-opjyd/10"
            # start the pipeline
            # self.pipeline.start()
            self.raspberry_pi_id = get_cpu_serial()
            self.latest_frame = None
            self.latest_predictions = []
            self.frame_count = 0
            self.rec_frame_count = 0
            self.rec_flag = False
            self.rec_frames = []
            self.isSavingVideo = False
            self.isBufferFull = False
            # self.save_task = asyncio.create_task(self.save_video_task())
            self.vehiclesClass = [0,1,2,3,4,5]#0-Bus, 1-Car, 2-Motor, 3-Tricycle, 4-Truck, 5-Van
            print("Set frame count to 0")
            self.running = False
            self.start_time = time.time() 
            print("Initialize complete")
        async def save_video_task(self):
            while True:
                if self.isBufferFull:
                    # Save the video frames
                    print("Saving video...")
                    await self.save_video(self.frames_to_save)
                    self.isBufferFull = False
                await asyncio.sleep(0.5) 
        async def add_frame(self, frame):
            self.frames_to_save.append(frame)
            # print("Buffer size:", len(self.frames_to_save))
            if len(self.frames_to_save) >= self.frame_buffer_size and not self.isSavingVideo:
                self.isBufferFull = True
                await self.save_video(self.frames_to_save)

        def process_prediction(self, result, frame):
            # Print the result structure
            print("Result structure:", result)

            # Process the result (draw bounding boxes)
            if isinstance(result, list) and len(result) > 0:
                predictions = result[0].get('predictions', [])
            elif isinstance(result, dict):
                predictions = result.get('predictions', [])
            else:
                predictions = []
            for prediction in predictions:
                # Extract bounding box coordinates
                x1 = int(prediction['x'] - prediction['width'] / 2)
                y1 = int(prediction['y'] - prediction['height'] / 2)
                x2 = int(prediction['x'] + prediction['width'] / 2)
                y2 = int(prediction['y'] + prediction['height'] / 2)
                
                # Draw bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                
                # Prepare label text
                label = f"{prediction['class']} {prediction['confidence']:.2f}"
                
                # Draw label background
                (label_width, label_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                cv2.rectangle(frame, (x1, y1 - label_height - 10), (x1 + label_width, y1), (0, 255, 0), -1)
                
                # Draw label text
                cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
            return frame


        def initializeCamera(self):
            # global camera, isCameraConfigured
            global isCameraConfigured
            retry_attempts = 3
            for attempt in range(retry_attempts):
                # if self.camera is None and camera is None:
                if self.camera is None:
                    try:
                        print("Setting camera to Picamera2")
                        self.camera = get_camera()
                        self.camera.start()
                        print("Started camera")
                        isCameraConfigured = True
                        break
                    except Exception as ex:
                        print(f"Error initializing camera: {ex}")
                        # logging.error(f"Error initializing camera: {ex}")
                        self.cleanup()
                        if attempt < retry_attempts - 1:
                            print("Retrying camera initialization...")
                            time.sleep(2)
                        else:
                            print("Failed to initialize camera after multiple attempts.")
                            raise
        
        
        def cleanup(self):
            """Release camera resources."""
            try:
                if hasattr(self, 'camera') and self.camera is not None:
                    print("Stopping and releasing camera resources")
                    self.camera.stop()
                    self.camera = None
                    
            except Exception as e:
                print(f"Failed to initialize camera after multiple attempts. Cleaning failed: {e}")
        
            try:
                if hasattr(self, 'model') and self.model is not None:
                    print("Releasing Plate Detection Model resources")
                    del self.model
                    self.model = None
            except Exception as e:
                print(f"Error during Plate Detection Model cleanup: {e}")

            # self.save_task.cancel()
            print("Camera cleanup complete")

        async def stopClass(self):
            """Release resources and stop the stream."""
            print("Stopping CameraStreamTrack...")
            atexit._run_exitfuncs()
            self.cleanup()

        def surveillanceMode(self):
            try:
                frame = self.camera.capture_array() 
                self.frame_count += 1
                start_time = time.time()
                if self.frame_count % 2 != 0:
                    return
                
                img = Image.fromarray(frame)
                # Pipeline here...
                if self.frame_count % 60 == 0:
                    fps = 1 / (time.time() - start_time)
                    print(f"\rCurrent FPS: {fps:.2f}")  
                
                if self.frame_count >= 600:
                    self.frame_count = 1 #Reset number
                            
            except Exception as e:
                print(f"Error during camera capture: {e}")
                logging.error(f"Error during camera capture: {e}")
                self.cleanup()
                raise
        
        async def surveillance_loop(self):
            if not self.running:
                print("Started processing frames")
                self.running = True
            while self.running:
                await self.surveillanceMode()
                await asyncio.sleep(0.04)

        async def save_video(self, frames):
            self.isSavingVideo = True
            output_folder = os.path.join(os.getcwd(), "Recordings")

            # Create the output folder if it doesn't exist
            if not os.path.exists(output_folder):
                os.makedirs(output_folder)
            self.video_output = os.path.join(output_folder, "rec_video"+ datetime.now(pytz.timezone('Asia/Manila')).strftime("%Y%m%d_%H%M%S") +".mp4")
            # self.video_output = "rec_video"+ datetime.now(pytz.timezone('Asia/Manila')).strftime("%Y%m%d_%H%M%S") +".mp4"
            self.temp_file = 'temp.raw'
            self.command = [
                "ffmpeg",
                "-y",
                "-f", "rawvideo",
                "-pix_fmt", "bgr24",
                "-s", "1280x720",
                "-r", "30",
                "-i", self.temp_file,
                "-c:v", "libx264",
                "-crf", "18",
                "-pix_fmt", "yuv420p",
                self.video_output
            ]

            with open(self.temp_file, 'wb') as f:
            # with os.open(self.temp_file, os.O_WRONLY | os.O_TRUNC) as f:
                for frame in frames:
                    f.write(frame.tobytes())

            subprocess.run(self.command)

            os.remove(self.temp_file)
            # Clear the buffer
            self.frames_to_save.clear()
            # self.frames_to_save = []
            print("Video saved. Buffer cleared.")
            self.isSavingVideo = False
            await self.parent.webRTCChannel.publish("WebRTC-client-register", {
                    "role": "Raspberry Pi",
                    "sessionID": self.raspberry_pi_id,
                    "message": "Saved video as " + self.video_output})
            # await asyncio.sleep(5)
            # Update the video output file name and the command
            
        async def recv(self):
            # global camera
            global now_live
            try:
                # frame = camera.capture_array()
                frame = self.camera.capture_array() # A Picamera2
                self.frame_count += 1
                
                if frame.shape[2] == 4:
                    frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)
                if self.frame_count % 3 != 0: # skip frames (This is OPTIONAL and can be removed)
                    if self.parent.isRecording:
                        await self.add_frame(frame)
                    video_frame = VideoFrame.from_ndarray(frame, format="bgr24")
                    video_frame.pts, video_frame.time_base = await self.next_timestamp()
                    return video_frame

                result = self.inference_client.infer(frame, model_id = self.model_id)
                await self.parent.webRTCChannel.publish("WebRTC-client-register", {
                    "role": "Raspberry Pi",
                    "sessionID": self.raspberry_pi_id,
                    "data": result})
                vehicles_frame = self.process_prediction(result, frame)
                frame = vehicles_frame
                if self.parent.isRecording:
                    await self.add_frame(frame)
                

                if self.frame_count % 30 == 0:
                    elapsed_time = time.time() - self.start_time
                    if elapsed_time > 0:
                        fps = 30 / elapsed_time
                        print(f"\rCurrent FPS: {fps:.2f}")
                        self.start_time = time.time()  # Reset timer
                        now_live = True
            
                if self.frame_count >= 600000:
                    self.frame_count = 1 #Reset number

                # Temporarily preview vehicle detection
                video_frame = VideoFrame.from_ndarray(frame, format="bgr24")
                video_frame.pts, video_frame.time_base = await self.next_timestamp()

                return video_frame
            except Exception as e:
                print(f"Error during camera capture: {e}")
                # logging.error(f"Error during camera capture: {e}")
                self.cleanup()
                exit(1)
                raise
    
    async def on_icecandidate(self, candidate):
        raspberry_pi_id = get_cpu_serial()
        print("ICE candidate event triggered")
        if candidate:
            candidatePayload = {
                "type": "ice-candidate",
                "payload": {
                    "candidate": candidate.candidate,
                    "sdpMid": candidate.sdpMid,
                    "sdpMLineIndex": candidate.sdpMLineIndex,
                },
                "from": raspberry_pi_id,
                "target": self.newPeerId,
                "role": "Raspberry Pi",
                "sessionID": raspberry_pi_id
            }
            # print('sending candidate to {peer_id} : {candidatePayload}')
            await self.webRTCChannel.publish('WebRTC-client-register', candidatePayload)
    async def on_connectionstatechange(self, peer_id):
        if self.peer_connections[peer_id].connectionState in ["failed", "disconnected", "closed"]:
            print(f"Connection state {self.peer_connections[peer_id].connectionState} for peer {peer_id}. Cleaning up. Live stream")
            await self.cleanup_peer_connection(peer_id)
            now_live = False
            print("Resumed surveillance mode...")
    async def createOfferPayload(self, peer_id):
        raspberry_pi_id = get_cpu_serial()
        offer = await self.peer_connections[peer_id].createOffer()
        await self.peer_connections[peer_id].setLocalDescription(offer)
        offerPayload = {
            "type": "offer",
            "payload":{
                "sdp": self.peer_connections[peer_id].localDescription.sdp,
                "type": self.peer_connections[peer_id].localDescription.type
            },
            "from": raspberry_pi_id,
            "target": peer_id,
            "role": "Raspberry Pi",
            "sessionID": raspberry_pi_id
        }
        print(f"Will send offer to: {peer_id}")
        await self.webRTCChannel.publish('WebRTC-client-register', offerPayload)
        print(f"Sent offer to: {peer_id}")
    async def add_peer(self, peer_id, data=None):
        raspberry_pi_id = get_cpu_serial()
        self.newPeerId = peer_id
        if peer_id not in self.peer_connections:
            self.peer_connections[peer_id] = RTCPeerConnection(self.rtc_config)
            # print(f"Using transport: {self.rtc_config.iceTransportPolicy}")
            self.peer_connections[peer_id].on("connectionstatechange", lambda: self.on_connectionstatechange(peer_id))
            self.peer_connections[peer_id].on("icecandidate", lambda: self.on_icecandidate)
            print(f"Peer Connections: {self.peer_connections}")
            if data.get('camera_stream', False):
                global stream, surveillance_running
                if stream is None:
                    # stream = CameraStreamTrack()
                    print("Start CameraStreamTrack")
                elif surveillance_running:
                    print('Stream is running, now stopping...')
                    surveillance_running = False
                    print("Paused surveillance mode...")
                    surveillanceTask.cancel()
                print("Starting WebRTC Mode...")
                if self.stream is None:
                    self.stream = self.CameraStreamTrack(self)
                    if self.relayed_stream is None:
                        self.relayed_stream = self.media_relay.subscribe(self.stream)
                self.peer_connections[peer_id].addTrack(self.stream)##swapped out self.relayed_stream to test if media_relay is the cause of lag
                # self.peer_connections[peer_id].addTrack(self.relayed_stream)#
            await self.createOfferPayload(peer_id)
            
    async def cleanup_peer_connection(self, peer_id):
        # self.pc = self.peer_connections[peer_id]
        if peer_id == 'all':
            for peer_id in list(self.peer_connections.keys()):
                await self.cleanup_peer_connection(peer_id)
        elif peer_id in self.peer_connections:
            pc = self.peer_connections[peer_id]
            if pc:
                pc.on("connectionstatechange", None)  
                pc.on("icecandidate", None)
                await pc.close()
                if peer_id in self.peer_connections:
                    del self.peer_connections[peer_id]
            print(f"Cleaned up peer connection for {peer_id}")
    async def ably_connection(self):
        # print(f"ABLY_API_KEY: {ABLY_API_KEY}")
        # secret_key = os.environ.get("AUTH_SECRETKEY")
        # print(f"AUTH_SECRETKEY: {secret_key}")
        # ably_client = AblyRealtime(ABLY_API_KEY)
        try:
            raspberry_pi_id = get_cpu_serial()
            # self.webRTCChannel=ably_client.channels.get('webrtc-signaling-channel')
                
            async def messageToMyID(message):
                data = message.data
                
                if data['role'] == 'Admin':
                    # print(f"Data: {data}")
                    
                    if data['type'] == 'Connect' and data['from'] is not None:
                        global surveillanceTask
                        try:
                            peer_id = data["from"]
                            print(f"Received start_live_stream from {peer_id}")
                            # if peer_id in self.peer_connections:
                            #     await self.cleanup_peer_connection(peer_id)
                            await self.add_peer(peer_id, data)
                            
                        except Exception as ex:
                            print("Exception error during start_live_stream setup: ", ex)
                    if data["type"] == "ice-candidate" and data["target"] == raspberry_pi_id:
                        print(f"Received ICE candidate.")
                        print(f"Peer Connections during ice-candidate: {self.peer_connections}")
                        peer_id = data["from"]
                        if peer_id in self.peer_connections:
                            print(f"Received ICE candidate from {peer_id}")
                            # self.pc = self.peer_connections[peer_id]
                            candidate_dict = parse_candidate(data["payload"]["candidate"])
                            print(f"Candidate dict: {candidate_dict}")
                            if data["payload"]:
                                candidate = RTCIceCandidate(
                                    foundation=candidate_dict['foundation'],
                                    component=candidate_dict['component'],
                                    protocol=candidate_dict['protocol'],
                                    priority=candidate_dict['priority'],
                                    ip=candidate_dict['ip'],
                                    port=candidate_dict['port'],
                                    type=candidate_dict['type'],
                                    sdpMid=data["payload"]['sdpMid'],
                                    sdpMLineIndex=data["payload"]['sdpMLineIndex'],
                                    relatedAddress=data["payload"]['relatedAddress'],
                                    relatedPort=data["payload"]['relatedPort'],
                                    tcpType=data["payload"]['tcpType']
                                )
                                try:
                                    await self.peer_connections[peer_id].addIceCandidate(candidate)#I don't think this works, the flow stops here, it should continue on the eventlistener
                                    print(f"Added ICE Candidate from {peer_id}")
                                except Exception as e:
                                    print(f"Error adding ICE candidate from {peer_id}: {e}")   
                                
                            else:
                                print(f"No payload in ICE candidate from {peer_id}")
                            
                    if data['type'] == "answer" and data['target'] == raspberry_pi_id:
                        # print(f"Message for {data['type']} received: {data}")
                        print(f"Peer Connections during answer: {self.peer_connections}")
                        try:
                            peer_id = data["from"]
                            print(f"Received answer from: {peer_id}")
                            if peer_id in self.peer_connections:
                                # self.pc = self.peer_connections[peer_id]
                                answer = RTCSessionDescription(
                                    sdp=data["payload"]["sdp"],
                                    type=data["payload"]["type"]
                                )
                                await self.peer_connections[peer_id].setRemoteDescription(answer)
                                print(f"Set remote description with answer from {peer_id}")
                            else:
                                print(f"No peer connection found for {peer_id}")
                        except Exception as e:
                            print(f"Error handling answer: {e}")
                    if data['type'] == "Record Start" and data['target'] == raspberry_pi_id:
                        self.isRecording = True
                        print(f"Recording started")
                    if data['type'] == "Record Stop" and data['target'] == raspberry_pi_id:
                        self.isRecording = False
                        print(f"Recording stopped")
             

            # await webRTCChannel.subscribe(raspberry_pi_id, messageToMyID)
            await self.webRTCChannel.subscribe('WebRTC-client-register', messageToMyID)
            print("Listening for messages from  channel: WebRTC-client-register")
            
            await self.webRTCChannel.publish('WebRTC-client-register',{
                'role': 'Raspberry Pi',
                'id': raspberry_pi_id,
                'type':"Connect",
                'sessionID': raspberry_pi_id
            })
            global now_live
            if now_live == True:
                await self.webRTCChannel.publish('WebRTC-client-register',{
                    'role': 'Raspberry Pi',
                    'id': raspberry_pi_id,
                    'type':"Now Live",
                    'sessionID': raspberry_pi_id
                })
            # print(f"Published data: {data}")
            while True:
                await asyncio.sleep(1)
        except Exception as e:
            print(f"General Error: {e}")
        finally:
            await self.cleanup_peer_connection('all')
            await self.ably_client.close()#Ensure the connection is closed on exit

async def setup_stream():
    global stream, surveillance_running, surveillanceTask
    if stream is None:
        print("stream is none. Will attach camera stream track to it")
        stream = CameraStreamTrack()
        surveillance_running = True
        surveillanceTask = asyncio.create_task(surveillance_loop())



async def main():
    webrtc_connection = WebRTCConnection()
    await webrtc_connection.ably_connection()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        # GPIO_Cleanup()
        release_camera()
        print("Python Script stopped by user via keyboard interrupt.")