"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Download } from "lucide-react";
import { FaFilePen } from "react-icons/fa6";

interface VehicleLog {
  id: number;
  type: string;
  licensePlate: string;
  timestamp: string;
}

const sampleLogs: VehicleLog[] = [
  { id: 1, type: "Car", licensePlate: "ABC-1234", timestamp: "2025-02-20 14:30:00" },
  { id: 2, type: "Motorcycle", licensePlate: "XYZ-5678", timestamp: "2025-02-20 14:45:00" },
];

const LoggedVehicles = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const handleDownload = () => {
    const filteredLogs = sampleLogs.filter((log) =>
      log.timestamp.startsWith(selectedDate)
    );

    const csvContent =
      "ID,Vehicle Type,License Plate,Timestamp\n" +
      filteredLogs.map((log) => `${log.id},${log.type},${log.licensePlate},${log.timestamp}`).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `logged_vehicles_${selectedDate || "all"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Logged Vehicles Card */}
      <div
        className="bg-green-50 p-4 rounded shadow-md flex items-center justify-center min-h-[8rem] cursor-pointer hover:shadow-lg transition"
        onClick={() => setIsOpen(true)}
      >
        <div className="mr-4">
          <FaFilePen className="h-10 w-10 text-green-400" /> 
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-green-600">2</h2>
          <p className="text-lg sm:text-xl text-gray-500">Logged Vehicles</p>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Logged Vehicles</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 text-gray-600 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Date Selector & Download Button */}
            <div className="flex justify-between items-center mb-4">
              <input
                type="date"
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button
                onClick={handleDownload}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
              >
                <Download className="w-5 h-5 mr-2" />
                Download CSV
              </button>
            </div>

            {/* Vehicle Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 px-4 py-2">ID</th>
                    <th className="border border-gray-200 px-4 py-2">Vehicle Type</th>
                    <th className="border border-gray-200 px-4 py-2">License Plate</th>
                    <th className="border border-gray-200 px-4 py-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2">{log.id}</td>
                      <td className="border border-gray-200 px-4 py-2">{log.type}</td>
                      <td className="border border-gray-200 px-4 py-2">{log.licensePlate}</td>
                      <td className="border border-gray-200 px-4 py-2">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default LoggedVehicles;
