'use client'

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface MonthlyChartData
{
    series: { name: string; data: number[] }[];
    options:
    {
        chart: { type: "line"; zoom: { enabled: true }; toolbar: { show: true } };
        xaxis: { categories: string[]; title: { text: string } };
        yaxis:
        {
            title: { text: string };
            labels: { formatter: (value: number) => string };
        };
        stroke: { curve: "smooth", width: 3 }
        colors: string[];
        tooltip: { enabled: true };
    };
}

const MonthlyChart = () =>
{
    const [chartData, setChartData] = useState<MonthlyChartData>(
    {
        series: [],
        options:
        {
            chart:
            {
                type: "line",
                zoom: { enabled: true },
                toolbar: { show: true },
            },
            xaxis:
            {
                categories: [],
                title: { text: "Date" },
            },
            yaxis:
            {
                title: { text: "Report Count" },
                labels: {
                formatter: (value: number) => value.toString(),
                },
            },
            stroke: { curve: "smooth", width: 3 },
            colors: ["#0000ff"],
            tooltip: { enabled: true },
        },
    })
    const [totalReports, setTotalReports] = useState(0)

    useEffect(() =>
    {
        const initDate = new Date()
        const fetchChartData = async () =>
        {
            try
            {
                const response = await fetch("/api/getChart/MonthlyReports")
                if (!response.ok)
                    throw new Error("Failed to fetch data")

                const data = await response.json()
                if (!data || data.length === 0)
                    throw new Error("No data available")

                const counts = data.days.flatMap((entry: { [key: string]: number }) => Object.values(entry))

                const daysInMonth = new Date(initDate.getFullYear(), initDate.getMonth() + 1, 0).getDate()
                const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString())

                setTotalReports(data.totalReports)
                setChartData(
                {
                    series: [{ name: "Day Reports", data: counts }],
                    options: {
                        ...chartData.options,
                        xaxis: { ...chartData.options.xaxis, categories: labels },
                    },
                })
            } catch (error) {
                console.error(error)
            }
        }

        fetchChartData()
    }, [])

    return (
        <>
            <p className="block mb-2 text-sm font-medium text-gray-700"> Monthly Total Reports: {totalReports.toLocaleString() || 0} </p>
            <Chart options={chartData.options} series={chartData.series} type="line" height='auto' />
        </>
    )
}

export default MonthlyChart