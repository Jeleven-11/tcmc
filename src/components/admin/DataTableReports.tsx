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
import { Button, MenuItem, Select, TextField, Tooltip } from '@mui/material';
import CustomPagination from './CustomPagination';
import { getSession } from '@/app/lib/actions';
import axios from 'axios';


import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit';


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
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> =
{
  unread: "#facc15", // Yellow-500
  on_investigation: "#fb923c", // Orange-400
  dropped: "#ef4444", // Red-500
  solved: "#3b82f6", // Blue-500
}

function dateConv(date: string) : string
{
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ", " + new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })  
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
  const [remarkModal, setRemarkModal] = useState(false)
  const [remark, setRemark] = useState('')

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
      setSelectedReport(null)
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

  const handleOpenEditModal = (report: Report) =>
  {
    setSelectedReport(report)
    setRemarkModal(true)
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

  const handleRemarkSubmit = async () =>
  {
    try
    {
      const reportID = selectedReport?.reportID || 0
      const response = await fetch("/api/reports/updateReport",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ remark, reportID }),
      })

      if (!response.ok)
        throw new Error("Failed to submit remark")

      const res = await response.json()
      setRemark(res.remark)
      fetchReports(true)
    } catch (error) {
      console.error(error)
    }

    setRemarkModal(false)
  }

  const loadCarousel = (reportId: string) => setLoadedImages((prev) => ({ ...prev, [reportId]: true }))

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', width: 70 },
    {
      field: "status",
      headerName: "Status",
      flex: 2, // ✅ Auto-width based on content
      minWidth: 190,
      maxWidth: 250,
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
    { field: 'isOwner', headerName: 'Owner?', width: 70 },
    { field: 'vehicleType', headerName: 'Vehicle Type', flex: 2 },
    { field: 'platenumber', headerName: 'Plate Number', width: 150 },
    { 
      field: 'fullName', 
      headerName: 'Full Name', 
      flex: 2, // auto-width based on content
      width: 200,
      renderCell: (params) => (
        <Tooltip title={params.row.reportID} arrow>
          <span 
            style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }} 
            onClick={() => handleOpenModal(params.row)}
          >
            {params.value}
          </span>
        </Tooltip>
      )
    },
    { field: 'age', headerName: 'Age', flex: 1, width: 50 },
    // { field: 'sex', headerName: 'Sex', width: 50 },
    { field: 'sex', 
      flex: 1, // auto-width based on content
      headerName: 'Sex',
      width: 200,
      renderCell: (params) => (
        <span className="text-sm">{params.row.sex.replace('Male', 'M').replace('Female', 'F')}</span>
      )
    },
    // { field: 'status', headerName: 'Status', width: 130 },
    { field: 'createdAt',
      flex: 2, // auto-width based on content
      headerName: 'Created At',
      width: 175,
      renderCell: (params) => {
        // const formattedDate = new Date(params.row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ", " + new Date(params.row.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        const formattedDate = dateConv(params.row.createdAt)
        return (
          <Tooltip title={formattedDate} arrow>
            <span className="text-sm">{formattedDate}</span>
          </Tooltip>
        );
      }
    },
    { field: 'updatedAt',
      flex: 2, // auto-width based on content
      headerName: 'Updated At',
      width: 180,
      renderCell: (params) => {
        const formattedDate = dateConv(params.row.updatedAt)
        // const formattedDate = new Date(params.row.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ", " + new Date(params.row.updatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        return (
          <Tooltip title={formattedDate} arrow>
            <span className="text-sm">{formattedDate}</span>
          </Tooltip>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Action',
      flex: 2, // auto-width based on content
      minWidth: 100,
      maxWidth: 100,
      renderCell: (params) => (
        <>
          {/* <Button
            className="mr-2"
            variant="contained"
            color="info"
            onClick={() => handleOpenModal(params.row)}
          > */}
          <Tooltip title="Edit Report" arrow>
            <EditIcon
              className="mr-2 cursor-pointer"
              color="info"
              // onClick={() => setRemarkModal(true)}
              onClick={() => handleOpenEditModal(params.row)}
            />
          </Tooltip>
          {/* </Button> */}
          {/* <Button
            color="error"
            size="small"
            onClick={() => deleteSingleReport(params.row.reportID, params.row.status)}
          > */}
           <Tooltip title="Delete Report" arrow>
            <DeleteIcon
              className="cursor-pointer"
              color="error"
              onClick={() => deleteSingleReport(params.row.reportID, params.row.status)}
            />
          </Tooltip>
          {/* </Button> */}
        </>
      ),
    }
  ];

  const exportToCSV = () => {
    if (reports.length === 0) {
      // message.warning("No data to export.");
      return;
    }

    const headers = ["Status", "Report ID", "isOwner", "Vehicle Type", "Plate #", "Full Name", "Age", "Sex", "Report Created", "Report UpdatedAt"];

    const csvRows = reports.map((row) => [
      row.status,
      row.reportID,
      row.isOwner,
      row.vehicleType,
      row.platenumber,
      row.fullName,
      row.age,
      row.sex,
      dateConv(row.createdAt),
      dateConv(row.updatedAt),
    ]);

    // Convert to CSV format
    const csvString = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${cell || 0}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `transactions_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Paper sx={{ height: 'auto', width: '100%', padding: 3, marginBottom: 2 }}>
        <header className="bg-blue-600 text-white p-4 mb-3 rounded-lg shadow-md">
          <h1 className="text-xl font-semibold">Reports List</h1>
        </header>
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
        <Button
         variant="contained"
         color="success"
         onClick={exportToCSV}
         sx={{ mb: 2, ml: 2 }}
        >
          Export CSV
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
                <span className="text-sm font-bold mt-6"><p className="mb-6">Report ID: {selectedReport.reportID}</p></span>
                {/* <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold">Status:</label>
                  <button style={{backgroundColor: (statusColors[selectedReport.status] || "gray"), fontWeight: "bold"}} className="text-white px-2 py-2 rounded-full w-auto text-sm text-center">
                    {selectedReport.status.charAt(0).toUpperCase()  + selectedReport.status.substring(1)}
                  </button>
                </div> */}
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold">Status:</label>
                  <button style={{backgroundColor: (statusColors[selectedReport.status] || "gray"), fontWeight: "bold"}} className="text-white px-2 py-2 rounded-full w-auto text-sm text-center">
                    {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.substring(1)}
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

        {/* Edit Profile Modal */}
        {remarkModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Editing Report [{selectedReport?.reportID}]</h2>
              <h4 className="text-sm font-bold mb-4">Report by: {selectedReport?.fullName}</h4>
              <textarea
                className="border p-2 w-full rounded-md mb-2"
                defaultValue={selectedReport?.remarks}
                placeholder="Add remarks to the report, or leave notes"
                required
                onChange={(e) => setRemark(e.target.value)}
              />
              <div className="mt-4 flex justify-end space-x-2">
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setRemarkModal(false)}>Cancel</button>
                <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={handleRemarkSubmit}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
    </Paper>
  );
}
