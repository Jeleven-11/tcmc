"use client";

import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { useEffect, useState } from "react";
import axios from "axios";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

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
        const response = await axios.get<ReportData[]>("/api/getChart/AnnualComp");
        setChartData(response.data);
      } catch (error) {
        console.error("Error fetching report status data:", error);
      }
    };

    fetchData();
  }, []);

  // Show only the last 10 years
  const last10Years = chartData.slice(-10);
  const years = last10Years.map((data) => data.year);

  const data = {
    labels: years,
    datasets: [
      {
        label: "Unread",
        data: last10Years.map((data) => data.unread),
        borderColor: "yellow",
        backgroundColor: "rgba(255, 255, 0, 0.5)",
        tension: 0.4,
      },
      {
        label: "Dropped",
        data: last10Years.map((data) => data.dropped),
        borderColor: "red",
        backgroundColor: "rgba(255, 0, 0, 0.5)",
        tension: 0.4,
      },
      {
        label: "On Investigation",
        data: last10Years.map((data) => data.on_investigation),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.5)",
        tension: 0.4,
      },
      {
        label: "Solved",
        data: last10Years.map((data) => data.solved),
        borderColor: "green",
        backgroundColor: "rgba(0, 255, 0, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 5, // Limits the number of x-axis labels
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      zoom: {
        pan: { enabled: true, mode: "x" as const }, // Explicitly set "x"
        zoom: { wheel: { enabled: true }, mode: "x" as const }, // Explicitly set "x"
      },
    },
  };
  

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Annual Report Status Comparison</h2>
      <div style={{ height: "400px" }}> {/* Fixed height */}
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default ReportStatusChart;
