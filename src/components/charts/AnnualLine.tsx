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
  ChartOptions,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ReportEntry {
  month: number;
  status: string;
  total_reports: number;
}

interface AnnualReportsProps {
  apiEndpoint: string;
  title?: string;
}

// Define a color palette for different statuses
const statusColors: Record<string, string> = {
  unread: "rgba(255, 99, 132, 1)", // Red
  dropped: "rgba(54, 162, 235, 1)", // Blue
  on_investigation: "rgba(255, 206, 86, 1)", // Yellow
  solved: "rgba(75, 192, 192, 1)", // Teal
  default: "rgba(153, 102, 255, 1)", // Purple (fallback)
};

const AnnualReports: React.FC<AnnualReportsProps> = ({ apiEndpoint, title = "Annual Report Status Comparison" }) => {
  const [chartData, setChartData] = useState<ChartData<"line"> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnualData = async () => {
      try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error("Failed to fetch data");

        const data: ReportEntry[] = await response.json();
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Initialize an object to store monthly counts for each status
        const statusMap: Record<string, number[]> = {
          unread: new Array(12).fill(0),
          dropped: new Array(12).fill(0),
          on_investigation: new Array(12).fill(0),
          solved: new Array(12).fill(0),
        };

        // Populate the statusMap with actual data
        data.forEach(({ month, status, total_reports }) => {
          if (statusMap[status] !== undefined) {
            statusMap[status][month - 1] = total_reports || 0;
          }
        });

        // Convert grouped data into datasets
        const datasets = Object.entries(statusMap).map(([status, counts]) => ({
          label: status.replace("_", " ").toUpperCase(), // Format status labels
          data: counts,
          borderColor: statusColors[status] || statusColors.default,
          backgroundColor: (statusColors[status] || statusColors.default).replace("1)", "0.5)"),
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
  }, [apiEndpoint]);

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false, // Ensures it adjusts to container size
    layout: { 
      padding: { top: 10, bottom: 10 } // Prevents excessive space issues 
    },
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `Reports: ${tooltipItem.raw as number}`,
        },
      },
    },
    scales: {
      x: { 
        title: { display: true, text: "Month" } 
      },
      y: { 
        title: { display: true, text: "Report Count" }, 
        beginAtZero: true 
      },
    },
  };
  


  return (
    <div className="w-full max-w-3xl mx-auto h-[400px] overflow-hidden">
      <h2 className="text-center font-semibold text-lg mb-4">{title}</h2>
      <div className="h-[400px]">
        {loading ? <p className="text-center">Loading...</p> : chartData && <Line data={chartData} options={chartOptions} />}
      </div>
    </div>
  );
};

export default AnnualReports;
