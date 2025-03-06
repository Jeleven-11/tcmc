"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DateTime } from "luxon";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface ChartData
{
    series: { name: string; data: number[] }[];
    options: ApexOptions;
}

const formatTime = (isoString: string): string =>
{
    return DateTime.fromISO(isoString).toFormat("hh:mm a")
}

const DailyReports = () =>
{
    const [chartData, setChartData] = useState<ChartData>(
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
                title: { text: "Time" },
            },
            yaxis:
            [{
                title: { text: "Report Count", floating: true },
                labels: {
                formatter: (value: number) => Math.round(value),
                },
            }],
            stroke: { curve: "smooth", width: 3,},
            colors: ["#0000ff"],
            tooltip: { enabled: true },
            grid: { padding: { left: 10 } },
        } as ApexOptions,
    })

    useEffect(() =>
    {
        const fetchChartData = async () =>
        {
            try
            {
                const response = await fetch("/api/getChart/DailyReports")
                const data: { time: string; count: number }[] = await response.json()

                const labels = data.map((entry) => formatTime(entry.time))
                const counts = data.map((entry) => entry.count)

                setChartData((prev) => ({
                    series: [{ name: "Hourly Reports", data: counts }],
                    options: {
                        ...prev.options,
                        xaxis: { ...prev.options.xaxis, categories: labels },
                    },
                }))
            } catch (error) {
                console.error(error)
            }
        }

        fetchChartData()
    }, [])

    return <Chart options={chartData.options} series={chartData.series} type="line" height='auto' />
}

export default DailyReports