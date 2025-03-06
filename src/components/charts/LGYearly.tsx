'use client'

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { Segmented } from "antd";

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
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        title: { text: "Month" }
    },
    yaxis:
    {
        title: { text: "Report Count" },
        min: 0
    },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#0000ff"],
    legend: {
        show: true,
        position: "top", 
        horizontalAlign: "center",
        labels: { colors: "#000ff" },
        floating: true,
    }
}

const YearlyChart = () =>
{
    const yrOffset = 5
    const currYear = new Date().getFullYear()
    const [selectedYear, setSelectedYear] = useState<number>(currYear)
    const [, setTotalReports] = useState<number>(0)
    const [chartData, setChartData] = useState<number[]>([])

    useEffect(() =>
    {
        const fetchChartData = async () =>
        {
            try
            {
                const response = await fetch(`/api/getChart/YearlyReports?year=${selectedYear}`)
                if (!response.ok)
                    throw new Error("Failed to fetch data")

                const data = await response.json()
                if (!data || Object.keys(data).length === 0)
                    throw new Error("No data available")

                setTotalReports(data.totalReports)
                setChartData(Object.values(data[selectedYear] || {}).map(val => Number(val) || 0))
            } catch (error) {
                console.error(error)
            }
        }

        fetchChartData()
    }, [selectedYear])

    return (
        <div>
            <div className="w-full flex between">
                {/* <p className="block mb-2 text-sm font-medium text-gray-700">
                    Year {selectedYear} Total Reports: {totalReports.toLocaleString()}
                </p> */}
                {/* <label className="block mb-2 text-sm font-normal text-gray-700">Select Year:</label> */}
                <Segmented<string>
                    options={[...Array(yrOffset)].map((_, index) =>
                    {
                        const year = currYear - index
                        return { label: year.toString(), value: year.toString() }
                    })}
                    onChange={(value) => setSelectedYear(parseInt(value))}
                />
            </div>
            <Chart options={chartOptions} series={[{ name: `${selectedYear} Reports`, data: chartData }]} type="line" height='auto' />
        </div>
    )
}

export default YearlyChart
