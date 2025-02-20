'use client';

import React, { useState, useEffect, useCallback, SetStateAction } from 'react';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Image from 'next/image';

import debounce from 'lodash.debounce';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination as Pagination1 } from 'swiper/modules';
import { Button, MenuItem, Select, TextField } from '@mui/material';
import CustomPagination from './CustomPagination';
import { getSession } from '@/app/lib/actions';
import axios from 'axios';

interface Report {
  driversLicense: string;
  vehicleRegistration: string;
  orCr: string;
  reason: string;
  description: string;
  color: string;
  id: number;
  fullName: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  address: string;
  contactNumber: string;
  isOwner: 'Yes' | 'No';
  vehicleType: 'Motorcycle' | 'Car' | 'Van' | 'Truck' | 'Other';
  platenumber?: string | null;
  status: 'unread' | 'on_investigation' | 'dropped' | 'solved';
  reportID: string;
  createdAt: string;
}

const statusColors: Record<string, string> =
{
  unread: "#facc15", // Yellow-500
  on_investigation: "#fb923c", // Orange-400
  dropped: "#ef4444", // Red-500
  solved: "#3b82f6", // Blue-500
}

export default function DataTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [totalRows, setTotalRows] = useState(0);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [initReports, setInitReports] = useState<string[]>([])

  const fetchReports = async (isLoad: SetStateAction<boolean>) =>
  {
    try
    {
        const session = await getSession()
        setLoading(isLoad)

        const res = await fetch(`/api/getReports/getReportsLazy?page=${paginationModel.page + 1}&pageSize=${paginationModel.pageSize}&search=${encodeURIComponent(searchQuery)}${Number(session.team) === 1 ? '&t=' + session.team : ''}`)
        const { data, total } = await res.json()
        if (res.ok)
        {
          setReports(data)
          setTotalRows(total)
        }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
        setLoading(!isLoad)
    }
  }

  const sendNotif = async (reportId: string[], status: string, type: string) =>
  {
    const session = await getSession()

    // notification message
    const nStatus = status.charAt(0).toUpperCase() + status.substring(1) // uppercase first letter
    let title, desc;
    if (type === 'bulk')
    {
        title = "🔔 Bulk Delete Report Status Notification"
        desc = "Reports [" + reportId.join(", ") + "] has been deleted by " + session.name + " (" + session.username + ")"
    } else if (type !== 'delete')
    {
      title = "🔔" + nStatus + " Status Notification"
      desc = "Report [" + reportId.join(", ") + "] has been marked \"" + nStatus + "\" by " + session.name + " (" + session.username + ")"
    } else {
      title = "🔔 Deleted Report Notification"
      desc = "Report [" + reportId.join(", ") + "] has been deleted with status \"" + nStatus + "\" by " + session.name + " (" + session.username + ")"
    }

    await fetch('/api/notifications/sendNotification',
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
      if (res.status === 200)
        await sendNotif([id], newStatus, '')

      fetchReports(true)
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handleDeleteReports = async () =>
  {
    if (selectedRows.length === 0)
      return

    const confirmDelete = window.confirm(`Are you sure you want to delete ${initReports.length} selected reports?`)
    if (!confirmDelete)
      return

    try
    {
      // setLoading(true)
      await axios.post('/api/reports/bulkDelete', { ids: initReports })
      await sendNotif(initReports, '', 'bulk')

      //remove deleted reports deleted from state instead of refetching everything
      // setReports((prevReports) => prevReports.filter(report => !selectedRows.includes(report.id)))

      fetchReports(true)
      setSelectedRows([])
    } catch (error) {
      console.error('Error deleting reports:', error)
    }
  }

  const deleteSingleReport = async (id: string, newStatus: string): Promise<void> =>
  {
    const confirmDelete = window.confirm(`Are you sure you want to delete [${id}] report?`)
    if (!confirmDelete)
      return

    try
    {
      const res = await axios.delete(`/api/reports/${id}`)
      console.log("res delete report:", res)

      await sendNotif([id], newStatus, 'delete')

      fetchReports(true)
    } catch (error) {
      console.error("Error deleting report:", error)
    }
  }

  // Debounce search to prevent excessive API calls
  const debouncedSearch = useCallback(debounce((query: string) => setSearchQuery(query), 500), [])

  useEffect(() => { fetchReports(true) }, [paginationModel, searchQuery])

  const handleOpenModal = (report: Report) =>
  {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const handleCloseModal = () =>
  {
    setIsModalOpen(false)
    setSelectedReport(null)
  }

  const handleRowSelection = (selectedIds: number[]) =>
  {
    const selectedReportIDs = reports
    .filter((report) => selectedIds.includes(report.id))
    .map((report) => report.reportID)

    // console.log("Selected Report IDs:", selectedReportIDs)
    setInitReports(selectedReportIDs)

    setSelectedRows(selectedIds)
  }

  const loadCarousel = (reportId: string) => setLoadedImages((prev) => ({ ...prev, [reportId]: true }))

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: "status",
      headerName: "Status",
      flex: 2, // ✅ Auto-width based on content
      minWidth: 180,
      maxWidth: 200,
      renderCell: (params) => {
        const { value } = params;
        const textColor = statusColors[value] || "#374151";

        return (
          <Select
            value={value}
            onChange={(event) => updateStatus(params.row.reportID, event.target.value)}
            variant="outlined"
            size="small"
            sx={{
              height: "32px",
              minWidth: "100px",
              fontSize: "14px",
              padding: "0",
              color: textColor,
              fontWeight: "bold",
            }}
          >
            {Object.keys(statusColors).map((option) => (
              <MenuItem
                key={option}
                value={option}
                sx={{
                  color: statusColors[option],
                  fontWeight: "bold",
                }}
              >
                {option.charAt(0).toUpperCase() + option.substring(1)}
              </MenuItem>
            ))}
          </Select>
        );
      }
    },
    // { field: 'contactNumber', headerName: 'Contact Number', width: 150 },
    { field: 'isOwner', headerName: 'Owner?', width: 100 },
    { field: 'vehicleType', headerName: 'Vehicle Type', width: 150 },
    { field: 'platenumber', headerName: 'Plate Number', width: 120 },
    { 
      field: 'fullName', 
      headerName: 'Full Name', 
      width: 200,
      renderCell: (params) => (
        <span 
          style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }} 
          onClick={() => handleOpenModal(params.row)}
        >
          {params.value}
        </span>
      )
    },
    { field: 'age', headerName: 'Age', type: 'number', width: 80 },
    { field: 'sex', headerName: 'Sex', width: 100 },
    // { field: 'status', headerName: 'Status', width: 130 },
    { field: 'createdAt', 
      headerName: 'Created At',
      width: 200,
      renderCell: (params) => (
        <span>{new Date(params.row.createdAt).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})}, {new Date(params.row.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true})}</span>
      )
    },
    {
      field: 'actions',
      headerName: 'Action',
      flex: 2, // ✅ Auto-width based on content
      minWidth: 100,
      maxWidth: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => deleteSingleReport(params.row.reportID, params.row.status)}
        >
          Delete
        </Button>
      ),
    }
  ];

  return (
    <Paper sx={{ height: 'auto', width: '100%', padding: 2 }}>
      <h1 className="text-lg pt-3 pb-3">Admin Report Management</h1>
      <TextField
        label="Search Reports..."
        variant="outlined"
        fullWidth
        onChange={(e) => debouncedSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="error"
        disabled={selectedRows.length === 0}
        onClick={handleDeleteReports}
        sx={{ mb: 2 }}
      >
        Delete Selected
      </Button>
      <DataGrid
        rows={reports}
        columns={columns}
        loading={loading}
        paginationMode="server"
        rowCount={totalRows}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        initialState={{
          pagination: {
            paginationModel: { pageSize: paginationModel.pageSize, page: 0 },
          },
          columns: {
            columnVisibilityModel: {
              status: true,
              name: true,
            },
          },
        }}
        pageSizeOptions={[10, 20, 50, 100]}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{ border: 0 }}
        slots={{
          pagination: () => (
            <CustomPagination
              page={paginationModel.page}
              onPageChange={(newPage) => setPaginationModel((prev) => ({ ...prev, page: newPage }))}
              pageSize={paginationModel.pageSize}
              onPageSizeChange={(newSize) => setPaginationModel((prev) => ({ ...prev, pageSize: newSize }))}
              rowCount={totalRows}
            />
          ),
        }}
        // onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection as number[])}
        onRowSelectionModelChange={(ids) => handleRowSelection(ids as number[])}
        rowSelectionModel={selectedRows}
      />

      {/* Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80vw", // 80% of viewport width
          maxHeight: "90vh", // 90% of viewport height
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          overflowY: "auto", // Enables scrolling
        }}
      >
          {selectedReport && (
            <>
              {/* Renamed from complainant to Informant/Reporting Party */}
              {/* Complainant Details */}
              <h2 className="text-2xl font-bold mb-3">Informant / Reporting Party Details</h2>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold">Status:</label>
                <button style={{backgroundColor: (statusColors[selectedReport.status] || "gray"), fontWeight: "bold"}} className="text-white px-2 py-2 rounded-full w-auto text-sm text-center">
                  {selectedReport.status.charAt(0).toUpperCase()  + selectedReport.status.substring(1)}
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold">Full Name:</label>
                {selectedReport.fullName}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-gray-700 text-sm font-bold">Age:</label>
                  {selectedReport.age}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold">Sex:</label>
                  {selectedReport.sex}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold">Address:</label>
                {selectedReport.address}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold">Contact Number:</label>
                {selectedReport.contactNumber}
              </div>
      
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold">Submitted Files:</label>
                {selectedReport.isOwner === 'Yes' ? (
                  !loadedImages[selectedReport.id] ? (
                    <button onClick={() => loadCarousel(selectedReport.id.toString())} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg">Load Images</button>
                  ) : (
                    <Swiper 
                      navigation 
                      pagination={{ clickable: true }} 
                      modules={[Navigation, Pagination1]} 
                      className="my-4"
                    >
                      {[selectedReport.driversLicense, selectedReport.vehicleRegistration, selectedReport.orCr]
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
                ) : 'None' }
              </div>

              {/* Vehicle Details */}
              <h2 className="text-2xl font-bold mb-4">Vehicle Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold">Vehicle Type:</label>
                  {selectedReport.vehicleType}
                </div>
      
                <div>
                  <label className="block text-gray-700 text-sm font-bold">Reason:</label>
                  {selectedReport.reason}
                </div>
      
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold">Plate Number:</label>
                  {selectedReport.platenumber}
                </div>
              </div>
      
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold">Color:</label>
                  {selectedReport.color}
                </div>
      
                <div>
                  <label className="block text-gray-700 text-sm font-bold">Additional Description of Vehicle:</label>
                  {selectedReport.description}
                </div>
              </div>
            </>
          )}
        </Box>
      </Modal>
    </Paper>
  );
}
