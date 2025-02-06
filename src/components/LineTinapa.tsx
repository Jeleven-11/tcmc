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
import { DateTime } from "luxon";

ChartJS.register(CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Tooltip)

interface HourlyData
{
    labels: string[],
    datasets: {
        label: string,
        data: number[],
        borderColor: string,
        fill: boolean,
        tension: number,
    }[],
}

const formatTime = (isoString: string) => 
{
    return DateTime.fromISO(isoString).toFormat('HH:mm');;
}

const DailyReports = () =>
{
    const [chartData, setChartData] = useState<HourlyData>({labels: [], datasets: []})
    useEffect(() =>
    {
        const fetchChartData = async () =>
        {
            fetch('/api/getChartDailyReports')
            .then(response => response.json())
            .then(data =>
            {
                const labels = data.map((entry: { time: string }) => formatTime(entry.time))
                const counts = data.map((entry: { count: number }) => entry.count)

                setChartData({
                    labels,
                    datasets: [
                        {
                            label: "Hourly Reports",
                            data: counts,
                            borderColor: "blue",
                            fill: true,
                            tension: 0.4, // Smooth curves
                        },
                    ],
                })
            })
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
                            text: "Time",
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

export default DailyReports