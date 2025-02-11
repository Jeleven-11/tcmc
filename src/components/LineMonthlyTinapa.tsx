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

interface MonthlyData
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

const MonthlyChart = () =>
{
    const initDate = new Date()
    const [chartData, setChartData] = useState<MonthlyData>({ labels: [], datasets: [] })
    const [totalReports, setTotalReports] = useState(0)

    useEffect(() =>
    {
        const fetchChartData = async () =>
        {
            try
            {
                const response = await fetch("/api/getChart/getChartMonthlyReports")
                if (!response.ok)
                    throw new Error("Failed to fetch data")

                const data = await response.json()
                if (!data || data.length === 0)
                    throw new Error("No data available")

                // const labels = data.map((entry: { time: string }) => formatWeek(entry.time))
                const counts = data.days.flatMap((entry: { [key: string]: number }) => Object.values(entry))

                const daysInMonth: number = new Date(initDate.getFullYear(), initDate.getMonth() + 1, 0).getDate() // year, month, day . getdate()
                const labelsz = [...Array(daysInMonth).keys()].map(i => (i + 1).toString());

                setTotalReports(data.totalReports)

                setChartData(
                {
                    labels: labelsz,
                    datasets: [
                        {
                            label: "Day Reports",
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
        <>
            <p className="block mb-2 text-sm font-medium text-gray-700">Monthly Total Reports: {totalReports.toLocaleString() || 0}</p>
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
                                    text: "Date",
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
        </>
    )
}

export default MonthlyChart