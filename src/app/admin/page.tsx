"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MdOutlinePendingActions } from "react-icons/md";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { HiDocumentCheck } from "react-icons/hi2";
import { TbMessageCancel } from "react-icons/tb";
import { FaTruckArrowRight } from "react-icons/fa6";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import LoggedVehicles from "@/components/VehicleLogModal";
import LGDaily from "@/components/LGDaily";
import LGWeekly from "@/components/LGWeekly";
import LGMonthly from "@/components/LGMonthly";
import LGYearly from "@/components/LGYearly";
import ReportDoughnutChart from "@/components/ReportDonut";
import ReportModal from "@/components/ReportCardModals";
import axios from "axios";

export const dynamic = "force-dynamic";

const AdminDashboard = () => {
  const [reportData, setReportData] = useState({
    total: 0,
    unread: 0,
    dropped: 0,
    on_investigation: 0,
    solved: 0,
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReportCounts();
  }, []);

  const fetchReportCounts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reportcounter`
      );
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Error fetching report counts:", error);
    }
  };

  const fetchReports = async (category: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/getReports?status=${category}`
      );
      setReports(response.data);
      setSelectedCategory(category);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
    setLoading(false);
  };

  const cards = [
    {
      label: "Total Reports",
      value: reportData.total,
      color: "blue",
      icon: <DocumentTextIcon className="h-10 w-10 text-blue-600" />,
    },
    {
      label: "Unread Reports",
      value: reportData.unread,
      color: "yellow",
      icon: <MdOutlinePendingActions className="h-10 w-10 text-yellow-600" />,
    },
    {
      label: "Dropped Reports",
      value: reportData.dropped,
      color: "red",
      icon: <TbMessageCancel className="h-10 w-10 text-red-600" />,
    },
    {
      label: "On-Investigation Reports",
      value: reportData.on_investigation,
      color: "orange",
      icon: <HiOutlineDocumentSearch className="h-10 w-10 text-orange-600" />,
    },
    {
      label: "Solved Reports",
      value: reportData.solved,
      color: "blue",
      icon: <HiDocumentCheck className="h-10 w-10 text-blue-400" />,
    },
    {
      label: "Passing Vehicles",
      value: "4",
      color: "gray",
      icon: <FaTruckArrowRight className="h-10 w-10 text-gray-400" />,
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <header className="bg-blue-600 text-white p-4 rounded mb-6">
        <h1 className="text-2xl font-bold">DASHBOARD</h1>
      </header>

      {/* Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className={`cursor-pointer bg-${card.color}-50 p-4 rounded shadow-md flex items-center justify-center min-h-[8rem]`}
            onClick={() => fetchReports(card.label)}
          >
            <div className="mr-4">{card.icon}</div>
            <div className="flex flex-col items-center">
              <h2 className={`text-2xl sm:text-3xl font-semibold text-${card.color}-600`}>
                {card.value}
              </h2>
              <p className="text-lg sm:text-xl text-gray-500">{card.label}</p>
            </div>
          </motion.div>
        ))}
        <LoggedVehicles />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {[
          { title: "Daily Reports", Component: LGDaily },
          { title: "Weekly Reports", Component: LGWeekly },
          { title: "Monthly Reports", Component: LGMonthly },
          { title: "Yearly Reports", Component: LGYearly },
        ].map((chart, index) => (
          <div key={index} className="bg-white p-4 rounded shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">{chart.title}</h2>
            <chart.Component />
          </div>
        ))}

        {/* Report Breakdown Chart */}
        <div className="col-span-1 md:col-span-2 flex justify-center bg-white p-4 rounded shadow-md">
          <div className="w-full max-w-md md:max-w-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
              Report Breakdown
            </h2>
            <ReportDoughnutChart />
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {isModalOpen && (
        <ReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          reports={reports}
          category={selectedCategory}
          refreshReports={fetchReportCounts}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
