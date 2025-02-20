"use client";
import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

interface ReportStats {
  status: string;
  total_reports: number;
}

// Generate dynamic colors if needed
const generateColors = (length: number) =>
{
  if (length <= 0)
    return { backgroundColors: [], borderColors: [] }

  const baseColors = [
    "rgba(255, 206, 86, 0.5)",  // Yellow
    "rgba(54, 162, 235, 0.5)",  // Blue
    "rgba(255, 99, 132, 0.5)",  // Red
    "rgba(75, 192, 192, 0.5)",  // Teal
  ];
  const borderBaseColors = [
    "rgba(255, 206, 86, 1)",
    "rgba(54, 162, 235, 1)",
    "rgba(255, 99, 132, 1)", 
    "rgba(75, 192, 192, 1)",
  ];
  return {
    backgroundColors: baseColors.slice(0, length).concat(Array(Math.max(0, length - baseColors.length)).fill("rgba(153, 102, 255, 0.5)")),
    borderColors: borderBaseColors.slice(0, length).concat(Array(Math.max(0, length - borderBaseColors.length)).fill("rgba(153, 102, 255, 1)")),
  };
};

const ReportDoughnutChart = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch("/api/getChart/ReportStats");
        if (!response.ok) throw new Error("Failed to fetch data");

        const data: ReportStats[] = await response.json();
        const labels = data.map(entry => entry.status.charAt(0).toUpperCase() + entry.status.slice(1).replace("_", " "));
        // const counts = data.map(entry => entry.total_reports);
        const counts = data.map(entry => Number(entry.total_reports) || 0)

        // const { backgroundColors, borderColors } = generateColors(labels.length);
        const { backgroundColors, borderColors } = generateColors(Math.max(labels.length, 1))

        setChartData({
          labels,
          datasets: [
            {
              label: "Report Status Distribution",
              data: counts,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<"doughnut">) => {
            const rawValue = tooltipItem.raw as number;
            const dataset = tooltipItem.dataset.data as number[] || [];
            const total = dataset.reduce((acc, value) => acc + (value || 0), 0);
            const percentage = total ? ((rawValue / total) * 100).toFixed(2) : "0.00";
            return `${tooltipItem.label}: ${rawValue} (${percentage}%)`;
          },
        },
      },
      legend: {
        position: "top" as const,
      },
    },
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-center font-semibold text-lg mb-4">Reports by Status</h2>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : chartData ? (
        <Doughnut data={chartData} options={chartOptions} />
      ) : (
        <p className="text-center text-red-500">No data available</p>
      )}
    </div>
  );
};

export default ReportDoughnutChart;
