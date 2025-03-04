"use client";

import { useState, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    Tooltip,
    PointElement,
    LineElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

interface AnnualReportData {
    year: number;
    status: string;
    count: number;
}

const AnnualReports = () => {
    const [chartData, setChartData] = useState<{
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            borderColor: string;
            fill: boolean;
            tension: number;
        }[];
    }>({
        labels: [],
        datasets: [],
    });
    

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const response = await fetch("/api/getChart/AnnualComp");
                const data: AnnualReportData[] = await response.json();
            
                // Extract unique years
                const years = [...new Set(data.map((entry) => entry.year))];
            
                // Define status categories for the X-axis
                const statuses = ["unread", "on_investigation", "solved", "dropped"];
                const statusColors = ["yellow", "blue", "green", "red"];
            
                // Each dataset should represent a YEAR (not a status)
                const datasets = years.map((year, index) => ({
                    label: `${year}`, // Year as the dataset label
                    data: statuses.map(
                        (status) =>
                            data.find((entry) => entry.year === year && entry.status === status)?.count || 0
                    ),
                    borderColor: statusColors[index % statusColors.length], // Rotate colors for different years
                    fill: false,
                    tension: 0.4,
                }));
            
                setChartData({
                    labels: statuses.map((status) => status.replace("_", " ").toUpperCase()), // X-axis is status
                    datasets, // Each line represents a different year
                });
            } catch (error) {
                console.error("Error fetching annual chart data:", error);
            }
        };            

        fetchChartData();
    }, []);

    return (
        <Line
            data={chartData}
            options={{
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Year",
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Report Count",
                        },
                        beginAtZero: true,
                    },
                },
            }}
        />
    );
};

export default AnnualReports;
