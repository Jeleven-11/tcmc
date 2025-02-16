'use client'

import Navbar from "@/components/adminNav";
import Footer from "@/components/Footer";
import DateTimeComponent from '@/components/DateTimeComponent';
import DataTableReports from "@/components/DataTableReports";

export default function AdminReportManagement()
{
  return (
    <>
      <DateTimeComponent />
      <Navbar />
      <div className="container lg my-auto mx-auto px-4 py-8 bg-gray-50 mt-50">
        <div className="admin-report-management">
          <DataTableReports />
        </div>
      </div>
      <Footer />
    </>
  )
}