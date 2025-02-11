"use client"

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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

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

const YearlyChart = () =>
{
    const yrOffset = 5
    const currYear = new Date().getFullYear()
    const [selectedYear, setSelectedYear] = useState<number>(currYear)
    const [totalReports, setTotalReports] = useState<number>(0)
    const [chartData, setChartData] = useState<MonthlyData>({ labels: [], datasets: [] })

    useEffect(() =>
    {
        const fetchChartData = async () =>
        {
            try
            {
                const response = await fetch(`/api/getChart/getChartYearlyReports?year=${selectedYear}`)
                if (!response.ok)
                    throw new Error("Failed to fetch data")

                const data = await response.json()
                if (!data || Object.keys(data).length === 0)
                    throw new Error("No data available")

                setTotalReports(data.totalReports)

                setChartData(
                {
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    datasets: [
                        {
                            label: `Reports for ${selectedYear}`,
                            data: Object.values(data[selectedYear] || {}).map(val => Number(val) || 0),
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
    }, [selectedYear])

  return (
    <div>
        <p className="block mb-2 text-sm font-medium text-gray-700">Year {selectedYear} Total Reports: {totalReports.toLocaleString()}</p>
        <label className="block mb-2 text-sm font-medium text-gray-700">Select Year:</label>
        <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="p-2 border rounded-md mb-4"
        >
            {[...Array(yrOffset)].map((_, index) =>
            {
                const year = currYear - index
                return (<option key={year} value={year}>{year}</option>)
            })}
      </select>

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
                                text: "Month",
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
    </div>
  )
}

export default YearlyChart
