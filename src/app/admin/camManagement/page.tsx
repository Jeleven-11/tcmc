"use client";

import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import NoCrashIcon from '@mui/icons-material/NoCrash';
import { useState } from "react";
import ImageGalleryDrawer from "@/components/PlateNumImg";

// Import modals
import { MockAddCam } from "@/components/mockAddCam";
import { MockEditCam } from "@/components/mockEditCam";
import { MockDelCam } from "@/components/mockDelCam";
// import Image from "next/image";
import AblyConnectionComponent from '@/components/admin/RealtimeAbly';
import { Paper } from "@mui/material";
import GdriveFetchVideos from "@/components/admin/gdrive/GdriveFetchVideos";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
const mockCameras = [
  { id: 1, name: "Camera 1", location: "1st Street", feed: "/mock.png" },
  // { id: 2, name: "Camera 2", location: "Street A", feed: "/mock.png" },
  // { id: 3, name: "Camera 3", location: "Straight Street", feed: "/mock.png" },
  // { id: 4, name: "Camera 4", location: "Strait Street", feed: "/mock.png" },
];

const CamManagement = () => {
  const [cameras, setCameras] = useState(mockCameras);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<{ id: number; name: string; location: string } | null>(null);
  const [currentFPS, setCurrentFPS] = useState<string>('0');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const handleAdd = (name: string, location: string) => {
    setCameras([...cameras, { id: Date.now(), name, location, feed: "/mock.png" }]);
  };

  const handleEdit = (id: number, name: string, location: string) => {
    setCameras(cameras.map(cam => (cam.id === id ? { ...cam, name, location } : cam)));
  };

  const handleDelete = (id: number) => {
    setCameras(cameras.filter(cam => cam.id !== id));
  };
  const handleShowMessage = async(type:string, message: string, file_id?: string, file_name?: string) => {
    if(type==='FPS'){
      setCurrentFPS(Number(message).toFixed(2));
    } else if (type==='Upload'){
      try{
        const response = await fetch('api/storeFileID',{
          method:'POST',
          body:JSON.stringify({"file_id":file_id, "file_name":file_name})
        })
        const responseData = await response.json();
        if (!response.ok){
          throw new Error (responseData.error);
        }
      } catch (error){
        console.error(error);
      } 
    }
  }

  return (
    <>
      <Paper sx={{ height: 'auto', width: '100%', padding: 3, marginBottom: 3 }}>
        <div className="mb-6">
          <header className="bg-blue-600 text-white p-4 mb-3 mt-3 rounded-lg shadow-md">
            <h1 className="text-xl font-semibold">Live Feed Camera</h1>
          </header>
          <div className="bg-blue-100 border border-blue-500 text-blue-700 px-4 py-3 rounded mb-4 flex items-start">
            <span className="mr-2 text-xl">ℹ️</span>
            <p>Below are active cameras and their live video feed.</p>
          </div>
          <div className="flex justify-end mb-6">
            <button onClick={() => setIsAddOpen(true)} className="flex items-center bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700">
              <PlusIcon className="h-6 w-6 text-white mr-2" /> Add Camera
            </button>
          </div>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsGalleryOpen(true)} // <- Toggle drawer
              className="flex items-center bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700"
            >
              <NoCrashIcon className="h-6 w-6 text-white mr-2" /> View License Plate Captures
            </button>
          </div>
          
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-3">
            {cameras.map((camera) => (
              
              <div key={camera.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                {/* <Image 
    src={camera.feed} 
    alt={camera.name} 
    width={400} // specify the width
    height={200} // specify the height
    className="w-full h-40 object-cover" 
  /> */}
                <AblyConnectionComponent onMessage={handleShowMessage} isRecording={isRecording}/>
                
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{camera.name}</h3>
                    <p className="text-gray-500 text-sm">{camera.location}</p>
                  </div>
                  <p className="text-gray-500 text-sm">FPS: {currentFPS}</p>
                  <div className="flex space-x-2">
                    {
                    !isRecording?
                      <button onClick={() => { setIsRecording(true) }} className="text-blue-600 hover:text-blue-800">
                        <FiberManualRecordIcon color="error" className="w-5 h-5" />
                      </button>:
                      <button onClick={() => { setIsRecording(false) }} className="text-blue-600 hover:text-blue-800">
                        <StopIcon color="error" className="w-5 h-5" />
                      </button>
                    }
                    <button onClick={() => { setSelectedCamera(camera); setIsEditOpen(true); }} className="text-blue-600 hover:text-blue-800">
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => { setSelectedCamera(camera); setIsDeleteOpen(true); }} className="text-red-600 hover:text-red-800">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modals */}
          <MockAddCam isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />

          {selectedCamera && (
              <MockEditCam isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} camera={selectedCamera} onEdit={handleEdit} />
          )}

          {selectedCamera && (
              <MockDelCam isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} camera={selectedCamera} onDelete={handleDelete} />
          )}

<ImageGalleryDrawer open={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
        
        </div>
        <GdriveFetchVideos />
      </Paper>
    </>
  )
};

export default CamManagement;
