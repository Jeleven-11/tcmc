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
# from sort.sort import *
from tracker import CentroidTracker
import easyocr
# import string
from stun_finder import GetStunServers
from google_uploader import MyGoogleApi
from TaskManager import AsyncTaskManager

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
def get_camera(frame_width = 1920, frame_height = 1080):
    global myCamera
    if myCamera is None:
        # frame_width = 1280#640#480#640#1280#1920
        # frame_height = 720#360#270#360#720#1080
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
def get_car(license_plate, track_ids):
    print(f"License inside: {license_plate}")#License inside: (647, 323, 710, 349, 88, 0)
    print(f"Track IDs: {track_ids}")#Track IDs
    x1, y1, x2, y2, score, class_id = license_plate
    foundIt = False
    car_indx = -1
    for car_id, (bbox, centroid) in track_ids.items():
        xcar1, ycar1, xcar2, ycar2 = bbox 
        if x1 > xcar1 and x2 < xcar2 and y1 > ycar1 and y2 < ycar2:
            car_indx = car_id
            foundIt = True
            break
    if foundIt:
        print("Found it")
        return xcar1, ycar1, xcar2, ycar2, car_indx
    return -1, -1, -1, -1, -1
# def format_license(license_plate_text):




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
        self.isRecording = True
        self.isAI_On = True
        self.connection_attempts_max = 6
        self.connection_attempts_count = 0
        self.iceServers = GetStunServers().iceServers
        self.videosToBeUploaded = []
        self.licensePlatesToBeUploaded = {}
        
        self.rtc_config = RTCConfiguration(self.iceServers)
            # iceServers=[
                # RTCIceServer("stun:stun.l.google.com:19302"),
                # RTCIceServer(
                #     "turn:relay1.expressturn.com:3478",
                #     username="efQSLPKFVR1ANJGAHL",
                #     credential="p1CPPouohCkB1MO2"
                # ),
                # RTCIceServer("stun:stun.relay.metered.ca:80"),
      
                # RTCIceServer( "turn:global.relay.metered.ca:80",
                #     username="0a3a9293f3f8dd410138e0fb",
                #     credential="JAYpV4YyYPL7JwX+"
                # ),
                # RTCIceServer("turn:global.relay.metered.ca:80?transport=tcp",
                #     username="0a3a9293f3f8dd410138e0fb",
                #     credential="JAYpV4YyYPL7JwX+"
                # ),
                # RTCIceServer("turn:global.relay.metered.ca:443",
                #     username="0a3a9293f3f8dd410138e0fb",
                #     credential="JAYpV4YyYPL7JwX+"
                # ),
                # RTCIceServer( "turns:global.relay.metered.ca:443?transport=tcp",
                #     username="0a3a9293f3f8dd410138e0fb",
                #     credential="JAYpV4YyYPL7JwX+"
                # ),
                    #     # Append here RTCIceServer(stun)
        #             ]#
        # )
        atexit.register(self.cleanup_on_exit)
    def cleanup_on_exit(self):
        ### Synchronous wrapper to run the async cleanup. ###
        try:
            asyncio.run(self.cleanup_peer_connection('all'))
        except Exception as e:
            print(f"Error during cleanup on exit: {e}")
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
            self.width = 1280#960
            self.height = 720#540
            # frame_width = 1280#640#480#640#1280#1920
            # frame_height = 720#360#270#360#720#1080
            # Create the output folder if it doesn't exist
            if not os.path.exists(output_folder):
                os.makedirs(output_folder)
            self.video_name = "rec_video"+ datetime.now(pytz.timezone('Asia/Manila')).strftime("%Y%m%d_%H%M%S") +".mp4"
            self.video_output = os.path.join(output_folder, self.video_name)
            # self.saver_task_manager = AsyncTaskManager(self.save_video_task)
            self.frame_rate = 30
            self.frames_to_save = []
            self.frame_buffer_size =  1 * 29 * self.frame_rate + 15 # 30 Seconds
            # Initialize the video writer
            # self.fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec for .mp4
            # self.out = cv2.VideoWriter(self.video_output, self.fourcc, 30, (self.width, self.height))
            self.temp_file = 'temp.raw'

            # TEMPORARY FOR TESTING
            self.temp_video_src = 'video4.mp4'
            self.video_capture = cv2.VideoCapture(self.temp_video_src)
            self.resized_frame = None

            # Define the FFmpeg command
            self.command = [
                "ffmpeg",
                "-y",
                "-f", "rawvideo",
                "-pix_fmt", "bgr24",
                "-s", str(self.width)+"x"+str(self.height),#"1280x720", "960x540"
                "-r", self.frame_rate,
                "-i", self.temp_file,
                "-c:v", "libx264",
                "-crf", "18",
                "-pix_fmt", "yuv420p",
                self.video_output
            ]
            self.results = {}
            self.google_drive_videos_folder_id='1jfdeg-r2M8eaxiqIVyGiy9dfYD4eN8b6'
            self.google_drive_images_folder_id='14y2Arew7POKwhPLVRuqLaW4jBG0rAuYg'
            self.video_uploader = MyGoogleApi()
            atexit.register(self.cleanup)
            self.initializeCamera()
            # --- Model Setup ---
            self.inference_client = InferenceHTTPClient(api_url="https://detect.roboflow.com", api_key="YdtoLOJufCKAjGZC1IkJ")
            # self.model = self.inference_client.get_model("local-vehicles-opjyd/10")
            self.model_id = "local-vehicles-opjyd/10"
            self.motion_tracker = CentroidTracker()#Sort()#(max_age=20, min_hits=3, iou_threshold=0.3)
            self.license_plate_detector = InferenceHTTPClient(api_url="https://detect.roboflow.com", api_key="xi02obPcBC9MZU7iWSiz")#setup_model()
            self.plate_detector_model_id = "licenseplate-7tpdn/2"
            self.reader = easyocr.Reader(['en'], gpu=False)
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
            self.isStarted = False
            self.isUploading = False
            # self.save_task = asyncio.create_task(self.save_video_task())
            self.vehiclesClass = [0,1,2,3,4,5]#0-Bus, 1-Car, 2-Motor, 3-Tricycle, 4-Truck, 5-Van
            print("Set frame count to 0")
            self.running = False
            self.start_time = time.time() 
            print("Initialize complete")
        async def save_video_task(self):
            print("SAVE VIDEO")
            await self.save_video(self.frames_to_save)
            self.parent.isRecording = False
            # while True:
            #     if self.isBufferFull:
            #         # Save the video frames
            #         print("Saving video...")
                    
                    
            #     await asyncio.sleep(0.5) 
        async def add_frame(self, frame):
            self.frames_to_save.append(frame)
            # print("Buffer size:", len(self.frames_to_save))
            if len(self.frames_to_save) >= self.frame_buffer_size and not self.isSavingVideo and not self.isBufferFull:
                self.isBufferFull = True
                # if not self.isStarted:
                #     self.saver_task_manager.start_task(True)
                # else:
                #     self.saver_task_manager.resume_task()
                await self.save_video(self.frames_to_save)
        def read_license_plate(self, license_plate_cropped):
            detections = self.reader.readtext(license_plate_cropped)
            for detection in detections:
                bbox, text, score = detection
                text = text.upper().replace(" ", "")
                if len(text) == 7:
                    # return format_license(text), score
                    return text, score
            return None, None
        async def save_license_plate_image(self, frame, x1_, y1_, x2_, y2_, car_id, image_name_prefix="license_plate"):
            # Crop the license plate from the frame
            license_plate_cropped = frame[int(y1_):int(y2_), int(x1_):int(x2_), :]
            
            # Convert the cropped image to grayscale
            license_plate_cropped_gray = cv2.cvtColor(license_plate_cropped, cv2.COLOR_BGR2GRAY)
            
            # Apply thresholding
            _, license_plate_cropped_thresh = cv2.threshold(license_plate_cropped_gray, 140, 255, cv2.THRESH_BINARY_INV)
            
            # Define the directory to save images
            output_dir = "license_plate_images"
            os.makedirs(output_dir, exist_ok=True)
            
            # Define the file path
            file_name = f"license_crop_{x1_}_{y1_}.png"
            license_crop = os.path.join(output_dir, file_name)
            # license_crop_gray = os.path.join(output_dir, f"license_crop_gray_{x1_}_{y1_}.png")
            # image_path = os.path.join(output_dir, f"{image_name_prefix}_{x1_}_{y1_}.png")
            
            # Save the thresholded image
            cv2.imwrite(license_crop, license_plate_cropped)
            if car_id not in self.parent.licensePlatesToBeUploaded:
                self.parent.licensePlatesToBeUploaded[car_id] = file_name
            
            if len(self.parent.licensePlatesToBeUploaded) > 20:
                print("Will start to upload license plate files to drive...")
                await self.upload_license_plates_image_files()
            
            # cv2.imwrite(license_crop_gray, license_plate_cropped_gray)
            # cv2.imwrite(image_path, license_plate_cropped_thresh)
            # print(f"Saved license plate image to {image_path}")
            return license_plate_cropped_thresh
        async def process_prediction(self, result, frame):
            # return None for this variables if code doesn't reach the part where they are set
            score = None
            license_plate_text_confidence = None
            license_plate_text = None
            # Print the result structure
            # print("Result structure22:", result)

            # Process the result (draw bounding boxes) of vehicles
            if isinstance(result, list) and len(result) > 0:
                predictions = result[0].get('predictions', [])
            elif isinstance(result, dict):
                predictions = result.get('predictions', [])
            else:
                predictions = []
            detections_ = []
            for prediction in predictions:
                # Extract bounding box coordinates
                x1 = int(prediction['x'] - prediction['width'] / 2)
                y1 = int(prediction['y'] - prediction['height'] / 2)
                x2 = int(prediction['x'] + prediction['width'] / 2)
                y2 = int(prediction['y'] + prediction['height'] / 2)
                score = int(prediction['confidence'] * 100)
                class_id = int(prediction['class_id'])
                if class_id in self.vehiclesClass:
                    detections_.append([x1, y1, x2, y2])
            
            # Draw bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                
                # Prepare label text
                label = f"{prediction['class']} {score:.2f}"
                
                # Draw label background
                (label_width, label_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                cv2.rectangle(frame, (x1, y1 - label_height - 10), (x1 + label_width, y1), (0, 255, 0), -1)
                
                # Draw label text
                cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

            # track vehicles
            track_ids = self.motion_tracker.update(detections_)
            
            license_plates_predictions = self.license_plate_detector.infer(frame, model_id = self.plate_detector_model_id)
            if 'predictions' in license_plates_predictions and license_plates_predictions['predictions']:
                if isinstance(license_plates_predictions, list) and len(license_plates_predictions) > 0:
                    predictions_ = license_plates_predictions[0].get('predictions', [])
                elif isinstance(result, dict):
                    predictions_ = license_plates_predictions.get('predictions', [])
                else:
                    predictions_ = []
                for license_plate in predictions_:
                    # Extract bounding box coordinates
                    x1_ = int(license_plate['x'] - license_plate['width'] / 2)
                    y1_ = int(license_plate['y'] - license_plate['height'] / 2)
                    x2_ = int(license_plate['x'] + license_plate['width'] / 2)
                    y2_ = int(license_plate['y'] + license_plate['height'] / 2)
                    score_ = int(license_plate['confidence'] * 100)
                    class_id_ = int(license_plate['class_id'])
                    print(f"License plate prediction: {license_plate}")

                    x1_car, x2_car, y1_car, y2_car, car_id = get_car((x1_, y1_, x2_, y2_, score_, class_id_), track_ids)
                    if car_id != -1:
                        # license_plate_cropped = frame[int(y1_):int(y2_), int(x1_):int(x2_), :]
                        # license_plate_cropped_gray= cv2.cvtColor(license_plate_cropped, cv2.COLOR_BGR2GRAY)
                        # _, license_plate_cropped_thresh = cv2.threshold(license_plate_cropped_gray, 140, 255, cv2.THRESH_BINARY_INV)
                        license_plate_cropped_thresh = await self.save_license_plate_image(frame, x1_, y1_, x2_, y2_, car_id)
                        license_plate_text, license_plate_text_confidence = self.read_license_plate(license_plate_cropped_thresh)
                        print(f"License plate text: {license_plate_text}")
                        print(f"License plate text confidence: {license_plate_text_confidence}")
                        if license_plate_text is not None:
                            self.results[self.frame_count][car_id] = {
                                'car': {'bbox': [x1_car, y1_car, x2_car, y2_car]},
                                'license_plate': {'bbox': [x1_, y1_, x2_, y2_],
                                                'text': license_plate_text,
                                                'confidence': score_,
                                                'text_score': license_plate_text_confidence}
                            }
                        
                        
                        cv2.rectangle(frame, (x1_, y1_), (x2_, y2_), (255, 0, 0), 2)
                    
                    # # Prepare label text
                    #     label_license = f"{prediction['class']} {prediction['confidence']:.2f}"
                        
                        # Draw label background
                        (label_width_, label_height_), _ = cv2.getTextSize(license_plate_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                        cv2.rectangle(frame, (x1_, y1_ - label_height_ - 10), (x1_ + label_width_, y1_), (0, 255, 0), -1)
                        
                        # Draw label text
                        cv2.putText(frame, license_plate_text, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)

            return frame, score, license_plate_text_confidence, license_plate_text


        def initializeCamera(self):
            # global camera, isCameraConfigured
            global isCameraConfigured
            retry_attempts = 3
            for attempt in range(retry_attempts):
                # if self.camera is None and camera is None:
                if self.camera is None:
                    try:
                        print("Setting camera to Picamera2")
                        self.camera = get_camera(self.width, self.height)
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

            try:
                if hasattr(self,'video_capture') and self.video_capture is not None:
                    print("Releasing video capture resources")
                    self.video_capture.release()
                    self.video_capture = None
            except Exception as e:

                print(f"Error during Video Capture cleanup: {e}")
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

        async def run_ffmpeg_async(self, command, frames, temp_file):
            # Write frames to a temporary file
            with open(temp_file, 'wb') as f:
                for frame in frames:
                    f.write(frame.tobytes())

            # Run the ffmpeg command asynchronously
            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            # Wait for the process to complete and capture output
            stdout, stderr = await process.communicate()

            # Check the return code
            if process.returncode == 0:
                print("FFmpeg process completed successfully.")
            else:
                print(f"FFmpeg process failed with return code {process.returncode}.")
                print(f"STDERR: {stderr.decode()}")

            # Remove the temporary file
            os.remove(temp_file)
        async def save_video(self, frames):
            self.isSavingVideo = True
            output_folder = os.path.join(os.getcwd(), "Recordings")

            # Create the output folder if it doesn't exist
            if not os.path.exists(output_folder):
                os.makedirs(output_folder)
            self.video_name = "rec_video"+ datetime.now(pytz.timezone('Asia/Manila')).strftime("%Y%m%d_%H%M%S") +".mp4"
            self.video_output = os.path.join(output_folder, self.video_name)
            # self.video_output = os.path.join(output_folder, "rec_video"+ datetime.now(pytz.timezone('Asia/Manila')).strftime("%Y%m%d_%H%M%S") +".mp4")
            # self.video_output = "rec_video"+ datetime.now(pytz.timezone('Asia/Manila')).strftime("%Y%m%d_%H%M%S") +".mp4"
            self.temp_file = 'temp.raw'
            print("before command")
            width = str(self.width)
            height = str(self.height)
            vid_rate = str(self.frame_rate + 5) 
            self.command = [
                "ffmpeg",
                "-y",
                "-f", "rawvideo",
                "-pix_fmt", "bgr24",
                "-s", width+"x"+height,
                "-r", vid_rate,
                "-i", self.temp_file,
                "-c:v", "libx264",
                "-crf", "18",
                "-pix_fmt", "yuv420p",
                self.video_output
            ]
            print("after command")
            # await self.run_ffmpeg_async(self.command, frames, self.temp_file)
            with open(self.temp_file, 'wb') as f:
            # with os.open(self.temp_file, os.O_WRONLY | os.O_TRUNC) as f:
                for frame in frames:
                    f.write(frame.tobytes())
            print("Before subprocess")
            subprocess.run(self.command)
            print("After subprocess")
            os.remove(self.temp_file)
            # Clear the buffer
            self.frames_to_save.clear()
            self.isBufferFull = False
            # self.frames_to_save = []
            self.parent.videosToBeUploaded.append(self.video_name)
            print("Video saved. Buffer cleared.")
            
            if len(self.parent.videosToBeUploaded) > 0:
                print("Will start to upload files to drive...")
                await self.upload_video_files()
            
            # fileID = self.video_uploader.upload("Recordings", self.video_name, 'video/mp4', self.google_drive_videos_folder_id)
            self.isSavingVideo = False
            await self.parent.webRTCChannel.publish("WebRTC-client-register", {
                    "role": "Raspberry Pi",
                    "sessionID": self.raspberry_pi_id,
                    "message": "Saved video as " + self.video_name,
                    # "fileID": fileID
                    })
            self.frame_rate = 15
            # self.saver_task_manager.pause_task()
            # await asyncio.sleep(5)
            # Update the video output file name and the command
        async def upload_video_files(self):
            self.isUploading = True
            for video_name in self.parent.videosToBeUploaded:
                #how to access the video_name I appended to self.parent.videosToBeUploaded so that it can be passed to the video_uploader.upload, is it the i in the for loop
                fileID = self.video_uploader.upload("Recordings", video_name, 'video/mp4', self.google_drive_videos_folder_id)
                await self.parent.webRTCChannel.publish("WebRTC-client-register", {
                    "role": "Raspberry Pi",
                    "sessionID": self.raspberry_pi_id,
                    "file_name": video_name,
                    "type": "Upload",
                    "message": "Saved uploaded video as " + video_name,
                    "fileID": fileID
                    })
            self.parent.videosToBeUploaded.clear()
            self.isUploading = False

        async def upload_license_plates_image_files(self):
            self.isUploading = True
            for car_id, file_name in self.parent.licensePlatesToBeUploaded:
                fileID = self.video_uploader.upload("license_plate_images", file_name, 'image/png', self.google_drive_images_folder_id)
                await self.parent.webRTCChannel.publish("WebRTC-client-register", {
                    "role": "Raspberry Pi",
                    "sessionID": self.raspberry_pi_id,
                    "message": "Saved uploaded image as " + file_name,
                    "file_name": file_name,
                    "type": "Upload",
                    "fileID": fileID
                    })
            self.parent.licensePlatesToBeUploaded.clear()
            # self.isUploading = False

            
        async def recv(self):
            # global camera
            global now_live
            try:
                if self.video_capture and self.video_capture.isOpened():
                    ret, temp_frame = self.video_capture.read()
                    if not ret:
                        print("End of video file")
                        exit()
                    frame = cv2.resize(temp_frame, (self.width, self.height))
                    # frame = camera.capture_array()
                    # frame = self.resized_frame
                # frame = self.camera.capture_array() # A Picamera2
                    self.frame_count += 1
                    
                    if frame.shape[2] == 4:
                        frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)
                    if self.frame_count % 30 != 0: # skip frames (This is OPTIONAL and can be removed)
                        if self.parent.isRecording and not self.isBufferFull:
                            await self.add_frame(frame)
                        video_frame = VideoFrame.from_ndarray(frame, format="bgr24")
                        video_frame.pts, video_frame.time_base = await self.next_timestamp()
                        return video_frame
                    if self.parent.isAI_On:
                        result = self.inference_client.infer(frame, model_id = self.model_id)#self.license_plate_detector
                        print(f"Result structure: {result}")
                        print(f"Result prediction structure: {result['predictions']}")
                    #Result structure: {'inference_id': '12881a4a-44e5-4643-9214-09f4a5d397ac', 'time': 0.03681961399888678, 'image': {'width': 1280, 'height': 720}, 'predictions': []}
                        if 'predictions' in result and result['predictions']:#check if predictions is not empty []
                            
                            vehicles_frame, score, license_plate_text_confidence, license_plate_text  = await self.process_prediction(result, frame)
                            data_payload = {
                                "Car Confidence": score,
                                "License Plate Text Confidence": license_plate_text_confidence,
                                "License Plate Text":license_plate_text
                            }
                            await self.parent.webRTCChannel.publish("WebRTC-client-register", {
                                    "role": "Raspberry Pi",
                                    "sessionID": self.raspberry_pi_id,
                                    "type": "Data",
                                    "data": data_payload})
                            frame = vehicles_frame

                    if self.parent.isRecording and not self.isBufferFull:
                        await self.add_frame(frame)
                    

                    if self.frame_count % 30 == 0:
                        elapsed_time = time.time() - self.start_time
                        if elapsed_time > 0:
                            fps = 30 / elapsed_time
                            if not self.isUploading:
                                if int(fps)>1:
                                    self.frame_rate = int(fps)
                                self.frame_buffer_size =  1 * 29 * self.frame_rate + 15
                            print(f"\rCurrent FPS: {int(fps):.2f}")
                            await self.parent.webRTCChannel.publish("WebRTC-client-register", {
                                "role": "Raspberry Pi",
                                "sessionID": self.raspberry_pi_id,
                                "type": "FPS",
                                "data": fps})
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
        raspberry_pi_id = get_cpu_serial()
        if self.peer_connections[peer_id].connectionState in ["failed", "disconnected", "closed"]:
            print(f"Connection state {self.peer_connections[peer_id].connectionState} for peer {peer_id}. Cleaning up. Live stream")
            await self.cleanup_peer_connection(peer_id)
            if self.connection_attempts_count <= self.connection_attempts_max:
                self.connection_attempts_count += 1
                await self.webRTCChannel.publish('WebRTC-client-register',{
                    'role': 'Raspberry Pi',
                    'id': raspberry_pi_id,
                    'type':"Connect",
                    'sessionID': raspberry_pi_id
                })
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
                    
                    if data['type'] == 'Connect' and data['from'] != raspberry_pi_id and data['from'] not in self.peer_connections:
                        global surveillanceTask
                        try:
                            peer_id = data["from"]
                            print(f"Received Connect from {peer_id}")
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
                    
                    if data['type'] == "AI On" and data["target"] == raspberry_pi_id:
                        self.isAI_On = True

                    if data['type'] == "AI Off" and data["target"] == raspberry_pi_id:
                        self.isAI_On = False
             

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