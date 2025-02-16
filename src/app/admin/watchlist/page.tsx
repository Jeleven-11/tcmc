'use client'

import DataTableReports from "@/components/DataTableReports"

export default function AdminReportManagement()
{
  return (
    <>
      <div className="container lg my-auto mx-auto px-4 py-8 bg-gray-50 mt-50">
        <div className="admin-report-management">
          <DataTableReports />
        </div>
      </div>
    </>
  )
}