"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  PointElement,
  LineElement,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Tooltip)

interface WeeklyData
{
  labels: string[]
  datasets:
  {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    fill: boolean
    tension: number
  }[]
}

const WeeklyChart = () =>
{
    const [chartData, setChartData] = useState<WeeklyData>({ labels: [], datasets: [] })
    useEffect(() =>
    {
        const fetchChartData = async () =>
        {
            try
            {
                const response = await fetch("/api/getChart/WeeklyReports")
                if (!response.ok)
                    throw new Error("Failed to fetch data")

                const data = await response.json()
                if (!data || data.length === 0)
                    throw new Error("No data available")

                //const labels = data.map((entry: { time: string }) => formatWeek(entry.time))
                const counts = data.flatMap((entry: { [key: string]: number }) => Object.values(entry))

                setChartData(
                {
                    labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    datasets: [
                        {
                            label: "Weekly Reports",
                            data: counts,
                            borderColor: "blue",
                            backgroundColor: "rgba(0, 0, 255, 0.2)",
                            fill: true,
                            tension: 0.4,
                        },
                    ],
                })
            } catch (error) {
                console.error(error)
            }
        }

        fetchChartData()
    }, [])

    return (
        <Line
            data={chartData}
            options=
            {
                {
                    scales: {
                        x: {
                            type: "category",
                            title: {
                                display: true,
                                text: "Week Day",
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Report Count",
                            },
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return Math.round(parseInt(value.toString()))
                                }
                            }
                        },
                    },
                }
            }
      />
    )
}

export default WeeklyChart