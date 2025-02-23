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
import LGDaily from "@/components/charts/LGDaily";
import LGWeekly from "@/components/charts/LGWeekly";
import LGMonthly from "@/components/charts/LGMonthly";
import LGYearly from "@/components/charts/LGYearly";
import ReportDoughnutChart from "@/components/charts/ReportDonut";
import ReportModal from "@/components/ReportCardModals";
import axios from "axios";
import { Paper } from "@mui/material";

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
    if (category === "Passing Vehicles") return; // Prevent modal for this card

    let formattedCategory = category;

    // Convert frontend labels to match database values
    if (category === "Unread Reports") formattedCategory = "Unread";
    if (category === "Dropped Reports") formattedCategory = "Dropped";
    if (category === "On-Investigation Reports") formattedCategory = "On_Investigation";
    if (category === "Solved Reports") formattedCategory = "Solved";

    console.log(`📡 Fetching reports with status: ${formattedCategory}`);

    setLoading(true);
    try {
      let response;
      if (category === "Total Reports") {
        response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/getReports`);
      } else {
        response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/getReports?status=${formattedCategory}`
        );
      }

      console.log("✅ Fetched reports:", response.data);
      setReports(response.data.reports);
      setSelectedCategory(category);
      setIsModalOpen(true);
    } catch (error) {
      console.error("❌ Error fetching reports:", error);
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
      value: "4", // Replace with dynamic count if available
      color: "gray",
      icon: <FaTruckArrowRight className="h-10 w-10 text-gray-400" />,
    },
  ];

  return (
    <Paper sx={{ height: 'auto', width: '100%', padding: 3, marginBottom: 2 }}>
      <div className="min-h-screen">
        <header className="bg-blue-600 text-white p-4 mb-3 rounded-lg shadow-md">
          <h1 className="text-xl font-semibold">DASHBOARD</h1>
        </header>

        {/* Report Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              whileTap={card.label !== "Passing Vehicles" ? { scale: 0.95 } : {}}
              whileHover={card.label !== "Passing Vehicles" ? { scale: 1.05 } : {}}
              className={`p-4 rounded shadow-md flex items-center justify-center min-h-[8rem] 
                bg-${card.color}-50 ${card.label !== "Passing Vehicles" ? "cursor-pointer" : ""}`}
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
        {loading ? (
          <p className="text-center text-gray-500">Loading reports...</p>
        ) : (
          <ReportModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            reports={reports}
            category={selectedCategory}
            refreshReports={fetchReportCounts}
          />
        )}
      </div>
    </Paper>
  );
};

export default AdminDashboard;
