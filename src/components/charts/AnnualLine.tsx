"use client";
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ReportEntry {
  month: number;
  status: string;
  total_reports: number;
}

// Define a color palette for different statuses
const statusColors: Record<string, string> = {
  Pending: "rgba(255, 99, 132, 1)", // Red
  Resolved: "rgba(54, 162, 235, 1)", // Blue
  "In Progress": "rgba(255, 206, 86, 1)", // Yellow
  Closed: "rgba(75, 192, 192, 1)", // Teal
  Default: "rgba(153, 102, 255, 1)", // Purple (fallback)
};

const AnnualReports = () => {
  const [chartData, setChartData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnualData = async () => {
      try {
        const response = await fetch("/api/getChart/AnnualReportStats");
        if (!response.ok) throw new Error("Failed to fetch data");

        const data: ReportEntry[] = await response.json();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Group data by status
        const statusMap: Record<string, number[]> = {};

        data.forEach(({ month, status, total_reports }) => {
          if (!statusMap[status]) {
            statusMap[status] = new Array(12).fill(0); // Initialize array with 12 zeros
          }
          statusMap[status][month - 1] = total_reports || 0; // Assign report count to corresponding month
        });

        // Convert grouped data into datasets
        const datasets = Object.entries(statusMap).map(([status, counts]) => ({
          label: status,
          data: counts,
          borderColor: statusColors[status] || statusColors.Default,
          backgroundColor: (statusColors[status] || statusColors.Default).replace("1)", "0.5)"),
          fill: false,
          tension: 0.4,
        }));

        setChartData({ labels: months, datasets });
      } catch (error) {
        console.error("Error fetching annual report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnualData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => `Reports: ${tooltipItem.raw}`,
        },
      },
    },
    scales: {
      x: { title: { display: true, text: "Month" } },
      y: { title: { display: true, text: "Report Count" }, beginAtZero: true },
    },
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-center font-semibold text-lg mb-4">Annual Report Status Comparison</h2>
      {loading ? <p className="text-center">Loading...</p> : <Line data={chartData} options={chartOptions} />}
    </div>
  );
};

export default AnnualReports;
