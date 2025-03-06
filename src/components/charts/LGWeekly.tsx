'use client'

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

const chartOptions: ApexOptions =
{
    chart:
    {
        type: "line",
        zoom: { enabled: true },
        toolbar: { show: true },
    },
    xaxis:
    {
        categories: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        title: { text: "Week Day" }
    },
    yaxis:
    {
        title: { text: "Report Count" },
        min: 0
    },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#0000ff"],
}

const WeeklyChart = () =>
{
    const [chartData, setChartData] = useState<number[]>([])

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

                const counts = data.flatMap((entry: { [key: string]: number }) => Object.values(entry))

                setChartData(counts)
            } catch (error) {
                console.error(error)
            }
        }

        fetchChartData()
    }, [])

    return <Chart options={chartOptions} series={[{ name: "Weekly Reports", data: chartData }]} type="line" height='auto' />
}

export default WeeklyChart