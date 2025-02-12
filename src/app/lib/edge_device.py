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
        # --- Camera Setup ---
        # Camera initialize
        atexit.register(self.cleanup)
        self.initializeCamera()
        self.frame_count = 0
        self.rec_frame_count = 0
        self.rec_flag = False
        self.rec_frames = []
        print("Set frame count to 0")
        self.running = False
        self.start_time = time.time() 
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
            print("Failed to initialize camera after multiple attempts.")
       
        try:
            if hasattr(self, 'model') and self.model is not None:
                print("Releasing Plate Detection Model resources")
                del self.model
                self.model = None
        except Exception as e:
            print(f"Error during Plate Detection Model cleanup: {e}")

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

    async def recv(self):
        # global camera
        global now_live
        try:
            # frame = camera.capture_array()
            frame = self.camera.capture_array() # A Picamera2
            self.frame_count += 1
            # await get_character_input()
            # start_time = time.time()
            
            if frame.shape[2] == 4:
                frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)
            if self.frame_count % 3 != 0:
                # if frame.shape[2] == 4:
                #     # print(f'shape is: {frame.shape[2]}')
                #     frame = cv2.cvtColor(frame, cv2.COLOR_RGBA2BGR)
                video_frame = VideoFrame.from_ndarray(frame, format="bgr24")
                video_frame.pts, video_frame.time_base = await self.next_timestamp()
                return video_frame

            
            if self.frame_count % 60 == 0:
                # fps = 1 / (time.time() - start_time)
                # print(f"\rCurrent FPS: {fps:.2f}")   
                # # await self.send_fps(fps) 
                elapsed_time = time.time() - self.start_time
                if elapsed_time > 0:
                    fps = 60 / elapsed_time
                    print(f"\rCurrent FPS: {fps:.2f}")
                    self.start_time = time.time()  # Reset timer
                    now_live = True
           
            if self.frame_count >= 6000:
                self.frame_count = 1 #Reset number
           
            
            video_frame = VideoFrame.from_ndarray(frame, format="bgr24")
            video_frame.pts, video_frame.time_base = await self.next_timestamp()

            return video_frame
        except Exception as e:
            print(f"Error during camera capture: {e}")
            # logging.error(f"Error during camera capture: {e}")
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
        self.pc = None
    async def cleanup_peer_connection(self):
        # self.pc = self.peer_connections[peer_id]
        self.pc.on("connectionstatechange", None)  
        self.pc.on("icecandidate", None)
        await self.pc.close()  
    async def ably_connection(self):
        print(f"ABLY_API_KEY: {ABLY_API_KEY}")
        secret_key = os.environ.get("AUTH_SECRETKEY")
        print(f"AUTH_SECRETKEY: {secret_key}")
        ably_client = AblyRealtime(ABLY_API_KEY)
        try:
            
            raspberry_pi_id = get_cpu_serial()
            await setup_stream()
            
            # channel = ably_client.channels.get(raspberry_pi_id)
            webRTCChannel=ably_client.channels.get('webrtc-signaling-channel')
            async def on_icecandidate(candidate):
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
                        "role": "Raspberry Pi"
                    }
                    print('sending candidate to {peer_id} with {candidatePayload}')
                    await webRTCChannel.publish('WebRTC-client-register', candidatePayload)
            async def on_connectionstatechange(peer_id):
                if self.pc.connectionState in ["failed", "disconnected", "closed"]:
                    print(f"Connection state {self.pc.connectionState} for peer {peer_id}. Cleaning up. Live stream")
                    await cleanup_peer_connection(peer_id, self.peer_connections)
                    now_live = False
                    print("Resumed surveillance mode...")
                    surveillance_running = True
                    # exit(1)       
                
            async def messageToMyID(message):
                data = message.data
                
                if data['role'] == 'Admin':
                    # print(f"Data: {data}")
                    
                    if data['type'] == 'Connect':
                        global surveillanceTask
                        try:
                            peer_id = data["from"]
                            print(f"Received start_live_stream from {peer_id}")
                            
                            if peer_id in self.peer_connections:
                                await cleanup_peer_connection()
                            self.pc = RTCPeerConnection()
                            # self.pc.log_level = logging.DEBUG
                            self.pc.on("connectionstatechange", lambda: on_connectionstatechange(peer_id))
                            self.pc.on("icecandidate", lambda: on_icecandidate)
                            # self.pc.log_event('ice_candidate_gathering', logging.DEBUG)
                            print(f"Peer Connections: {self.peer_connections}")
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
                                self.pc.addTrack(camera_track)
                                # now_live = True
                            # print("Still good 1")
                            
                            
                            
                            
                            
                            offer = await self.pc.createOffer()
                            await self.pc.setLocalDescription(offer)
                            offerPayload = {
                                "type": "offer",
                                "payload":{
                                    "sdp": self.pc.localDescription.sdp,
                                    "type": self.pc.localDescription.type
                                },
                                # "sdp": pc.localDescription.sdp,
                                "from": raspberry_pi_id,
                                "target": peer_id,
                                "role": "Raspberry Pi"
                            }
                            print(f"Will send offer to: {peer_id}")
                            await webRTCChannel.publish('WebRTC-client-register', offerPayload)
                            
                            # print("Still good 2")
                            self.peer_connections[peer_id] = self.pc
                            print(f"Peer Connections after sending offer: {self.peer_connections}")
                            self.pc.on("connectionstatechange", lambda: on_connectionstatechange(peer_id))
                            
                                        
                        except Exception as ex:
                            print("Exception error during start_live_stream setup: ", ex)
                    if data["type"] == "ice-candidate":
                        print(f"Received ICE candidate.")
                        print(f"Peer Connections during ice-candidate: {self.peer_connections}")
                        peer_id = data["from"]
                        if peer_id in self.peer_connections:
                            print(f"Received ICE candidate from {peer_id}")
                            self.pc = self.peer_connections[peer_id]
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
                                    await self.pc.addIceCandidate(candidate)#I don't think this works, the flow stops here, it should continue on the eventlistener
                                    print(f"Added ICE Candidate from {peer_id}")
                                except Exception as e:
                                    print(f"Error adding ICE candidate from {peer_id}: {e}")   
                                
                            else:
                                print(f"No payload in ICE candidate from {peer_id}")
                            
                    if data['type'] == "answer":
                        # print(f"Message for {data['type']} received: {data}")
                        print(f"Peer Connections during answer: {self.peer_connections}")
                        try:
                            peer_id = data["from"]
                            print(f"Received answer from: {peer_id}")
                            if peer_id in self.peer_connections:
                                self.pc = self.peer_connections[peer_id]
                                answer = RTCSessionDescription(
                                    sdp=data["payload"]["sdp"],
                                    type=data["payload"]["type"]
                                )
                                await self.pc.setRemoteDescription(answer)
                                print(f"Set remote description with answer from {peer_id}")
                               

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
                'type':"Connect",
                'sessionID': raspberry_pi_id
            })
            global now_live
            if now_live == True:
                await webRTCChannel.publish('WebRTC-client-register',{
                    'role': 'Raspberry Pi',
                    'id': raspberry_pi_id,
                    'type':"Now Live",
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
            await self.cleanup_peer_connection()
            await ably_client.close()#Ensure the connection is closed on exit

async def setup_stream():
    global stream, surveillance_running, surveillanceTask
    if stream is None:
        print("stream is none. Will attach camera stream track to it")
        stream = CameraStreamTrack()
        surveillance_running = True
        surveillanceTask = asyncio.create_task(surveillance_loop())



async def main():
    # load_assigned_owner()
    # await websocket_communication()
    webrtc_connection = WebRTCConnection()
    await webrtc_connection.ably_connection()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        # GPIO_Cleanup()
        release_camera()
        print("Python Script stopped by user via keyboard interrupt.")