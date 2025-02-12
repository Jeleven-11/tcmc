"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface mockAddCamProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, location: string) => void;
}

export const MockAddCam = ({ isOpen, onClose, onAdd }: mockAddCamProps) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = () => {
    if (name.trim() && location.trim()) {
      onAdd(name, location);
      setName("");
      setLocation("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Add Camera</h2>
        <input className="border p-2 w-full mb-2" type="text" placeholder="Camera Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border p-2 w-full mb-4" type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
        </div>
      </motion.div>
    </div>
  );
};
