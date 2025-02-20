"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface Report {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
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
            {category ? `${category} ` : " "}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Reports List */}
        {reports.length > 0 ? (
          <ul className="space-y-4 max-h-[400px] overflow-y-auto">
            {reports.map((report) => (
              <li key={report.id} className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-gray-600">{report.description}</p>
                <p className="text-sm text-gray-400">Created: {report.created_at}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No reports found.</p>
        )}
      </motion.div>
    </div>
  );
};

export default ReportModal;
