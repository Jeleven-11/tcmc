'use client';

import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Report_ } from '@/app/lib/interfaces';
// interface Report_
// {
//   id: number;
//   fullName: string;
//   age: number;
//   sex: 'Male' | 'Female' | 'Other';
//   address: string;
//   contactNumber: string;
//   isOwner: 'Yes' | 'No';
//   vehicleType: 'Motorcycle' | 'Car' | 'Van' | 'Truck' | 'Other';
//   platenumber?: string | null;
//   status: 'unread' | 'on investigation' | 'dropped' | 'solved';
//   createdAt: string;
// }
// interface Report {
//   fullName: string,
//   age: number,
//   sex: string,
//   address: string,
//   contactNumber: string,
//   isOwner: string,
//   driversLicense: string,
//   vehicleRegistration: string,
//   orCr: string,
//   reason: string,
//   vehicleType: string,
//   platenumber: string,
//   color: string,
//   description: string,
//   reportID: string,
//   status: string,
//   createdAt: string,
// }

export default function DataTable()
{
  const [reports, setReports] = useState<Report_[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 5 });
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const res = await fetch(`/api/getReportsLazy?page=${paginationModel.page + 1}&pageSize=${paginationModel.pageSize}`);
        const { data, total } = await res.json();
        setReports(data);
        setTotalRows(total);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [paginationModel]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'fullName', headerName: 'Full Name', width: 200 },
    { field: 'age', headerName: 'Age', type: 'number', width: 80 },
    { field: 'sex', headerName: 'Sex', width: 100 },
    { field: 'address', headerName: 'Address', width: 250 },
    { field: 'contactNumber', headerName: 'Contact Number', width: 150 },
    { field: 'isOwner', headerName: 'Owner?', width: 100 },
    { field: 'vehicleType', headerName: 'Vehicle Type', width: 120 },
    { field: 'platenumber', headerName: 'Plate Number', width: 120 },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'createdAt', headerName: 'Created At', width: 180 },
  ];

  return (
    <Paper sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={reports}
        columns={columns}
        loading={loading}
        paginationMode="server" // Enables server-side pagination
        rowCount={totalRows} // Total number of records
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel} // Triggers new data fetch
        pageSizeOptions={[5, 10, 20, 50, 80, 100]}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  );
}