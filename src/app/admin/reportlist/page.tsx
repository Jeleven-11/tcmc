'use client'

import { useState, useEffect } from "react";
import axios from "axios";
import Image from 'next/image';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import Navbar from "@/components/adminNav";
import Footer from "@/components/Footer";
import { getSession } from "@/app/lib/actions";

// type Reportss =
// {
//   id: string;
//   fullName: string;
//   reason: string;
//   status: string;
//   reportID: string,
//   createdAt: string
// }

type Report = {
  id: string,
  fullName: string,
  age: number,
  sex: string,
  address: string,
  contactNumber: string,
  isOwner: string,
  driversLicense: string,
  vehicleRegistration: string,
  orCr: string,
  reason: string,
  vehicleType: string,
  platenumber: string,
  color: string,
  description: string,
  reportID: string,
  status: string,
  createdAt: string,
}

const departments = ["Help Desk", "Task Force"]
const statuses = [
  "unread",
  "pending",
  "on investigation",
  "dropped",
  "solved",
]

const statusColors: Record<string, string> =
{
  pending: "text-yellow-500",
  accepted: "text-green-500",
  "on investigation": "text-orange-400",
  dropped: "text-red-500",
  solved: "text-blue-500",
}

export default function AdminReportManagement()
{
  const [reports, setReports] = useState<Report[]>([])
  const [activeTab, setActiveTab] = useState("unread")
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [selectedDepts, setSelectedDepts] = useState<Record<string, string>>({})
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [activeDept, setActiveDept] = useState(departments[0])

  const fetchReports = async () =>
  {
    try
    {
      const response = await axios.get("/api/reports")
      console.log("response.data:", response.data);
      console.log(typeof response.data)//object
      setReports(response.data)

      const statusCounts: Record<string, number> = response.data.reduce((acc: Record<string, number>, report: Report) =>
      {
        acc[report.status] = (acc[report.status] || 0) + 1
        return acc
      }, {})

      setCounts(statusCounts)
    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  const sendNotif = async (reportId: string, status: string, type: string) =>
  {
    const session = await getSession()

    // notification message
    const nStatus = status.charAt(0).toUpperCase() + status.substring(1) // uppercase first letter
    let title, desc;
    if (type !== 'delete')
    {
      title = "🔔" + nStatus + " Status Notification"
      desc = "Report [" + reportId + "] has been marked \"" + nStatus + "\" by " + session.name + " (" + session.username + ")"
    } else {
      title = "🔔 Deleted Report Notification"
      desc = "Report [" + reportId + "] has been deleted with status \"" + nStatus + "\" by " + session.name + " (" + session.username + ")"
    }

    await fetch('/api/sendPush',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: title, desc: desc })
    }).then(response => response.json()).then(msg =>
    {
      console.log(msg)
    })
  }

  const updateStatus = async (id: string, newStatus: string): Promise<void> =>
  {
    try
    {
      const res = await axios.put(`/api/reports/${id}`, { status: newStatus })
      console.log("res update status:", newStatus, res)

      await sendNotif(id, newStatus, '')

      fetchReports()
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const deleteReport = async (id: string, newStatus: string): Promise<void> =>
  {
    try
    {
      const res = await axios.delete(`/api/reports/${id}`)
      console.log("res delete report:", res)

      await sendNotif(id, newStatus, 'delete')

      fetchReports()
    } catch (error) {
      console.error("Error deleting report:", error)
    }
  }

  useEffect(() =>
  {
    fetchReports()
  }, [])

  const loadCarousel = (reportId: string) => setLoadedImages((prev) => ({ ...prev, [reportId]: true }))

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="admin-report-management">
          <h1 className="header">Admin Report Managementss</h1>
          <div className="tabs">
            {statuses.map((status) => (
              <button
                key={status}
                className={`tab-button ${activeTab === status ? "active" : ""}`}
                onClick={() => setActiveTab(status)}
              >
                {status} <span className="badge">{counts[status] || 0}</span>
              </button>
            ))}
          </div>
          {/* Department Tabs */}
          <div className="flex border-b mb-4">
            {departments.map((dept) => (
              <button
                key={dept}
                className={`py-2 px-4 w-1/2 text-center bg-white border-b-2 transition-all ${
                  activeDept === dept ? "border-blue-500 font-bold" : "border-transparent"
                }`}
                onClick={() => setActiveDept(dept)}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="report-list">
            {reports.filter((report) => report.status === activeTab)
              .map((report) => (
                  <div key={report.id} className="relative p-4 border bg-white rounded-lg shadow-md report-item">
                  <strong><h1>Reported ID: {report.reportID}</h1></strong>
                  <h4>Reported by: {report.fullName} | {report.sex}</h4>
                  <p>Reported on: {new Date(report.createdAt).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})} | {new Date(report.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true})}</p>
                  <p>Status: 
                    <span className={`font-bold ${statusColors[report.status] || ''}`}>
                      {` ` + report.status.charAt(0).toUpperCase() + report.status.substring(1)}
                    </span>
                  </p>
                  <div className="absolute top-2 right-2">
                    <select
                      className="bg-gray-100 border px-2 py-1 rounded-md text-lg focus:outline-none"
                      value={selectedDepts[report.id] || departments[0]}
                      onChange={(e) => setSelectedDepts((prev) => ({ ...prev, [report.id]: e.target.value }))}
                    >
                      {departments.map((dept, index) => (
                        <option key={index} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p><br />Vehicle Type: {report.vehicleType}</p>
                  <p>Vehicle Color: {report.color}</p>
                  <p>Address: {report.address}</p>

                  <p><strong>Reason:</strong> {report.reason}</p>
                  <p><strong>Description:</strong> {report.description}</p>
                  <div className="actions">
                    <select
                      value={report.status}
                      onChange={(e) => updateStatus(report.reportID, e.target.value)}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.substring(1)}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => deleteReport(report.reportID, report.status)} className="delete-btn">
                      Delete
                    </button>
                  </div>

                  {report.isOwner === 'Yes' ? (
                    !loadedImages[report.id] ? (
                      <button onClick={() => loadCarousel(report.id)} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg">Load Images</button>
                    ) : (
                      <Swiper 
                        navigation 
                        pagination={{ clickable: true }} 
                        modules={[Navigation, Pagination]} 
                        className="my-4"
                      >
                        {[report.driversLicense, report.vehicleRegistration, report.orCr]
                          .filter(Boolean)
                          .map((image, index) => (
                            <SwiperSlide key={index} className="relative w-full h-64">
                                  {/* <img 
                                    src={image} 
                                    alt={`Document ${index + 1}`} 
                                    className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg" 
                                    layout="responsive"
                                  /> */}
                              <Image src={image} alt={`Document ${index + 1}`} width={500} height={256} className="w-full h-64 object-cover rounded-lg" />
                            </SwiperSlide>
                          ))}
                      </Swiper>
                    )
                  ) : null }
                </div>
              ))}
          </div>
        </div>
        <Footer />
      </div>

      <style jsx>{`
        .page-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .admin-report-management {
          flex: 1;
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          font-family: "Georgia", serif;
          font-size: 2.5rem;
          color: #333;
          text-align: center;
          margin-bottom: 2rem;
        }

        .tabs {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .tab-button {
          padding: 0.5rem 1rem;
          border: none;
          background: lightgray;
          border-radius: 5px;
          cursor: pointer;
        }

        .tab-button.active {
          background: #0070f3;
          color: white;
        }

        .badge {
          background: red;
          color: white;
          border-radius: 50%;
          padding: 0.2rem 0.5rem;
          margin-left: 0.5rem;
        }

        .report-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .report-item {
          border: 1px solid #ccc;
          padding: 1rem;
          border-radius: 5px;
          background: #f9f9f9;
        }

        .actions {
          margin-top: 1rem;
          display: flex;
          gap: 1rem;
        }

        .delete-btn {
          background: red;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
        }

        footer {
          background: #f5f5f5;
          text-align: center;
          padding: 10px;
        }
      `}</style>
    </>
  )
}