'use client';

import React, { useState, useEffect } from 'react';
import { Input, Button, Pagination } from 'antd';
import ReportCard from './fetchedReportCard';
import { Report } from '@/app/lib/interfaces';

const { Search } = Input;

const CheckUpdates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;

  // Fetch reports on mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports/getReports');
        const data = await response.json();

        if (response.ok) {
          const modifiedReports: Report[] = data.reports.map((report: Report) => ({
            ...report,
            createdAt: report.createdAt.replace('T', ' ').replace('.000Z', ''),
          }));
          setFilteredReports(modifiedReports);
        } else {
          setError('Error fetching reports.');
        }
      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching reports.');
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  // Handle search
  const handleSearch = async (value: string) => {
    if (!value.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/searchReport?query=${value}`);
      const data = await response.json();

      if (response.ok) {
        const modifiedReports: Report[] = data.reports.map((report: Report) => ({
          ...report,
          createdAt: report.createdAt.replace('T', ' ').replace('.000Z', ''),
        }));
        setFilteredReports(modifiedReports);
      } else {
        setFilteredReports([]);
        setError('No reports found.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while searching.');
    }
    setLoading(false);
  };

  // Pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);

  return (
    <div className="container mx-auto p-4 mt-3">
      <header className="bg-blue-600 text-white p-4 rounded mb-3">
        <h1 className="text-2xl font-bold">Report Updates</h1>
      </header>

      {/* Search Bar */}
      <div className="mb-4">
        <Search
          placeholder="Enter Report ID or Full Name"
          onSearch={handleSearch}
          enterButton
          className="w-full md:w-1/2"
        />
      </div>

      {/* Error or Loading */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Reports Feed using ReportCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentReports.length > 0 ? (
          currentReports.map((report) => <ReportCard key={report.reportID} report={report} />)
        ) : (
          <p>No reports available.</p>
        )}
      </div>

      {/* Pagination */}
      {filteredReports.length > reportsPerPage && (
        <div className="mt-6 flex justify-center">
          <Pagination
            current={currentPage}
            total={filteredReports.length}
            pageSize={reportsPerPage}
            onChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default CheckUpdates;
