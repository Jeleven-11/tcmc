# tcmc
TCMC is a web app built with NextJS, FCM, WebRTC, etc. This platform is your gateway in staying up-to-date with road updates.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Troubleshooting Raspberry Pi via terminal:
Make sure both devices are connected to the same Network:
- SSID: TP-Link_593D
- Password: 11112222

1. Open the Project Repository in VS Code (or any code IDE).
2. Open the VS Code terminal using ctrl + `
3. Choose between the 2 below...
### Transferring of files between Local machine (Laptop or Computer) and Raspberry Pi (Remote Device) via SFTP
Follow these steps if you need to update the running python file of the raspberry pi (edge_device.py), this will work for any file. 
> Example you edited some lines of edge_device.py, this will not reflect to the raspberry pi, we need to transfer the updated file...
1. **Move Current Working Directory:**
On your project repository we expect that you are currently located at the root of the project. We need to move to the directory where our files (files to transfer) or receive location will be. [---LOCATION---]
```bash
  cd src/app/lib
```
> This location contains the edge_device.py file and other python files (in the repository).
> This location will also receive the file we would transfer from raspberry pi (Incase we are getting files from it)
3. **Establishing Connection:**
Run this command the terminal:
```bash
  sftp myboardhub@rmv
```
> Note: Make sure both devices are on the same network.
2. **Enter Password:**
After entering the command from `Step 1`, you will be asked for a password, type this password manually (DO NOT COPY PASTE):
`RMVAnime002`.
> You should now see something like this:
```bash
myboardhub@rmv:~ $
```
3. **Change current directory:**
```bash
cd mctc/YOLOv11
```
4. **Transfer the updated edge_device.py to Raspberry Pi:**
```bash
put edge_device.py
```
5. **Exit or other actions:**
After transferring the file, we can exit or remain connected and do some actions later...
Below are some actions we can do:
- Get a file from Raspberry Pi
  ```bash
  get [filename.extension]
  ```
  > example:
  > ```bash
  > get edge_device.py
  > ```
  > This will get the `edge_device.py` from the Raspberry Pi to the Local machine (will be placed on the current location) see above, [---LOCATION---]
- Get a folder from Raspberry Pi
- Remove a file from Raspberry Pi (Needs caution)
- Put a file to Raspberry Pi
- See all files and folders in the current working directory
- Navigate
### Manual Control of Raspberry Pi (via SSH)
1. **Establishing Connection:**
Run this command the terminal:
```bash
  ssh myboardhub@rmv
```
> Note: Make sure both devices are on the same network.
2. **Enter Password:**
After entering the command from `Step 1`, you will be asked for a password, type this password(DO NOT COPY PASTE):
`RMVAnime002`.
> You should now see something like this:
```bash
myboardhub@rmv:~ $
```
3. **Change current directory:**
```bash
cd mctc/YOLOv11
```
4. **Enable virtual environment**
```bash
source mctc_env/bin/activate
```
5. **Disable Service File:**
This service file ensures/automates this commands on boot up of device. You need to disable to if you will manually control or troubleshoot the device.
```bash
sudo systemctl stop [name of service file]
```
> Replace `stop` by `restart` to re enable the service file.
6. **Run the python script:**
This python script runs the whole system pipeline (AI, Camera, and Communication to the NextJS Front-end).
```bash
python edge_device.py
```
> Note: You can exit or stop this after it starts running using `ctrl + c`.
7. **Optional Alternative:**
Instead of running all commands, just transfer the updated file via sftp then reboot the device.
```bash
sudo reboot
```
8.**Proper Shutdown:**
```bash
sudo shutdown
```
