"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";

interface Report {
  id: number;
  title: string;
  fullName: string;
  vehicleType: "Motorcycle" | "Car" | "Van" | "Truck" | "Other";
  platenumber?: string | null;
  description: string;
  status: string;
  createdAt: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  category: string | null;
  refreshReports: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reports,
  category,
  refreshReports,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    refreshReports(); // Refresh reports before closing
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-lg"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold">
            {category ? `${category} Reports` : "Reports"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Reports List */}
        {reports.length > 0 ? (
          <ul className="space-y-4 max-h-[400px] mb-3 overflow-y-auto">
            {reports.map((report) => (
              <li key={report.id} className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold">Report ID: {report.id}</h3>
                <p className="text-gray-600">{report.description}</p>
                <p className="text-gray-600">Reported by: {report.fullName}</p>
                <p className="text-gray-600">Vehicle Type: {report.vehicleType}</p>
                {report.platenumber && (
                  <p className="text-gray-600">Plate Number: {report.platenumber}</p>
                )}
                <p className="text-sm text-gray-400">Created: {report.createdAt}</p>

                {/* Show Status if "Total Reports" */}
                {category === "Total Reports" && (
                  <p className="text-sm font-semibold text-blue-600">
                    Status: {report.status}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No reports found.</p>
        )}

        <Link
          href="/admin/watchlist"
          className="px-4 py-2 border-b text-gray-500 
        font-semibold 
        bg-white rounded-lg mt-3 
        border border-gray-500 
        transition hover:bg-gray-500 
        hover:text-white focus:outline-none 
        focus:shadow-[0_0_0_4px_theme(colors.gray.500),0_0_0_8px_theme(colors.gray.300)]"
        >
          View Full List
        </Link>
      </motion.div>
    </div>
  );
};

export default ReportModal;
