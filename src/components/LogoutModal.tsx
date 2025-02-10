"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-80 relative"
      >
        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Confirm Logout</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Are you sure you want to log out?</p>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border-b text-gray-500 
        font-semibold 
        bg-white rounded-lg 
        border border-gray-500 
        transition hover:bg-gray-500 
        hover:text-white focus:outline-none 
        focus:shadow-[0_0_0_4px_theme(colors.gray.500),0_0_0_8px_theme(colors.gray.300)]"
        >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-red-500 
        font-semibold bg-white 
        rounded-lg border 
        border-red-500 
        transition hover:bg-red-500 
        hover:text-white focus:outline-none 
        focus:shadow-[0_0_0_4px_theme(colors.red.500),0_0_0_8px_theme(colors.red.300)]"
        >
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LogoutModal;
