import asyncio
# import websockets
import json
import cv2
import sys
import base64
import subprocess
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from aiortc import VideoStreamTrack, RTCPeerConnection, RTCSessionDescription, RTCIceCandidate
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
# CONFIG_FILE = "config.json"
# TRAIN_LOG = "training.json"
# assigned_ownerId = None
# number_of_faces_registered = 0
websocket_status = "Disconnected"
camera = None
stream = None
pc = None
executor = ThreadPoolExecutor(max_workers=2)

# --- WebRTC Data Configurations --- #
peer_connections = {}
# startTraining = False
# trainingMin = 0
# trainingHour = 0
# --- IR LEDS --- #
# ir_led1 = PWMLED(17)
# ir_led2 = PWMLED(27)
# ir_led3 = PWMLED(22)
# ir_led4 = PWMLED(23)
# brightness = 0.75 # 75%
local_tz = pytz.timezone("Asia/Manila")
# media_relay = MediaRelay()
# newUser = False
# updateFace = False
# faceScanProcess = None
# isFaceRegDone = None
# needToTrain = False
# my_websocket = None
# started_training = None
now_live = False
isCameraConfigured = False
surveillanceTask = None
# def IR_LED_ON():
#     ir_led1.value = brightness
#     ir_led2.value = brightness
#     print(f"IR LEDs are running at {brightness * 100}% brightness.")

# def IR_LED_OFF():
#     ir_led1.off()
#     ir_led2.off()
#     print("IR LEDs are OFF")

# def GPIO_Cleanup():
#     ir_led1.close()
#     ir_led2.close()
#     print (f"GPIO resources released.")

def get_wifi_ssid():
    result = subprocess.run(['iwgetid'], stdout=subprocess.PIPE)
    ssid = result.stdout.decode().strip()
    return ssid

# def isNightTime():
#     now = datetime.now(local_tz).time()
#     start_time = 18
#     end_time = 6
#     return now.hour >= start_time or now.hour < end_time

# async def controlIRLeds ():
#     print("IR led task is on")
#     while True:
#         if isNightTime():
#             IR_LED_ON()
#         else:
#             print("currently morning")
#             IR_LED_OFF()
#         await asyncio.sleep(60)
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
# Function for fine-tuning and training Inception-ResNet-V1 model
# batch_count = 2
# async def fine_tunining_training(ws = None):
#     # global batch_count
#     # print(f"Batch count: {batch_count}")
#     status = "Failed"
#     start = datetime.now(pytz.timezone('Asia/Manila')).strftime("%m/%d/%Y %H:%M:%S")
#     try:
#         global started_training
#         started_training = "started training..."
#         print(started_training)
#         if ws is not None:
#             await send_admin_logs(ws, started_training)
#         global startTraining
#         global needToTrain
#         raspberry_pi_id = get_cpu_serial()
#         now = datetime.now()
#         formatted_date = now.strftime("%m-%d-%Y")
#         model_filename = f"model_trained_{formatted_date}.pt"
#         model_path = Path("models")
#         model_path.mkdir(parents=True, exist_ok=True)
#         model_save_path = model_path / model_filename
#         data_dir = './saved_faces'
#         batch_size = 32#count_immediate_folders(data_dir)#32
#         epochs = 32#count_immediate_folders(data_dir)*3#32
#         workers = 0 if os.name == 'nt' else 2
#         device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
#         if device == 'cpu':
#             # Use OpenCL for Intel UHD Graphics (iGPU) if available
#             try:
#                 device = torch.device('opencl:0')
#                 print(f'Running on device: {device}')
#             except RuntimeError:
#                 print('No OpenCL device found. Running on CPU.')
#         else:
#             print(f'Running on device: {device}')
#         #print('Running on device: {}'.format(device))
#         mtcnn = MTCNN(
#             image_size=160, margin=14, min_face_size=100,
#             thresholds=[0.6, 0.7, 0.7], factor=0.709, post_process=True,
#             device=device
#         )
#         dataset = datasets.ImageFolder(data_dir, transform=transforms.Resize((512, 512)))
#         dataset.samples = [
#             (p, p.replace(data_dir, data_dir + '_cropped'))
#             for p, _ in dataset.samples
#         ]
#         loader = DataLoader(
#             dataset,
#             num_workers=workers,
#             batch_size=batch_size,
#             collate_fn=training.collate_pil
#         )
#         for i, (x, y) in enumerate(loader):
#             mtcnn(x, save_path=y)
#             print('\rBatch {} of {}'.format(i+1, len(loader)), end='')
#             # print(f"Image {i+1} - Filename: {dataset.samples[i][0]}")
#         #Remove mtcnn to reduce GPU memory usage
#         del mtcnn

#         resnet = InceptionResnetV1(
#             classify = True,
#             pretrained='vggface2',
#             num_classes=len(dataset.class_to_idx)
#         ).to(device)
#         print(f"number of classes: {dataset.class_to_idx}")
#         optimizer = optim.Adam(resnet.parameters(), lr=0.001)
#         scheduler = MultiStepLR(optimizer, [5, 10])

#         trans = transforms.Compose([
#             np.float32,
#             transforms.ToTensor(),
#             fixed_image_standardization
#         ])
#         dataset = datasets.ImageFolder(data_dir + '_cropped', transform=trans)
#         img_inds = np.arange(len(dataset))
#         np.random.shuffle(img_inds)
#         train_inds = img_inds[:int(0.8 * len(img_inds))]
#         val_inds = img_inds[int(0.8 * len(img_inds)):]
#         train_loader = DataLoader(
#             dataset,
#             num_workers = workers,
#             batch_size = batch_size,
#             sampler = SubsetRandomSampler(train_inds)
#         )
#         # for i, (inputs, targets) in enumerate(train_loader):
#         #     print(f"Batch {i+1} - Targets: {targets}")
#         val_loader = DataLoader(
#             dataset,
#             num_workers = workers,
#             batch_size = batch_size,
#             sampler = SubsetRandomSampler(val_inds)
#         )

#         loss_fn = torch.nn.CrossEntropyLoss()
#         metrics = {
#             'fps': training.BatchTimer(),
#             'acc': training.accuracy
#         }
#         #Train model
#         writer = SummaryWriter()
#         writer.iteration, writer.interval = 0, 10
#         time_now = datetime.now()
#         formatted_time = time_now.strftime("%H-%M-%S")
#         log_filename = f'fine-tuning-training-logs-{formatted_date}_{formatted_time}.txt'
#         log_path = Path("Training-Logs")
#         log_path.mkdir(parents=True, exist_ok=True)
#         log_save_path = log_path / log_filename
#         sys.stdout = open(log_save_path, 'w')     
#         # time_now = datetime.now()
#         # formatted_time = time_now.strftime("%H-%M-%S")
#         if ws is not None:
#             await send_admin_logs(ws, "Training Start time: " + formatted_time)
#         print("\nTraining Start time: ", formatted_time)

#         print('\n\nInitial')
#         print('-' * 10)

#         print('Training Parameters:')
#         print(f"batch_size = {batch_size}")
#         print(f"epochs = {epochs}")
#         print(f"workers = {workers}")
#         print(f"device = {device}\n")
#         print('-' * 10)

#         resnet.eval()

#         training.pass_epoch(
#             resnet, loss_fn, val_loader,
#             batch_metrics = metrics, show_running = True, device = device,
#             writer = writer
#         )
#         for epoch in range(epochs):
#             print('\nEpoch {}/{}'.format(epoch + 1, epochs))
#             print('-' * 10)
#             #training mode
#             resnet.train()
#             training.pass_epoch(
#                 resnet, loss_fn, train_loader, optimizer, scheduler,
#                 batch_metrics = metrics, show_running = True, device = device,
#                 writer = writer
#             )
#             #evaluation mode
#             resnet.eval()
#             training.pass_epoch(
#                 resnet, loss_fn, val_loader,
#                 batch_metrics = metrics, show_running = True, device = device,
#                 writer = writer
#             )
#         time_now = datetime.now()
#         formatted_time = time_now.strftime("%H-%M-%S")
#         print("\nTraining time finished: ", formatted_time)    
#         sys.stdout.close()
#         sys.stdout = sys.__stdout__
#         writer.close()
#         if ws is not None:
#             await send_admin_logs(ws, "Training time finished: " + formatted_time)
#         #Saving our finetuned model
#         torch.save(obj=resnet.state_dict(), f=model_save_path)
#         print(f'\nModel state dictionary saved to {model_save_path}')
#         if ws is not None:
#             await send_admin_logs(ws, f"Model state dictionary saved to {model_save_path}")
#         mtcnn = MTCNN(
#             image_size = 160, margin = 14, min_face_size = 20,
#             thresholds = [0.6, 0.7, 0.7], factor=0.709, post_process=True,
#             device=device
#         )
#         started_training = None

#         def collate_fn(x):
#             return x[0]

#         data = datasets.ImageFolder('saved_faces')
#         data.idx_to_class = {i:c for c, i in data.class_to_idx.items()}
#         data_loader = DataLoader(data, collate_fn = collate_fn, num_workers = workers)
#         aligned = []
#         names = []
#         for x, y in data_loader:
#             x_aligned, prob = mtcnn(x, return_prob=True)
#             if x_aligned is not None:
#                 emb = resnet(x_aligned.unsqueeze(0))
#                 aligned.append(emb)
#                 names.append(data.idx_to_class[y])

#         save_data = [aligned, names]
#         torch.save(save_data, 'data.pt')
#         print('Data saved as data.pt')
#         if ws is not None:
#             await send_admin_logs(ws, "Data saved as data.pt")
#             await ws.send(json.dumps({
#                 "type": "trainingResult",
#                 "message": "Training Finished",
#                 "names": names,
#                 "faceRegStatus": "registered"
#             }))
#         startTraining = False
#         needToTrain = False
#         print("finished training...")
#         if ws is not None:
#             await send_admin_logs(ws, "finished training...")
#         status = "Successful"
#         global number_of_faces_registered
#         number_of_faces_registered = count_immediate_folders(data_dir)
#         save_training_record(start,status)
#     except Exception as e:
#         print(f"Error encountered during training: {e}")
#         if ws is not None:
#             await send_admin_logs(ws, f"Error encountered during training: {e}")
#         logging.error(f"Error encountered during training: {e}")
        # batch_count += 1
        # if batch_count < 20:
        #     await fine_tunining_training()


# Function that allows auto update
# def download_file(token, repo_owner, repo_name, branch, file_path, local_file_path):
#     url = f"https://raw.githubusercontent.com/{repo_owner}/{repo_name}/{branch}/{file_path}"
#     headers = {"Authorization": f"token {token}"}
#     response = requests.get(url, headers=headers)
    
#     if response.status_code == 200:
#         with open(local_file_path, 'wb') as file:
#             file.write(response.content)
#         print(f"File downloaded successfully: {local_file_path}")
#     else:
#         print(f"Failed to download file: {response.status_code}")

# def get_latest_commit_sha(token, repo_owner, repo_name, branch, file_path):
#     url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/commits"
#     params = {
#         "path": file_path,#python_scripts/security_system_v1.py
#         "sha": branch, #main
#         "per_page": 1
#     }
#     headers = {"Authorization": f"token {token}"}
#     response = requests.get(url, headers=headers, params=params)
    
#     if response.status_code == 200:
#         commits = response.json()
#         if commits:
#             return commits[0]['sha']
#     return 

# def check_updates(last_update, current_check):
#     global github_token, repo_owner, repo_name, branch, file_path
#     latest_commit_sha = get_latest_commit_sha(github_token, repo_owner, repo_name, branch, file_path)
#     sha_file_path = f"{local_file_path}.sha"

#     if latest_commit_sha:
#         if os.path.exists(sha_file_path):
#             with open(sha_file_path, 'r') as sha_file:
#                 saved_sha = sha_file.read().strip()
            
#             if saved_sha != latest_commit_sha:
#                 print("New commit detected. Downloading updated file...")
#                 download_file(github_token, repo_owner, repo_name, branch, file_path, local_file_path)
#                 save_last_update_time(current_check, current_check)
#                 with open(sha_file_path, 'w') as sha_file:
#                     sha_file.write(latest_commit_sha)
#                 print("System will Reboot to apply updates")
#                 exit(1)
#             else:
#                 save_last_update_time(last_update, current_check)
#                 print("No new updates found.")
#         else:
#             print("No previous commit SHA found. Downloading file for the first time...")
#             download_file(github_token, repo_owner, repo_name, branch, file_path, local_file_path)
#             save_last_update_time(current_check, current_check)
#             with open(sha_file_path, 'w') as sha_file:
#                 sha_file.write(latest_commit_sha)
#     else:
#         print("Failed to get the latest commit SHA.")

# def save_last_update_time(last_update, last_update_check):
#     """Saves the configuration data to last_update.json."""
#     config_data = {
#         "last_update": last_update, #date and time when the file is updated (downloaded a new commit)
#         "last_update_check" : last_update_check#date and time last checked if there's a new commit
#     }

#     with open("last_update.json", "w") as config_file:
#         json.dump(config_data, config_file, indent=4)
    
#     print("Configuration saved to last_update.json")
    # ADD system reboot (send message first to server that says it will apply updated software code and reboot)

# def save_training_record(fineTuningStartTime, status):
#     global number_of_faces_registered

#     training_record = {
#         "Last_Finetuning": fineTuningStartTime,
#         "Status": status,
#         "FaceCount": number_of_faces_registered
#     }
#     with open(TRAIN_LOG, "w") as train_conf:
#         json.dump(training_record, train_conf, indent=4)
#     print("Saved training log in json file")

# def load_last_training_record():
#     if os.path.exists(TRAIN_LOG):
#         with open(TRAIN_LOG, 'r') as config_file:
#             config_data = json.load(config_file)
#             return config_data.get('Status'), config_data.get('Last_Finetuning'), config_data.get('FaceCount')
    # return None, None

# def load_last_update_time():
#     if os.path.exists(lastUpdateConfig):
#         with open(lastUpdateConfig, 'r') as config_file:
#             config_data = json.load(config_file)
#             return config_data.get('last_update'), config_data.get('last_update_check')
    # return None, None

# async def checkTime(ws):
#     global startTraining, trainingMin, trainingHour, stream, now_live
#     canSleepForThirtyMin = False
#     sleepTime = 60
#     while True:
#         now = datetime.now(pytz.timezone('Asia/Manila'))
#         current_check = now.strftime("%m/%d/%Y %H:%M:%S")
#         # print(current_check)
#         # print(now.hour)
#         # print(now.minute)
#         last_update, last_update_check = load_last_update_time()
#         if now.hour == 00 and now.minute == 00: 
#             print("Checking for updates...")
#             if stream is not None and now_live:
#                 await stream.close()
#                 stream = None
#             await send_admin_logs(ws, "Checking for updates...")
#             check_updates(last_update, current_check)
#             if now_live:
#                 stream = CameraStreamTrack()
#             # else:
#             #     stream = SecuritySurveillanceStreamTrack()
            
#         if now.hour == 12 and now.minute == 00: 
#             print("Checking for updates...")
#             if stream is not None and now_live:
#                 await stream.close()
#                 stream = None
#             await send_admin_logs(ws, "Checking for updates...")
#             check_updates(last_update, current_check)
#             if now_live:
#                 stream = CameraStreamTrack()
#             # else:
#             #     stream = SecuritySurveillanceStreamTrack()
#         if now.minute == 0 or now.minute == 30:
#             print("Can now sleep for 30 minutes.")
#             canSleepForThirtyMin = True
#         if canSleepForThirtyMin:
#             sleepTime = 1800
#         if needToTrain and now.minute == trainingMin and now.hour == trainingHour:
#             await fine_tunining_training(ws)
#         if startTraining and now.minute == trainingMin and now.hour == trainingHour:
#             await fine_tunining_training(ws)
#         if needToTrain and startTraining and now.hour == trainingHour and now.minute == trainingMin:
#             await fine_tunining_training(ws)
#         await asyncio.sleep(sleepTime)
        
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

# def extract_date_from_filename(filename):
#     #Split filename and extract the date part based on (mm-dd-yyyy)
#     parts = filename.split("_")
#     date_str = parts[2]
#     date_str = date_str.split(".")[0]
#     return datetime.strptime(date_str, "%m-%d-%Y")

# def load_assigned_owner():
#     """Loads the assigned owner ID from the file."""
#     global assigned_ownerId, number_of_faces_registered
#     try:
#         with open('config.json', 'r') as f:
#             config = json.load(f)
#             assigned_ownerId = config['assigned_ownerId']
#             number_of_faces_registered = config['number_of_faces_registered']
#         # with open(CONFIG_FILE, 'r') as f:
#         #     assigned_ownerId = f.read().strip()
#         print(f"Loaded assigned owner ID: {assigned_ownerId}")
#         print(f"Current number of faces registered: {number_of_faces_registered}")
#     except FileNotFoundError:
#         print("No assigned owner ID found.")
#         assigned_ownerId = None

# def save_assigned_owner(owner_id):
#     global number_of_faces_registered
#     """Saves the configuration data to config.json."""
#     config_data = {
#         "assigned_ownerId": owner_id,
#         "number_of_faces_registered" : number_of_faces_registered
#     }

#     with open("config.json", "w") as config_file:
#         json.dump(config_data, config_file, indent=4)
    
#     print("Configuration saved to config.json")

# def save_num_faces_registered(number_of_faces_registered):
#     global assigned_ownerId
#     config_data = {
#         "assigned_ownerId" : assigned_ownerId,
#         "number_of_faces_registered" : number_of_faces_registered
#     }
#     with open("config.json", "w") as config_file:
#         json.dump(config_data, config_file, indent=4)

#     print("Updated Configuration file with an additional face registered")

# camera = None
# lasttime_sendname = None
# def load_saved_embeddings(saved_faces_path, mtcnn, resnet, device):
#     # Load the saved faces dataset
#     dataset = datasets.ImageFolder(saved_faces_path)
#     idx_to_class = {i: c for c, i in dataset.class_to_idx.items()}
    
#     # Create embeddings for saved faces
#     saved_embeddings = []
#     saved_names = []
    
#     for img_path, class_idx in dataset.samples:
#         img = datasets.folder.default_loader(img_path)
#         face = mtcnn(img)
        
#         if face is not None:
#             face = face.to(device)
#             embedding = resnet(face.unsqueeze(0))
#             saved_embeddings.append(embedding.detach().cpu())
#             saved_names.append(idx_to_class[class_idx])
    
#     return torch.cat(saved_embeddings), saved_names

# def setup_models(device):
#     # Initialize MTCNN for face detection
#     mtcnn = MTCNN(
#         image_size=160, 
#         margin=14, 
#         min_face_size=48,
#         thresholds=[0.6, 0.7, 0.7], 
#         factor=0.709, 
#         post_process=True,
#         device=device
#     )
#     mtcnn_live = MTCNN(
#         image_size=160, 
#         margin=14, 
#         min_face_size=48,
#         thresholds=[0.6, 0.7, 0.7], 
#         keep_all= True,
#         factor=0.709, 
#         post_process=True,
#         device=device
#     )
    
#     # Initialize InceptionResnetV1 model for face recognition
#     resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
    
#     return mtcnn, mtcnn_live, resnet

# def find_best_match(embedding, saved_embeddings, saved_names, threshold=1.0):
#     # Calculate distances between the detected face and all saved faces
#     distances = [(e - embedding).norm().item() for e in saved_embeddings]
#     min_dist_idx = np.argmin(distances)
#     min_dist = distances[min_dist_idx]
    
#     if min_dist < threshold:
#         name = saved_names[min_dist_idx]
#         accuracy = 1 - (min_dist / 2)  # Convert distance to a similarity score
#         return (0, 225, 0), name, accuracy, min_dist
    
#     return (225, 0, 0), "Unknown", 0, min_dist
# def get_day_count(start_date, current_date):
#         delta = current_date - start_date
#         logging.debug(f"delta: {delta.days}, +1 : {delta.days + 1}")
#         return delta.days + 1

# Global camera variable
myCamera = None
def get_camera():
    global myCamera
    if myCamera is None:
        frame_width = 1280
        frame_height = 720
        # Initialize Picamera2
        myCamera = Picamera2()
        camera_config = myCamera.create_preview_configuration(main={"size": (frame_width, frame_height)})
        myCamera.configure(camera_config)
        # myCamera.start()
    return myCamera

# def check_frame_channels(frame):
#     text =""
#     # Check the shape of the frame to determine the number of channels
#     if len(frame.shape) == 2:
#         # Grayscale image, only one channel
#         print("The frame is grayscale with only one channel.")
#         text = "The frame is grayscale with only one channel."
#     elif len(frame.shape) == 3:
#         height, width, channels = frame.shape
#         if channels == 1:
#             print("The frame has only one channel (likely grayscale).")
#             text = "The frame has only one channel (likely grayscale)."
#         elif channels == 3:
#             print("The frame has three channels: Red, Green, Blue.")
#             text = "The frame has three channels: Red, Green, Blue."
#         elif channels == 4:
#             print("The frame has four channels: Red, Green, Blue, Alpha.")
#             text = "The frame has four channels: Red, Green, Blue, Alpha."
#         else:
#             print(f"The frame has an unexpected number of channels: {channels}")
#             text = "The frame has an unexpected number of channels."
#     else:
#         print("The frame has an unexpected shape.")
#         text = "The frame has an unexpected shape."
#     return text
surveillance_running = True
async def surveillance_loop():
    global surveillance_running, stream
    while True:
        if surveillance_running:
            stream.surveillanceMode
            await asyncio.sleep(0.04)
    # if not self.running:
    #     print("Started processing frames")
    #     self.running = True
    # while self.running:
    #     await self.surveillanceMode()
    #     await asyncio.sleep(0.04)
def setup_model():
    model_path = "YOLOv11/runs/detect/train5/weights/best.pt"  # Path to the best model
    # device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = YOLO(model_path)
    return model
class CameraStreamTrack(VideoStreamTrack):
    def __init__(self):
        super().__init__()
        # global camera, isCameraConfigured
        global isCameraConfigured
        # self.camera = camera
        self.camera = None
        self.workers = 0 if os.name == 'nt' else 4
        # self.device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
        # if self.device == 'cpu':
        #     # Use OpenCL for Intel UHD Graphics (iGPU) if available
        #     try:
        #         self.device = torch.device('opencl:0')
        #         print(f'Running on device: {self.device}')
        #     except RuntimeError:
        #         print('No OpenCL device found. Running on CPU.')
        # else:
        #     print(f'Running on device: {self.device}')
        
        # Initialize AI Model for Face Detection
        # self.mtcnn = MTCNN(
        #     image_size = 160, margin = 14, min_face_size = 20, keep_all = True,
        #     thresholds = [0.6, 0.7, 0.7], factor=0.709, post_process=True,
        #     device=self.device
        # )
        
        # self.mtcnn, self.mtcnn_live, self.resnet = setup_models(self.device)
        # self.saved_faces_path = 'saved_faces'
        # self.saved_embeddings, self.saved_names = load_saved_embeddings(
        #     self.saved_faces_path,
        #     self.mtcnn,
        #     self.resnet,
        #     self.device
        # )
        #Define the directory where the models are saved
        # self.models_dir = "models"
        # self.model_files = os.listdir(self.models_dir)
        #Find the model file with latest date
        # self.latest_model_file = None
        # self.latest_date = None
        # for filename in self.model_files:
        #     if filename.endswith(".pt"):
        #         self.date = extract_date_from_filename(filename)
        #         if self.latest_date is None or self.date > self.latest_date:
        #             self.latest_model_file = filename
        #             self.latest_date = self.date
        # self.data_dir = 'saved_faces'            
        # self.dataset = datasets.ImageFolder(self.data_dir, transform=transforms.Resize((512, 512)))
                    
        # if self.latest_model_file:
        #     self.model_path = os.path.join(self.models_dir, self.latest_model_file)
        #     self.model = InceptionResnetV1(
        #         classify = True,
        #         pretrained='vggface2',
        #         num_classes=len(self.dataset.class_to_idx)
        #     )
        #     self.model.load_state_dict(torch.load(f=self.model_path))
        #     self.model.eval().to(self.device)
        #     print(f"Loaded model {self.model_path} to {self.device}")
        # else:
        #     print("No model found in the specified directory")
            
        # try:
        #     self.load_data = torch.load('data.pt')
        #     self.embedding_list = self.load_data[0]
        #     self.names = self.load_data[1]
        # except IndexError as e:
        #     print(f"Error accessing data.pt: {e}")
        # print(f"")
        # print(f"self.names: {self.names}")
        # print("Loaded data.pt")
        # --- Camera Setup ---
        # Camera initialize
        atexit.register(self.cleanup)
        # if not isCameraConfigured:
        #     print("Camera not yet configured, will now configure...")
        # if camera is None:
        self.initializeCamera()
        self.frame_count = 0
        self.rec_frame_count = 0
        self.rec_flag = False
        self.rec_frames = []
        print("Set frame count to 0")
        # self.dist_list=[]
        # print("Set list to empty")
        # self.min_dist = float('inf')
        # # self.min_dist_idx=-1
        # print("Set min dist to -1")
        # self.detectedFacePrev = False
        # self.name=''
        # self.color=(0, 0, 0)
        # self.boxes = []
        # self.detectedFace = False
        self.running = False
        # start_date = datetime(2024, 11, 24, tzinfo=pytz.timezone('Asia/Manila'))
        # now = datetime.now(pytz.timezone('Asia/Manila'))
        # self.current_day = get_day_count(start_date, now)
        # self.output_folder = f"DetectedFaces/Day_{self.current_day:02d}"
        # os.makedirs(self.output_folder, exist_ok=True)
        print("Initialize complete")

    def initializeCamera(self):
        # global camera, isCameraConfigured
        global isCameraConfigured
        retry_attempts = 3
        for attempt in range(retry_attempts):
            # if self.camera is None and camera is None:
            if self.camera is None:
                try:
                    print("Setting camera to Picamera2")
                    # camera = Picamera2()
                    # self.camera = camera
                    # self.camera = Picamera2()
                    self.camera = get_camera()
                    # camera = self.camera
                    #Load tuning file
                    # print("Loading camera tuning file")
                    # tuning_file_path = "/home/valdepenas/myBoardHub/Arducam-477P-Pi5.json"
                    # print("Loaded camera tuning file")
                    # self.camera.load_tuning_file(tuning_file_path)
                    # # Create video configuration with resolution set to 640x480 and 180-degree rotation
                    # print("Creating camera config")
                    # self.config = self.camera.create_video_configuration(
                    #     transform=libcamera.Transform(rotation=180),
                    #     buffer_count=10,
                    #     main={"size": (854, 480), "stride": 3416},#main={"size": (640, 480)},  (640, 360), (1280, 720)
                    # )
                    # self.camera.configure(self.config)
                    # print("Loaded camera config")
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
                        # logging.error("Failed to initialize camera after multiple attempts.")
                        raise
            # elif camera is not None:
            #     self.camera = camera
    
    # @staticmethod    
    # async def send_fps(fps):
    #     global my_websocket
    #     await my_websocket.send(json.dumps({"type":"currentFPS","fps":fps, 'AssignedOwnerID': assigned_ownerId}))

    # @staticmethod    
    # async def send_name(name):
    #     global my_websocket, lasttime_sendname
    #     now = datetime.now(pytz.timezone('Asia/Manila'))
    #     if lasttime_sendname is None:
    #         lasttime_sendname = now
    #         # await my_websocket.send(json.dumps({"Name": name, "time": now.strftime("%m/%d/%Y %H:%M:%S")}))
    #         print(f"Sent security_alert with name: {name}")
    #         await my_websocket.send(json.dumps({"type":"security_alert",'AssignedOwnerID': assigned_ownerId,"Name": name, "time": now.strftime("%m/%d/%Y %H:%M:%S")}))
            
        
        # elif lasttime_sendname.minute < now.minute and lasttime_sendname.hour == now.hour:
        #     lasttime_sendname = now
        #     # await my_websocket.send(json.dumps({"Name": name, "time": now.strftime("%m/%d/%Y %H:%M:%S")}))
        #     print(f"Sent security_alert with name: {name}")
        #     await my_websocket.send(json.dumps({"type":"security_alert",'AssignedOwnerID': assigned_ownerId,"Name": name, "time": now.strftime("%m/%d/%Y %H:%M:%S")}))
    # @staticmethod
    # async def send_frame_error(message):
    #     global my_websocket
    #     await my_websocket.send(json.dumps({"type":"frame_error",'message': message}))

    def cleanup(self):
        """Release camera resources."""
        try:
            # global camera
            # camera.stop()
            # camera=None
            if hasattr(self, 'camera') and self.camera is not None:
                print("Stopping and releasing camera resources")
                self.camera.stop()
                # camera.stop()
                self.camera = None
                # camera = None
                
        except Exception as e:
            print("Failed to initialize camera after multiple attempts.")
            # logging.error(f"Error during camera cleanup: {e}")
        # Release model resources
        # try:
        #     if hasattr(self, 'mtcnn') and self.mtcnn is not None:
        #         print("Releasing MTCNN resources")
        #         del self.mtcnn
        #         self.mtcnn = None
        # except Exception as e:
        #     print(f"Error during MTCNN cleanup: {e}")
        #     logging.error(f"Error during MTCNN cleanup: {e}")

        try:
            if hasattr(self, 'model') and self.model is not None:
                print("Releasing Plate Detection Model resources")
                del self.model
                self.model = None
        except Exception as e:
            print(f"Error during Plate Detection Model cleanup: {e}")
            # logging.error(f"Error during InceptionResnetV1 cleanup: {e}")

    async def stopClass(self):
        """Release resources and stop the stream."""
        print("Stopping CameraStreamTrack...")
        atexit._run_exitfuncs()
        self.cleanup()

    def surveillanceMode(self):
        # global camera
        try:
            # frame = camera.capture_array()
            frame = self.camera.capture_array() 
            self.frame_count += 1
            start_time = time.time()
            if self.frame_count % 2 != 0:
                return
            
            img = Image.fromarray(frame)
            # results = self.model.predict(source=img)
            
            
            # for result in results:
            #     # Extract predictions
            #     detections = result.boxes.xywh.cpu().numpy()  # xywh format: [x_center, y_center, width, height]
            #     confidences = result.boxes.conf.cpu().numpy()
            #     class_ids = result.boxes.cls.cpu().numpy()  # class id = 0: plant, 1: pot
                
            #     for detection, confidence, class_id in zip(detections, confidences, class_ids):
            #         x_center, y_center, width, height = detection
            #         conf = confidence
            #         print(f"X: {x_center:.2f}, Y: {y_center:.2f}, "
            #               f"W: {width:.2f}, H: {height:.2f}, Confidence: {conf:.2f}")
            #         if class_id == 1 and conf > 0.5:  # Pot
            #             pot_detected = True
            #             x_pot, x_pot = x_center, y_center
            #             w_pot, h_pot = width, height
            #             condition = w_pot * 2
            #             # print(f"Pot -> X: {x_pot:.2f}, Y: {y_pot:.2f}, "
            #             #       f"W: {width:.2f}, H: {height:.2f}, Confidence: {conf:.2f}")

            #         elif class_id == 0 and conf > 0.5 and width < condition:  # Plant
            #             plant_detected = True
            #             x_plant, y_plant = x_center, y_center
            #             # print(f"Plant -> X: {x_plant:.2f}, Y: {y_center:.2f}, "
            #             #       f"W: {width:.2f}, H: {height:.2f}
            # if plant_detected and pot_detected:
            #     print("Detected potted plant!")
            #     # picam2.stop()
            #     # print("Camera stopped.")
            #     combined_center_x, position = calculate_combined_center_x(x_pot, x_plant, 1280)
            #     print(f"Combined Center X: {combined_center_x:.2f}, Position Relative to Frame Center: {position}")

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

    async def recv(self):
        # global camera
        global now_live
        try:
            # frame = camera.capture_array()
            frame = self.camera.capture_array() 
            self.frame_count += 1
            # await get_character_input()
            start_time = time.time()
            
            if self.frame_count % 3 != 0:
                if frame.shape[2] == 4:
                    # print(f'shape is: {frame.shape[2]}')
                    frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)
                video_frame = VideoFrame.from_ndarray(frame, format="bgr24")
                video_frame.pts, video_frame.time_base = await self.next_timestamp()
                return video_frame

            # img = Image.fromarray(frame)

            # for result in results:
            #     # Extract predictions
            #     detections = result.boxes.xywh.cpu().numpy()  # xywh format: [x_center, y_center, width, height]
            #     confidences = result.boxes.conf.cpu().numpy()
            #     class_ids = result.boxes.cls.cpu().numpy()  # class id = 0: plant, 1: pot
                
            #     for detection, confidence, class_id in zip(detections, confidences, class_ids):
            #         x_center, y_center, width, height = detection
            #         conf = confidence
            #         print(f"X: {x_center:.2f}, Y: {y_center:.2f}, "
            #               f"W: {width:.2f}, H: {height:.2f}, Confidence: {conf:.2f}")
            #         if class_id == 1 and conf > 0.5:  # Pot
            #             pot_detected = True
            #             x_pot, x_pot = x_center, y_center
            #             w_pot, h_pot = width, height
            #             condition = w_pot * 2
            #             frame = cv2.rectangle(frame, 
            #                 (int(x_center - width / 2), int(y_center - height / 2)),
            #                 (int(x_center + width / 2), int(y_center + height / 2)),
            #                 (0, 225, 0), 2)
            #             # print(f"Pot -> X: {x_pot:.2f}, Y: {y_pot:.2f}, "
            #             #       f"W: {width:.2f}, H: {height:.2f}, Confidence: {conf:.2f}")

            #         elif class_id == 0 and conf > 0.5 and width < condition:  # Plant
            #             plant_detected = True
            #             x_plant, y_plant = x_center, y_center
            #             frame = cv2.rectangle(frame, 
            #                       (int(x_center - width / 2), int(y_center - height / 2)),
            #                       (int(x_center + width / 2), int(y_center + height / 2)),
            #                       (0, 0, 225), 2)
            #             # print(f"Plant -> X: {x_plant:.2f}, Y: {y_center:.2f}, "
            #             #       f"W: {width:.2f}, H: {height:.2f}
            # if plant_detected and pot_detected:
            #     print("Detected potted plant!")
            #     # picam2.stop()
            #     # print("Camera stopped.")
            #     combined_center_x, position = calculate_combined_center_x(x_pot, x_plant, 1280)
            #     print(f"Combined Center X: {combined_center_x:.2f}, Position Relative to Frame Center: {position}")
        


            if self.frame_count % 60 == 0:
                fps = 1 / (time.time() - start_time)
                print(f"\rCurrent FPS: {fps:.2f}")   
                # await self.send_fps(fps) 
           
            if self.frame_count >= 600:
                self.frame_count = 1 #Reset number
           
            if frame.shape[2] == 4:
                frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)
            
            video_frame = VideoFrame.from_ndarray(frame, format="bgr24")
            video_frame.pts, video_frame.time_base = await self.next_timestamp()

            return video_frame
        except Exception as e:
            print(f"Error during camera capture: {e}")
            logging.error(f"Error during camera capture: {e}")
            self.cleanup()
            exit(1)
            raise

def release_camera():
    global myCamera
    if myCamera is not None:
        myCamera.close()
        myCamera = None
        print("Camera released.")


# async def send_ping(ws):
#     while True:
#         try:
#             await ws.send(json.dumps({"type": "ping"}))
#             # print('Sent ping to server')
#             await asyncio.sleep(30)  # Send a ping every 30 seconds
#         except websockets.exceptions.ConnectionClosed:
#             print('ping not sent, websocket connection closed, will restart')
#             break

# async def send_admin_logs(ws, message):
#     rpi_id = get_cpu_serial()
#     try:
#         await ws.send(json.dumps({"type": "logs", "RaspberryPiID": rpi_id, "log": message}))
#     except websockets.exceptions.ConnectionClosed:
#         print("Unable to send log message to admin, websocket connection closed.")
#         logging.error("Unable to send log message to admin, websocket connection closed.")

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
# async def send_face_reg_result(message, ws, target, id):
#     global number_of_faces_registered
#     global newUser
#     global updateFace
#     global needToTrain
#     print(target["id"])
#     await ws.send(json.dumps({
#         "type": "registrationResult",
#         "message": message,
#         "target": target["id"],
#         "faceRegStatus": "training",
#         "from": id
#     }))
#     if message == "Face registered successfully!":
#         # number_of_faces_registered += 1
#         print(f"1. Number of faces registered: {number_of_faces_registered}")
#         save_num_faces_registered(number_of_faces_registered)
#         newUser = False
#         updateFace = False
#         # fine_tunining_training(ws)
#     elif message == "Face data updated successfully!":
#         print(f"2. Number of faces registered: {number_of_faces_registered}")
#         # save_num_faces_registered(number_of_faces_registered)
#     needToTrain = True
#     if needToTrain:
#         global trainingMin, trainingHour
#         now = datetime.now(pytz.timezone('Asia/Manila'))
#         if now.minute < 50:
#             trainingMin = now.minute + 10
#             trainingHour = now.hour
#         else:
#             trainingMin = 0
#             trainingHour = now.hour + 1
#         print("Needs to train AI model, dataset has been updated...")
#         save_training_record(f"{trainingHour}:{trainingMin}","To be trained")
#         print(f"will train in {trainingHour}:{trainingMin}")
#     await close_web_rtc_session(target["id"])
        
async def close_web_rtc_session(peer_id):
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
async def cleanup_peer_connection(peer_id):
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

async def ably_connection():
    print(f"ABLY_API_KEY: {ABLY_API_KEY}")
    secret_key = os.environ.get("AUTH_SECRETKEY")
    print(f"AUTH_SECRETKEY: {secret_key}")
    ably_client = AblyRealtime(ABLY_API_KEY)
    global peer_connections
    try:
        raspberry_pi_id = get_cpu_serial()
        await setup_stream()
        
        # channel = ably_client.channels.get(raspberry_pi_id)
        webRTCChannel=ably_client.channels.get('webrtc-signaling-channel')
        async def on_message(msg):
            # data = json.loads(msg.data)
            print(f"Received message 'WebRTC-client-register': {msg.data}")
        #     data = json.loads(msg.data)
        #     await messageToMyID(data)
        async def messageToMyID(message):
            data = message.data
            
            if data['role'] == 'Admin':
                if data['message'] == 'Connect':
                    try:
                        print(f"Data: {data}")
                        global now_live, surveillanceTask
                        peer_id = data["from"]
                        print(f"Received start_live_stream from {peer_id}")
                        if peer_id in peer_connections:
                            await cleanup_peer_connection(peer_id)
                        pc = RTCPeerConnection()
                        peer_connections[peer_id] = pc
                        if data.get('camera_stream', False):
                            global stream, surveillance_running
                            if stream is None:
                                stream = CameraStreamTrack()
                                print("Start CameraStreamTrack")
                            elif surveillance_running:
                                print('Stream is running, now stopping...')
                                surveillance_running = False
                                print("Paused surveillance mode...")
                                surveillanceTask.cancel()
                            print("Starting WebRTC Mode...")
                            camera_track = stream
                            pc.addTrack(camera_track)
                            now_live = True
                        # print("Still good 1")
                        offer = await pc.createOffer()
                        await pc.setLocalDescription(offer)
                        print(f"Will send offer to: {peer_id}")
                        await webRTCChannel.publish('WebRTC-client-register', {
                            "type": "offer",
                            "payload":{
                                "sdp": pc.localDescription.sdp,
                                "type": pc.localDescription.type
                            },
                            # "sdp": pc.localDescription.sdp,
                            "from": raspberry_pi_id,
                            "target": peer_id,
                            "role": "Raspberry Pi"
                        })
                        @pc.on("icecandidate")
                        async def on_icecandidate(candidate):
                            if candidate:
                                print('sending candidate')
                                await webRTCChannel.publish('WebRTC-client-register',{
                                    "type": "ice-candidate",
                                    "payload": {
                                        "candidate": candidate.candidate,
                                        "sdpMid": candidate.sdpMid,
                                        "sdpMLineIndex": candidate.sdpMLineIndex,
                                    },
                                    "target": peer_id,
                                    "from": raspberry_pi_id,
                                    "role": "Raspberry Pi"
                                })
                        
                        # print("Still good 2")
                        @pc.on("connectionstatechange")
                        async def on_connectionstatechange():
                            if pc.connectionState in ["failed", "disconnected", "closed"]:
                                print(f"Connection state {pc.connectionState} for peer {peer_id}. Cleaning up. Live stream")
                                await cleanup_peer_connection(peer_id)
                                now_live = False
                                print("Resumed surveillance mode...")
                                surveillance_running = True
                                # exit(1)
                                    
                    except Exception as ex:
                        print("Exception error during start_live_stream setup: ", ex)
                if data["type"] == "ice-candidate":
                    print(f"Data: {data}")
                    print(f"Message for {data['type']} received: {data}")
                    peer_id = data["from"]["id"]
                    if peer_id in peer_connections:
                        pc = peer_connections[peer_id]
                        candidate_dict = parse_candidate(data["payload"]["candidate"])
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
                                sdpMLineIndex=data["payload"]['sdpMLineIndex']
                            )
                            await pc.addIceCandidate(candidate)
                        else:
                            print(f"No payload in ICE candidate from {peer_id}")
                        @pc.on("connectionstatechange")
                        async def on_connectionstatechange():
                            if pc.connectionState in ["failed", "disconnected", "closed"]:
                                print(f"Connection state {pc.connectionState} for peer {peer_id}. Cleaning up. Ice-candidate")
                                await cleanup_peer_connection(peer_id)
                if data['type'] == "answer":
                    print(f"Message for {data['type']} received: {data}")
                    # global peer_connections
                    try:
                        peer_id = data["from"]["id"]
                        print(f"Received answer from: {peer_id}")
                        if peer_id in peer_connections:
                            pc = peer_connections[peer_id]
                            answer = RTCSessionDescription(
                                sdp=data["payload"]["sdp"],
                                type=data["payload"]["type"]
                            )
                            await pc.setRemoteDescription(answer)
                            print(f"Set remote description with answer from {peer_id}")
                            @pc.on("connectionstatechange")
                            async def on_connectionstatechange():
                                if pc.connectionState in ["failed", "disconnected", "closed"]:
                                    print(f"Connection state {pc.connectionState} for peer {peer_id}. Cleaning up. Answer")
                                    # await cleanup_peer_connection(peer_id)

                        else:
                            print(f"No peer connection found for {peer_id}")
                    except Exception as e:
                        print(f"Error handling answer: {e}")


        # await webRTCChannel.subscribe(raspberry_pi_id, messageToMyID)
        await webRTCChannel.subscribe('WebRTC-client-register', messageToMyID)
        print("Listening for Commands")
        
        # while True:
            #send data
        # data={
        #     'id': raspberry_pi_id,
        #     'role':"Raspberry Pi",
        #     'sessionID': raspberry_pi_id
        # }
        # await channel.publish(raspberry_pi_id, data)
        await webRTCChannel.publish('WebRTC-client-register',{
            'role': 'Raspberry Pi',
            'id': raspberry_pi_id,
            'message':"Connect",
            'sessionID': raspberry_pi_id
        })
        # print(f"Published data: {data}")
        while True:
            await asyncio.sleep(1)
    # except ably.AblyException as e:
    #     print(f"Ably Error: {e}")
    except Exception as e:
        print(f"General Error: {e}")
    finally:
        await ably_client.close()#Ensure the connection is closed on exit

async def setup_stream():
    global stream, surveillance_running, surveillanceTask
    if stream is None:
        print("stream is none. Will attach camera stream track to it")
        stream = CameraStreamTrack()
        surveillance_running = True
        surveillanceTask = asyncio.create_task(surveillance_loop())

# async def websocket_communication():
#     atexit.register(release_camera)
#     device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
#     global assigned_ownerId, websocket_status, pc, my_websocket, stream, peer_connections, camera, number_of_faces_registered, surveillance_running
#     # frame_count = 0
#     # base_folder = "saved_faces"
#     # mtcnn_face_reg = MTCNN(margin=20, image_size = 360, min_face_size=100, select_largest=True, thresholds = [0.6, 0.7, 0.7], factor=0.709, post_process=False, device=device)
#     # #  image_size = 160, margin = 14, min_face_size =18, keep_all = True,
#     #         # thresholds = [0.6, 0.7, 0.7], factor=0.709, post_process=True,
#     #         # device=self.device
#     # label = None
#     raspberry_pi_id = get_cpu_serial()
#     auth_token = generate_token(raspberry_pi_id)
#     surveillanceTask = None
#     while True:
#         try:
#             current_wifi = get_wifi_ssid()
#             print(f"Current WiFi SSID: {current_wifi}")
#             # status, lastFineTuning, number_of_faces_registered = load_last_training_record()

#             # if status == "Failed" or status == "To be trained":
#             #     print(f"Last finetuning training: {lastFineTuning}, status: {status}. Will attempt to train now...")
#             #     # await send_admin_logs(ws, f"Last finetuning training: {lastFineTuning}, status: {status}. Will attempt to train now...")
#             #     await fine_tunining_training()
#             # if stream is None:
#                 # stream = SecuritySurveillanceStreamTrack()
#                 # data_dir = './saved_faces'
#                 # batch_size = count_immediate_folders(data_dir)
#                 # if batch_size > number_of_faces_registered:
#                 #     print("Detected larger dataset than last training, will retrain and fine-tune on updated dataset.")
#                 #     await fine_tunining_training()
#                 # print("Starting Surveillance Mode...")
#                 # stream = CameraStreamTrack()
#                 # surveillance_running = True
#                 # surveillanceTask = asyncio.create_task(surveillance_loop())
#                 # surveillanceTask = asyncio.create_task(stream.surveillance_loop())
#             # async with websockets.connect(f"wss://{SERVER_URL}?token={auth_token}") as ws:
#                 # my_websocket = ws
                
#                 # print(f"Connected to WebSocket server: {SERVER_URL}")
#                 # await send_admin_logs(ws, f"{raspberry_pi_id} connected to websocket server: {SERVER_URL}")
#                 # websocket_status = "Connected"
#                 # auth_message = {
#                 #     'type': 'auth',
#                 #     'token': auth_token
#                 # }
#                 # await ws.send(json.dumps(auth_message))
#                 # print(f'Sent: {auth_message}')
                
#                 # checkUpdateTask = asyncio.create_task(checkTime(ws))
#                 # ping_task = asyncio.create_task(send_ping(ws))#ping pong mechanism with websocket server to maintain connection
#                 # ir_led_task = asyncio.create_task(controlIRLeds())
#                 # pc = None
#                 # if assigned_ownerId is None:
#                 #     print("Waiting for configuration.")
#                 # status, lastFineTuning, number_of_faces_registered = load_last_training_record()
#                 # if status == "Failed":
#                 #     print(f"Last finetuning training: {lastFineTuning}, status: {status}. Will attempt to train now...")
#                 #     await send_admin_logs(ws, f"Last finetuning training: {lastFineTuning}, status: {status}. Will attempt to train now...")
#                 #     await fine_tunining_training(ws)

#                 # try:
#                 #     # print("no error")
#                 #     # async for message in ws:
#                 #         data = json.loads(message)
#                 #         # if started_training != "started training..." and camera is None:
#                 #         #     print(f"Message received from server: {data}")

                        
#                 #         if data['type'] == "start_live_stream":#websocket signaling message
#                 #             global now_live
#                 #             try:
#                 #                 # global peer_connections
#                 #                 peer_id = data["from"]
#                 #                 # await send_admin_logs(ws, (f"{raspberry_pi_id} received start_live_stream_security from {peer_id}"))
#                 #                 print(f"received start_live_stream_security from {peer_id}")
#                 #                 # create webrtc offer and send to the data["from"] and when the webrtc connection is established between the two, send the camera stream...
                                
#                 #                 if peer_id in peer_connections:
#                 #                     await cleanup_peer_connection(peer_id)
#                 #                 # if pc:
#                 #                     # await pc.close()
#                 #                 pc = RTCPeerConnection()
#                 #                 peer_connections[peer_id] = pc

#                 #                 if data.get('camera_stream', False):
#                 #                     # stream = None
                                    
#                 #                     if stream is None:
#                 #                         stream = CameraStreamTrack()
#                 #                     elif surveillance_running:
#                 #                         print('stream is running, now stopping...')
#                 #                         # stream.cleanup()
#                 #                         surveillance_running = False
#                 #                         print("Paused surveillance mode...")
#                 #                         # surveillanceTask.cancel()
#                 #                     # stream = None
#                 #                     # stream = CameraStreamTrack()
#                 #                     print("Starting WEBRTC Mode...")
#                 #                     camera_track = stream#media_relay().subscribe(stream)
#                 #                     # camera_track = CameraStreamTrack()
#                 #                     pc.addTrack(camera_track)
#                 #                     # pc.addTrack(stream)
#                 #                     now_live = True

#                 #                 @pc.on("icecandidate")
#                 #                 async def on_icecandidate(candidate):
#                 #                     if candidate:
#                 #                         print('sending candidate')
#                 #                         await ws.send(json.dumps({
#                 #                             "type": "ice-candidate",
#                 #                             "payload": {
#                 #                                 "candidate": candidate.candidate,
#                 #                                 "sdpMid": candidate.sdpMid,
#                 #                                 "sdpMLineIndex": candidate.sdpMLineIndex,
#                 #                             },
#                 #                             "target": peer_id,
#                 #                             "from": raspberry_pi_id
#                 #                         }))
#                 #                 offer = await pc.createOffer()
#                 #                 await pc.setLocalDescription(offer)
                                
#                 #                 print(f"Will send offer to {peer_id} for start_live_stream")
#                 #                 await ws.send(json.dumps({
#                 #                     "type": "offer",
#                 #                     "payload":{
#                 #                         "sdp": pc.localDescription.sdp,
#                 #                         "type": pc.localDescription.type
#                 #                     },
#                 #                     # "sdp": pc.localDescription.sdp,
#                 #                     "from": raspberry_pi_id,
#                 #                     "target": peer_id
#                 #                 }))
#                 #                 @pc.on("connectionstatechange")
#                 #                 async def on_connectionstatechange():
#                 #                     if pc.connectionState in ["failed", "disconnected", "closed"]:
#                 #                         print(f"Connection state {pc.connectionState} for peer {peer_id}. Cleaning up. Live stream")
#                 #                         await cleanup_peer_connection(peer_id)
#                 #                         now_live = False
#                 #                         print("Resumed surveillance mode...")
#                 #                         surveillance_running = True
#                 #                         # exit(1)

#                 #             except Exception as ex:
#                 #                 print(f"Error during start_live_stream_security setup: {ex}")
#                 #                 logging.error(f"Error during start_live_stream_security setup: {ex}")
#                 #                 now_live = False
                            

#                         # if data.get('type') == "offer":
#                         #     # global peer_connections
#                         #     print(f'received offer from {data["from"]}')
#                         #     # await handle_offer(data)
#                         #     peer_id = data["from"]["id"]
                            
#                         #     if peer_id in peer_connections:
#                         #         await cleanup_peer_connection(peer_id)

#                         #     pc = RTCPeerConnection()
#                         #     peer_connections[peer_id] = pc
#                         #     @pc.on("track")
#                         #     async def on_track(track):
#                         #         global isFaceRegDone
#                         #         frame_count = 1
#                         #         frame_num = 1
#                         #         rand_angle = -24
#                         #         print(f"{frame_count}")
#                         #         print(f"Receiving {track.kind} track")
#                         #         @track.on("ended")
#                         #         async def on_track_ended():
#                         #             print("Track has ended. Cleaning up resources.")
#                         #             await cleanup_peer_connection(peer_id)

#                         #         while True:
#                         #             try:
#                         #                 frame = await track.recv() 
#                         #                 rgb_frame = frame.to_rgb()
#                         #                 print(f'frame format name: {rgb_frame.format.name} height: {rgb_frame.height} width: {rgb_frame.width}')
#                         #                 if frame:
#                         #                     image = rgb_frame.to_image()#rgb pillow image
#                         #                     # np_frame = rgb_frame.to_ndarray(format="bgr24")
#                         #                 # if frame is not None:
#                         #                     # frame_rgb = cv2.cvtColor(np_frame, cv2.COLOR_BGR2RGB)
#                         #                     # pil_image = Image.fromarray(frame_rgb)
#                         #                     folder_path = os.path.join(base_folder, label)
#                         #                     print(f"frame count: {frame_count} - {frame_num}")
#                         #                     if frame_num > 45 and frame_num % 11 == 0 and frame_count <= 5:
#                         #                         img_cropped_list, probs = mtcnn_face_reg(image, return_prob=True)
#                         #                         print(f'probabilities of face: {probs}')
                                                
                            
#                         #                         if img_cropped_list is not None:
#                         #                             if probs > 0.9995:
#                         #                                 rand_angle = rand_angle + random.randint(6, 10)
#                         #                                 # image = Image.fromarray(rgb_frame)
#                         #                                 rotated_image = image.rotate(rand_angle)
#                         #                                 rotated_frame = np.array(rotated_image)
#                         #                                 save_paths=[f'{folder_path}/{str(frame_count).zfill(2)}.jpeg']
#                         #                                 faces = mtcnn_face_reg(image, save_path=save_paths)
#                         #                                 for path in save_paths:
#                         #                                     if frame_count <= 5:
#                         #                                         save_paths_rot=[f'{folder_path}/{str(frame_count+15).zfill(2)}.jpeg']
#                         #                                         faces_rotated = mtcnn_face_reg(rotated_frame, save_path=save_paths_rot)
#                         #                                     faceImage = Image.open(path)
#                         #                                     enhancer = ImageEnhance.Brightness(faceImage)
#                         #                                     factor = 1.2
#                         #                                     brightImage = enhancer.enhance(factor)
#                         #                                     brightImage.save(f'{folder_path}/{str(frame_count+5).zfill(2)}.jpeg')
#                         #                                     factor = 0.8
#                         #                                     darkImage = enhancer.enhance(factor)
#                         #                                     darkImage.save(f'{folder_path}/{str(frame_count+10).zfill(2)}.jpeg')
#                         #                                 if frame_count >= 5 and isFaceRegDone is None:
#                         #                                     global faceScanProcess
#                         #                                     faceScanProcessResult = 'None'
#                         #                                     if faceScanProcess == "Updating face data":
#                         #                                         faceScanProcessResult = "Face data updated successfully!"
#                         #                                     elif faceScanProcess == "Processing new face data":
#                         #                                         faceScanProcessResult = "Face registered successfully!"
#                         #                                     isFaceRegDone = True
#                         #                                     print(faceScanProcessResult)
#                         #                                     if isFaceRegDone:
#                         #                                         print("Sending face reg result")
#                         #                                         await send_face_reg_result(faceScanProcessResult, ws, data["from"], raspberry_pi_id)
#                         #                                         break
#                         #                                 elif frame_count > 5 and isFaceRegDone:
#                         #                                     print("STOP FACE REGISTRATION")
#                         #                                     break
#                         #                                 if frame_count == 6:
#                         #                                     print("STOP FACE REGISTRATION")
#                         #                                     break
#                         #                                 frame_count += 1
                                                        
#                         #                             else:
#                         #                                 print("Face registration failed.")
#                         #                     frame_num += 1    
#                         #                     if frame_count == 6:
#                         #                         print("STOP FACE REGISTRATION")
#                         #                         print("Sending face reg result")
#                         #                         await send_face_reg_result(faceScanProcessResult, ws, data["from"], raspberry_pi_id)
#                         #                         break    

#                         #             except Exception as e:
#                         #                 # print(f"Error processing frame: {e}")
#                         #                 continue
#                         #     @pc.on("icecandidate")
#                         #     async def on_icecandidate(candidate):
#                         #         if candidate:
#                         #             target = data["from"]

#                         #             await ws.send(json.dumps({
#                         #                 "type": "ice-candidate",
#                         #                 "payload": {
#                         #                     "candidate": candidate.candidate,
#                         #                     "sdpMid": candidate.sdpMid,
#                         #                     "sdpMLineIndex": candidate.sdpMLineIndex,
#                         #                 },
#                         #                 "target": target["id"],
#                         #                 "from": raspberry_pi_id
#                         #             }))
#                         #     offer = RTCSessionDescription(sdp=data["payload"]["sdp"], type=data["payload"]["type"])
#                         #     await pc.setRemoteDescription(offer)
#                         #     answer = await pc.createAnswer()
#                         #     await pc.setLocalDescription(answer)
#                         #     target = data["from"]
#                         #     print(f'will send answer to {target["id"]}')
#                         #     await ws.send(json.dumps({
#                         #         "type": "answer",
#                         #         "payload": {
#                         #             "sdp": pc.localDescription.sdp,
#                         #             "type": pc.localDescription.type
#                         #         },
#                         #         "target": target["id"],
#                         #         "from": raspberry_pi_id
#                         #     }))
#                         #     @pc.on("connectionstatechange")
#                         #     async def on_connectionstatechange():
#                         #         if pc.connectionState in ["failed", "disconnected", "closed"]:
#                         #             print(f"Connection state {pc.connectionState} for peer {peer_id}. Cleaning up. Face registration")
#                         #             await cleanup_peer_connection(peer_id)


#                         if data["type"] == "ice-candidate":
#                             # global peer_connections
#                             peer_id = data["from"]["id"]
#                             if peer_id in peer_connections:
#                                 pc = peer_connections[peer_id]
                                
#                                 candidate_dict = parse_candidate(data["payload"]["candidate"])
#                                 if data["payload"]:
#                                     candidate = RTCIceCandidate(
#                                         foundation=candidate_dict['foundation'],
#                                         component=candidate_dict['component'],
#                                         protocol=candidate_dict['protocol'],
#                                         priority=candidate_dict['priority'],
#                                         ip=candidate_dict['ip'],
#                                         port=candidate_dict['port'],
#                                         type=candidate_dict['type'],
#                                         sdpMid=data["payload"]['sdpMid'],
#                                         sdpMLineIndex=data["payload"]['sdpMLineIndex']
#                                     )
#                                     await pc.addIceCandidate(candidate)
#                                 else:
#                                     print(f"No payload in ICE candidate from {peer_id}")

#                                 @pc.on("connectionstatechange")
#                                 async def on_connectionstatechange():
#                                     if pc.connectionState in ["failed", "disconnected", "closed"]:
#                                         print(f"Connection state {pc.connectionState} for peer {peer_id}. Cleaning up. Ice-candidate")
#                                         await cleanup_peer_connection(peer_id)

#                             # else:
#                             #     print(f"No peer connection found for {peer_id}")

#                         if data.get('type') == "answer":
#                             # global peer_connections
#                             try:
#                                 peer_id = data["from"]["id"]
#                                 print(f"Received answer from: {peer_id}")
#                                 if peer_id in peer_connections:
#                                     pc = peer_connections[peer_id]
#                                     answer = RTCSessionDescription(
#                                         sdp=data["payload"]["sdp"],
#                                         type=data["payload"]["type"]
#                                     )
#                                     await pc.setRemoteDescription(answer)
#                                     print(f"Set remote description with answer from {peer_id}")
#                                     @pc.on("connectionstatechange")
#                                     async def on_connectionstatechange():
#                                         if pc.connectionState in ["failed", "disconnected", "closed"]:
#                                             print(f"Connection state {pc.connectionState} for peer {peer_id}. Cleaning up. Answer")
#                                             # await cleanup_peer_connection(peer_id)

#                                 else:
#                                     print(f"No peer connection found for {peer_id}")
#                             except Exception as e:
#                                 print(f"Error handling answer: {e}")

#                         # if data['type'] == 'stream-ready':
#                         #     os.makedirs('saved_faces', exist_ok=True)
#                         #     label = f'{data["label"]}'
#                         #     label = label.replace("'", "")
#                         #     label = label.replace("ñ", "n")
#                         #     folderName = f'saved_faces/{label}'
#                         #     folderName = folderName.replace("'", "")
#                         #     target = data["from"]
#                         #     global faceScanProcess
#                         #     if not os.path.exists(folderName):
#                         #         # global number_of_faces_registered
#                         #         global newUser
#                         #         faceScanProcess = "Processing new face data"
#                         #         number_of_faces_registered += 1
#                         #         print(f"2. Number of faces registered: {number_of_faces_registered}")
#                         #         newUser = True
#                         #         os.makedirs(folderName, exist_ok=True)
#                         #         print(f'Created a folder: {folderName}')
#                         #         await ws.send(json.dumps({
#                         #             "type": "user-face-reg-status",
#                         #             "target": target,
#                         #             "from": raspberry_pi_id,
#                         #             "message": "Processing new face data"
#                         #         }))
#                         #     else: 
#                         #         global updateFace
#                         #         faceScanProcess = "Updating face data"
#                         #         updateFace = True
#                         #         print(f"{folderName} already exists")
#                         #         await ws.send(json.dumps({
#                         #             "type": "user-face-reg-status",
#                         #             "target": target,
#                         #             "from": raspberry_pi_id,
#                         #             "message": "Updating face data"
#                         #         }))
                            
#                         #     print(f'target: {target}')
#                         #     await ws.send(json.dumps({
#                         #         "type": "request-stream",
#                         #         "target": target,
#                         #         "from": raspberry_pi_id
#                         #     }))

#                         # if data.get('type') == 'config' and 'ownerId' in data:
#                         #     save_assigned_owner(data['ownerId'])
#                         #     assigned_ownerId = data['ownerId']
#                         #     print(f"Raspberry Pi configured with ownerId: {assigned_ownerId}")
#                         #     await ws.send(json.dumps({
#                         #         'type': 'register',
#                         #         'role': 'raspberry-pi',
#                         #         'id': raspberry_pi_id,
#                         #         'userID': raspberry_pi_id,
#                         #         'wifiSSID': current_wifi
#                         #     }))
#                         #     print('sent registration message')
#                         #     await send_admin_logs(ws, f"{raspberry_pi_id} sent registration message.")
#                         if data.get('type') == 'pong':
#                             if websocket_status != "Connected":
#                                 websocket_status = "Connected"

#                         if data.get('type') == 'start-finetuning-after-delay':
#                             global trainingMin, trainingHour
#                             global startTraining
#                             time_obj = datetime.strptime(data['delay'], '%m/%d/%Y %H:%M:%S')
#                             trainingMin = int(time_obj.strftime('%M'))
#                             trainingHour = int(time_obj.strftime('%H'))
#                             print(f"Will start training in: {data['delay']}")
#                             startTraining = True

#                     while True:
#                         if assigned_ownerId is None:
#                             print(".")
#                         await asyncio.sleep(1)

#                 except websockets.exceptions.ConnectionClosed:
#                     print("Websocket connection closed. Attempting to reconnect...")
#                     websocket_status = "Disconnected"

#                 finally:
#                     # checkUpdateTask.cancel()
#                     ping_task.cancel()
#                     # ir_led_task.cancel()
#                     # GPIO_Cleanup()

#         except Exception as e:
#             print(f"Error in WebSocket communication: {e}")
#             websocket_status = "Error"

#         print("waiting before attempting to reconnect...")
#         # Wait before attempting to reconnect
#         await asyncio.sleep(5)

async def main():
    # load_assigned_owner()
    # await websocket_communication()
    await ably_connection()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        # GPIO_Cleanup()
        release_camera()
        print("Python Script stopped by user via keyboard interrupt.")