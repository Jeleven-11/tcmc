"use client";

import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { useEffect, useState } from "react";
import axios from "axios";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ReportData {
  year: number;
  unread: number;
  dropped: number;
  on_investigation: number;
  solved: number;
}

const ReportStatusChart = () => {
  const [chartData, setChartData] = useState<ReportData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ReportData[]>("/api/report-status");
        setChartData(response.data);
      } catch (error) {
        console.error("Error fetching report status data:", error);
      }
    };

    fetchData();
  }, []);

  const years = chartData.map((data) => data.year);

  const data = {
    labels: years,
    datasets: [
      {
        label: "Unread",
        data: chartData.map((data) => data.unread),
        borderColor: "yellow",
        backgroundColor: "rgba(255, 255, 0, 0.5)",
        tension: 0.4,
      },
      {
        label: "Dropped",
        data: chartData.map((data) => data.dropped),
        borderColor: "red",
        backgroundColor: "rgba(255, 0, 0, 0.5)",
        tension: 0.4,
      },
      {
        label: "On Investigation",
        data: chartData.map((data) => data.on_investigation),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.5)",
        tension: 0.4,
      },
      {
        label: "Solved",
        data: chartData.map((data) => data.solved),
        borderColor: "green",
        backgroundColor: "rgba(0, 255, 0, 0.5)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Annual Report Status Comparison</h2>
      <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};

export default ReportStatusChart;
