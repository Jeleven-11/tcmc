'use client'

import { useState, useEffect } from "react";
import axios from "axios";

import Navbar from "@/components/adminNav";
import Footer from "@/components/Footer";
import DateTimeComponent from '@/components/DateTimeComponent';
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
  "pending",
  "accepted",
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
  const [activeTab, setActiveTab] = useState("pending")
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [selectedDept, setSelectedDept] = useState(departments[0])

  const fetchReports = async () =>
  {
    try
    {
      const response = await axios.get("/api/reports")
      console.log("response.data:", response.data);
      console.log(typeof response.data)//object
      setReports(response.data)

       // Sort reports by `createdAt` (newest to oldest)
    const sortedReports = response.data.sort((a: Report, b: Report) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setReports(sortedReports);

    // Count status occurrences
    const statusCounts: Record<string, number> = sortedReports.reduce((acc: Record<string, number>, report: Report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {});

      setCounts(statusCounts)
    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  const updateStatus = async (id: string, newStatus: string): Promise<void> =>
  {
    try
    {
      const res = await axios.put(`/api/reports/${id}`, { status: newStatus })
      console.log("res update status:", res);
      fetchReports()
      // if (res.status === 200){
      //   // fetchReports()
      // }
      // fetchReports()
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const deleteReport = async (id: string): Promise<void> =>
  {
    try
    {
      const res = await axios.delete(`/api/reports/${id}`)
      console.log("res delete report:", res);
      fetchReports()
      // if (res.status === 200){
      //   // fetchReports()
      // }
    } catch (error) {
      console.error("Error deleting report:", error)
    }
  }

  useEffect(() => { fetchReports() }, [])

  return (
    <>
      <DateTimeComponent />
      <Navbar />
      <div className="page-container">
        <div className="admin-report-management">
          <h1 className="header">Admin Report Management</h1>
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

          <div className="report-list relative z-10">
            {reports.filter((report) => report.status === activeTab)
              .map((report) => (
                  <div key={report.id} className="relative p-4 border bg-white rounded-lg shadow-md report-item">
                  <strong><h1>Reported ID: {report.reportID}</h1></strong>
                  <h4>Reported by: {report.fullName}</h4>
                  <p>Reported on: {new Date(report.createdAt).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})} | {new Date(report.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true})}</p>
                  <p>Status: 
                    <span className={`font-bold ${statusColors[report.status] || ''}`}>
                      {` ` + report.status.charAt(0).toUpperCase() + report.status.substring(1)}
                    </span>
                  </p>
                  <div className="absolute top-2 right-2">
                    <select
                      className="bg-gray-100 border px-2 py-1 rounded-md text-lg focus:outline-none"
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                    >
                      {departments.map((dept, index) => (
                        <option key={index} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p><br />Vehicle Type: {report.vehicleType}</p>
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
                    <button onClick={() => deleteReport(report.id)} className="delete-btn">
                      Delete
                    </button>
                  </div>
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