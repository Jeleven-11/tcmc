'use client';

import React, { useState, useEffect, useCallback, SetStateAction } from 'react';
import type { FormEvent } from 'react';
import { DataGrid, GridColDef, GridPaginationModel} from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
// import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
// import Image from 'next/image';
// import { DateTime } from 'luxon';

import debounce from 'lodash.debounce';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Navigation, Pagination as Pagination1 } from 'swiper/modules';
import { Button, MenuItem, Select, TextField, Tooltip } from '@mui/material';
import CustomPagination from './CustomPagination';
import { getSession } from '@/app/lib/actions';
import axios from 'axios';
import { toast } from "react-toastify";
import { Flex, Card, Image} from 'antd';
const { Meta } = Card;

import DeleteIcon from '@mui/icons-material/Delete'
// import EditIcon from '@mui/icons-material/Edit';
import UpdateIcon from '@mui/icons-material/Update';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Report {
  driversLicense: string;
  vehicleRegistration: string;
  orCr: string;
  reportedVehicleImage: string,
  reason: string;
  description: string;
  color: string;
  id: number;
  fullName: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  address: string;
  barangay: string;
  city: string;
  province: string;
  region: string;
  contactNumber: string;
  isOwner: 'Yes' | 'No';
  vehicleType: 'Motorcycle' | 'Car' | 'Van' | 'Truck' | 'Other';
  platenumber?: string | null;
  status: 'unread' | 'on_investigation' | 'dropped' | 'solved';
  reportID: string;
  team: number;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}
type ReportActionType = 'solved' | 'dropped' | 'save';
const statusColors: Record<string, string> =
{ // FROM MUI MATERIAL UI DEFAULT THEME:
  unread: "#01579B", //info Deep Cerulean
  on_investigation: "#E65100",  // warning Burnt Orange
  dropped: "#C62828",  // error Dark Red
  solved: "#1565C0", //primary Deep Azure
}

// const statusTeam: Record<number, string> =
// {
//   0: "#374151",
//   1: "#3b82f6", // Yellow-500
// }

function dateConv(date: string) : string
{
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + ", " + new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })  
}
const formatStatus = (status: string) => {
  if (status === "on_investigation") {
      return status
          .split("_") // Split into words
          .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
          .join(" "); // Join back with space
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusColor = (status: string) => {
  const colors: Record<string, "warning" | "info" | "success" | "error"> = {
      on_investigation: "warning",
      unread: "info",
      solved: "success",
      dropped: "error",
  };
  return colors[status] || "default"; // Provide a fallback color if needed
};
export default function DataTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [totalRows, setTotalRows] = useState(0);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [initReports, setInitReports] = useState<string[]>([])
  // const [remarkModal, setRemarkModal] = useState(false)
  const [isUpdatingReport, setIsUpdatingReport] = useState<boolean>(false);
  const [details, setDetails] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [userTeam, setUserTeam] = useState<number>(0);
  // const [remark, setRemark] = useState('')
  // const [selectedValue, setSelectedValue] = useState<number | undefined>(undefined)

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  // const handleChange = (event: SelectChangeEvent<number>, params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
  //   const newValue = Number(event.target.value)
  //   setSelectedValue(newValue); // Update the local state
  //   updateTeam(params.row.reportID, newValue); // Call the API function
  // }

  const fetchReports = async (isLoad: SetStateAction<boolean>) =>
  {
    try
    {
        const session = await getSession()
        setUserTeam(session.team as unknown as number)
        setLoading(isLoad)

        const res = await fetch(`/api/getReports/getReportsLazy?page=${paginationModel.page + 1}&pageSize=${paginationModel.pageSize}&search=${encodeURIComponent(searchQuery)}${Number(session.team) === 1 ? '&t=' + session.team : ''}`)
        const { data, total } = await res.json()
        if (res.ok)
        {
          setReports(data)
          setTotalRows(total)
        } else {
          setReports([])
          setTotalRows(0)
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

    let nStatus, title, desc;
    if (status === "0" || status === "1")
      nStatus = status
    else
      nStatus = status.charAt(0).toUpperCase() + status.substring(1) // uppercase first letter

    // notification message
    // const nStatus = (status !== "0" && status !== "1") ? status.charAt(0).toUpperCase() + status.substring(1) : status // uppercase first letter
    if (type === 'bulk')
    {
      title = "🔔 Bulk Delete Report Status Notification"
      desc = "Reports [" + reportId.join(", ") + "] has been deleted by " + session.name + " (" + session.username + ")"
    } else if (type === "team")
    {
      title = "🔔 Report Team Update Status Notification"
      desc = "Report [" + reportId.join(", ") + "] has been assigned to \"" + (Number(nStatus) === 1 ? "Task Force" : "Help Desk") + "\" by " + session.name + " (" + session.username + ")"
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

  // const updateTeam = async (id: string, newTeam: number): Promise<void> =>
  // {
  //   try
  //   {
  //     // console.log(id, newTeam)
  //     const res = await axios.post(`/api/reports/${id}`, { reportID: id, status: newTeam })
  //     if (res.status === 200)
  //       await sendNotif([id], String(newTeam), 'team')

  //     fetchReports(true)
  //   } catch (error) {
  //     console.error("Error updating status:", error)
  //   }
  // }

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
    setIsUpdatingReport(true)
  }

  // const handleCloseModal = () =>
  // {
  //   setIsModalOpen(false)
  //   setSelectedReport(null)
  // }

  const handleRowSelection = (selectedIds: number[]) =>
  {
    const selectedReportIDs = reports
    .filter((report) => selectedIds.includes(report.id))
    .map((report) => report.reportID)

    // console.log("Selected Report IDs:", selectedReportIDs)
    setInitReports(selectedReportIDs)

    setSelectedRows(selectedIds)
  }

  const handleUpdateReport = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      // Get the clicked button's value with proper type assertion
      const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
      const action = submitter?.value as ReportActionType | undefined;
  
      // Validate we have a valid action
      if (!action || !['solved', 'dropped', 'save'].includes(action)) {
        console.error('Invalid action type');
        return;
      }
      try {
        if(selectedReport && selectedReport.id){
          const response = await fetch(`/api/addReportUpdate/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({'title':title, 'details':details, 'action':action, 'reportId':selectedReport.id}),
          });
    
          if (response.ok) {
            alert('Added a Report Update Successfully');
            if(action!=='save')
            await sendNotif([Number(selectedReport.id).toString()], action, '')
          } else {
            const data = await response.json();
            alert(data.message);
          }
        } else {
          throw new Error("Selected report has no id");
        }
      } catch (error) {
        console.error('Error updating report:', error);
        alert('An error occurred while updating the report');
      }
      setIsUpdatingReport(false)
    }

  // const loadCarousel = (reportId: string) => setLoadedImages((prev) => ({ ...prev, [reportId]: true }))

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', width:75 },
    { field: 'status', headerName: 'Status', flex: 1,
      renderCell: (params) => {
        const { value } = params;
        return (
        
          (value!=='unread')?(<span 
            style={{ color: statusColors[value] }} 
            onClick={() => handleOpenModal(params.row)}
          >
            {formatStatus(value)}
          </span>):(
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
              color: statusColors[value],
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
                {formatStatus(option)}
              </MenuItem>
            ))}
          </Select>
          )
      )}
     },
    // {
    //   field: "status",
    //   headerName: "Status",
    //   flex: 2, // ✅ Auto-width based on content
    //   minWidth: 190,
    //   maxWidth: 250,
    //   renderCell: (params) => {
    //     const { value } = params;
    //     const textColor = statusColors[value] || "#374151";

    //     return (
    //       value
    //       // <Select
    //       //   value={value}
    //       //   // onChange={(event) => updateStatus(params.row.reportID, event.target.value)}
    //       //   variant="outlined"
    //       //   size="small"
    //       //   sx={{
    //       //     height: "32px",
    //       //     minWidth: "100px",
    //       //     fontSize: "14px",
    //       //     padding: "0",
    //       //     color: textColor,
    //       //     fontWeight: "bold",
    //       //   }}
    //       // >
    //       //   {Object.keys(statusColors).map((option) => (
    //       //     <MenuItem
    //       //       key={option}
    //       //       value={option}
    //       //       sx={{
    //       //         color: statusColors[option],
    //       //         fontWeight: "bold",
    //       //       }}
    //       //     >
    //       //       {option.charAt(0).toUpperCase() + option.substring(1)}
    //       //     </MenuItem>
    //       //   ))}
    //       // </Select>
    //     );
    //   }
    // },
    // {
    //   field: "users_team",
    //   headerName: "Assginee",
    //   flex: 2, // ✅ Auto-width based on content
    //   minWidth: 190,
    //   maxWidth: 250,
    //   renderCell: (params) =>
    //   {
    //     const handleTeamChange = (event: SelectChangeEvent<number>) => handleChange(event, params)

    //     return (
    //       <Select
    //         value={selectedValue} // Bind state
    //         onChange={handleTeamChange}
    //         variant="outlined"
    //         size="small"
    //         sx={{
    //           height: "32px",
    //           minWidth: "100px",
    //           fontSize: "14px",
    //           padding: "0",
    //           color: statusTeam[Number(selectedValue)] || "#374151",
    //           fontWeight: "bold",
    //         }}
    //       >
    //         {Object.keys(statusTeam).map((option) => (
    //           <MenuItem
    //             key={option}
    //             value={Number(option)}
    //             sx={{
    //               color: statusTeam[Number(option)],
    //               fontWeight: "bold",
    //             }}
    //           >
    //             {Number(option) === 1 ? "Task Force" : "Help Desk"}
    //           </MenuItem>
    //         ))}
    //       </Select>
    //     );
    //   }
    // },
    { field: 'contactNumber', headerName: 'Contact Number', flex:1 },
    { field: 'isOwner', headerName: 'Owner', width:70 },
    { field: 'vehicleType', headerName: 'Vehicle Type', flex: 1 },
    { field: 'platenumber', headerName: 'Plate Number', flex: 1 },
    { 
      field: 'fullName', 
      headerName: 'Full Name', 
      flex: 1, // auto-width based on content
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
    { field: 'age', headerName: 'Age', width: 50 },
    // { field: 'sex', headerName: 'Sex', width: 50 },
    { field: 'sex', 
      width: 50, // auto-width based on content
      headerName: 'Sex',
      renderCell: (params) => (
        <span className="text-sm">{params.row.sex.replace('Male', 'M').replace('Female', 'F')}</span>
      )
    },
    
    { field: 'createdAt',
      flex: 1, // auto-width based on content
      headerName: 'Date Created',
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
      flex: 1, // auto-width based on content
      headerName: 'Last Update',
      renderCell: (params) => {
        const formattedDate = params.row.updatedAt!==null?dateConv(params.row.updatedAt):''
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
      flex: 1, // auto-width based on content
      renderCell: (params) => {
        const rowStatus = params.row.status;
        return (
        <>
          <Tooltip title="View Report" arrow>
            <VisibilityIcon
              className="mr-2 cursor-pointer"
              color="action"
              // onClick={() => setRemarkModal(true)}
              onClick={() => handleOpenModal(params.row)}
            />
          </Tooltip>
          {(rowStatus!=='solved'&&rowStatus!=='unread')&&(
          <Tooltip title="Update Report" arrow>
            <UpdateIcon
              className="mr-2 cursor-pointer"
              color="info"
              // onClick={() => setRemarkModal(true)}
              onClick={() => handleOpenEditModal(params.row)}
            />
          </Tooltip>)}
          <Tooltip title="Delete Report" arrow>
            <DeleteIcon
              className="cursor-pointer"
              color="error"
              onClick={() => deleteSingleReport(params.row.reportID, params.row.status)}
            />
          </Tooltip>
        </>
      )},
    }
  ];

  const exportToCSV = () => {
    if (reports.length === 0) {
      toast.error("Cannot export empty data!");
      return;
    }

    const headers = ["Status", "Assignee", "Report ID", "isOwner", "Vehicle Type", "Plate #", "Full Name", "Age", "Sex", "Report Created", "Report UpdatedAt", "Notes/Remarks"];

    const csvRows = reports.map((row) => [
      row.status.charAt(0).toUpperCase() + row.status.substring(1),
      row.team === 1 ? "Task Force" : "Help Desk",
      row.reportID,
      row.isOwner,
      row.vehicleType,
      row.platenumber,
      row.fullName,
      row.age,
      row.sex,
      dateConv(row.createdAt),
      row.updatedAt!==null?dateConv(row.updatedAt):'',
      row.remarks
    ]);

    // Convert to CSV format
    const csvString = [headers, ...csvRows].map((row) => row.map((cell) => `"${cell || 0}"`).join(",")).join("\n");

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
          <h1 className="text-xl font-semibold">Reports List | {(userTeam===0)?'Help Desk': 'Task Force'}</h1>
        </header>
        <TextField
          label="Search Reports..."
          variant="outlined"
          fullWidth
          onChange={(e) => debouncedSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            variant="contained"
            color="error"
            disabled={selectedRows.length === 0}
            onClick={handleDeleteReports}
          >
            Delete Selected
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={exportToCSV}
            sx={{ ml: 'auto' }} // Moves the button to the right
          >
            Export CSV
          </Button>
        </Box>

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

        {isModalOpen&&(<Card autoFocus={true}>
            {selectedReport && (
              <>
                {/* Renamed from complainant to Informant/Reporting Party */}
                {/* Complainant Details */}
                <div className="flex justify-between items-center w-full">
                  <h2 className="text-2xl font-bold">Informant / Reporting Party Details</h2>
                  <p className="text-sm font-bold">Report ID: {selectedReport.reportID}</p>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold">Status:</label>
                  <Chip
                    label={formatStatus(selectedReport.status)}
                    color={getStatusColor(selectedReport.status)}
                    variant="filled"
                  />
                  
                </div>
                <Flex gap='large' justify="space-between">
                <Flex vertical justify="space-around" style={{flex:1}}>
                  <div>
                  <label className="block text-gray-700 text-sm font-bold">Full Name:</label>
                  {selectedReport.fullName}
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold">Age:</label>
                    {selectedReport.age}
                    </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold">Sex:</label>
                    {selectedReport.sex}
                    </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold">Address:</label>
                  {selectedReport.address}  
                </div>              
                <div>
                  <label className="block text-gray-700 text-sm font-bold">Contact Number:</label>
                  {selectedReport.contactNumber}
                  </div>
                </Flex>
                <Flex vertical justify='space-evenly' gap='large' style={{flex:1}}>
                <label className="block text-gray-700 text-sm font-bold">Submitted Files:</label>
                  <Flex>
                  <Card cover={
                      <Image
                        width={250}
                        alt="Reported Vehicle"
                        src={selectedReport.reportedVehicleImage}
                        placeholder={
                          <Image
                            preview={false}
                            alt='Reported Vehicle'
                            src={selectedReport.reportedVehicleImage}
                            width={250}
                          />
                        }
                      />}>
                        <Meta title="Reported Vehicle"/>
                    </Card>
                    </Flex>
                    {selectedReport.isOwner === 'Yes'&&(
                    <Flex justify='space-between' gap='large' style={{flex:2}}>
                    <Card cover={
                      <Image
                        width={250}
                        alt="Driver's license"
                        src={selectedReport.driversLicense}
                        placeholder={
                          <Image
                            preview={false}
                            alt="Driver's License"
                            src={selectedReport.driversLicense}
                            width={250}
                          />
                        }
                      />}>
                      <Meta title="Driver's License" />
                  </Card>
                      <Card cover={
                      <Image
                        width={250}
                        alt="Vehicle Registration"
                        src={selectedReport.vehicleRegistration}
                        placeholder={
                          <Image
                            preview={false}
                            alt='Vehicle Registration'
                            src={selectedReport.vehicleRegistration}
                            width={250}
                          />
                        }
                      />}>
                      <Meta title="Vehicle Registration" />
                  </Card>
                      <Card cover={
                      <Image
                        width={250}
                        alt="OR/CR"
                        src={selectedReport.orCr}
                        placeholder={
                          <Image
                            preview={false}
                            alt='OR/CR'
                            src={selectedReport.orCr}
                            width={250}
                          />
                        }
                      />}>
                      <Meta title="OR/CR" />
                  </Card>
                  </Flex>
                  
                    )}
                    
                      
                  </Flex>
                </Flex>
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
          {/* </Box> */}
        </Card>)}

        {/* Add Report Update Modal */}
        { isUpdatingReport && ( // a boolean will be set to true when Add update is clicked
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-1/2">
            <h2 className="text-lg font-semibold">Report Update</h2>
                <form onSubmit={handleUpdateReport}>
                  <label className="block mb-2">
                    Title:
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border p-2 w-full"
                      required
                    />
                  </label>

                  <label className="block mb-2">
                    Update details:
                    <textarea
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="border p-2 w-full h-32"
                      required
                    />
                  </label>
                  
                  
                  <div className="flex justify-center mt-4">
                    <button type="submit" name="action" value="solved" className="bg-blue-500 text-white px-4 py-2 rounded">
                      Save and mark as solved
                    </button>
                    <button type="submit" name="action" value="dropped" className="bg-blue-500 text-white px-4 py-2 rounded">
                      Save and mark as dropped
                    </button>
                    <button type="submit" name="action" value="save" className="bg-blue-500 text-white px-4 py-2 rounded">
                      Just save
                    </button>
                    <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setIsUpdatingReport(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
            </div>
          </div>
        )}
    </Paper>
  );
}
