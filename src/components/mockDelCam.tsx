"use client";

import { motion } from "framer-motion";

interface mockDelCamProps {
  isOpen: boolean;
  onClose: () => void;
  camera: { id: number; name: string };
  onDelete: (id: number) => void;
}

export const MockDelCam = ({ isOpen, onClose, camera, onDelete }: mockDelCamProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
        <p className="mb-4">Are you sure you want to delete <strong>{camera.name}</strong>?</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          <button onClick={() => { onDelete(camera.id); onClose(); }} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
        </div>
      </motion.div>
    </div>
  );
};
