"use client";
import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from "chart.js"; // Corrected import
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// Define a TypeScript interface for the chart data
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

const backgroundColors = [
  "rgba(255, 99, 132, 0.5)",  // Red
  "rgba(54, 162, 235, 0.5)",  // Blue
  "rgba(255, 206, 86, 0.5)",  // Yellow
  "rgba(75, 192, 192, 0.5)",  // Teal
];

const borderColors = [
  "rgba(255, 99, 132, 1)", 
  "rgba(54, 162, 235, 1)", 
  "rgba(255, 206, 86, 1)", 
  "rgba(75, 192, 192, 1)",
];

interface ReportStats {
  status: string;
  total_reports: number;
}

const ReportDoughnutChart = () => {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: "Report Status Distribution",
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch("/api/getChart/getReportStats");
        if (!response.ok) throw new Error("Failed to fetch data");

        const data: ReportStats[] = await response.json();
        const labels = data.map(entry => entry.status);
        const counts = data.map(entry => entry.total_reports);

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
      }
    };

    fetchChartData();
  }, []);

  // Options for the chart, with percentage calculations in the tooltip
  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<"doughnut">) => {
            const rawValue = tooltipItem.raw as number;
            const total = tooltipItem.dataset.data.reduce(
              (acc: number, value: unknown) => acc + (value as number), 0
            );
            const percentage = ((rawValue / total) * 100).toFixed(2);
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
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
};

export default ReportDoughnutChart;
