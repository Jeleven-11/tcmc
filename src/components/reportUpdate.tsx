'use client';

import React, { useState, useEffect } from 'react';
import { Input, Pagination } from 'antd';
import ReportCard from './fetchedReportCard';
import { Report } from '@/app/lib/interfaces';

const { Search } = Input;

const CheckUpdates = () => {
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchedReports, setSearchedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const reportsPerPage = 5;

  // Fetch only "on_investigation" reports initially
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports/getReports');
        const data = await response.json();

        if (response.ok) {
          const onInvestigationReports: Report[] = data.reports
            .filter((report: Report) => report.status === 'on_investigation')
            .map((report: Report) => ({
              ...report,
              createdAt: report.createdAt.replace('T', ' ').replace('.000Z', ''),
            }));

          setFilteredReports(onInvestigationReports);
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

  // Handle search (fetches matching reports, does not override active ones)
  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchedReports([]); // Clear search results when input is empty
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/searchReport?query=${value}`);
      const data = await response.json();

      if (response.ok) {
        const matchingReports: Report[] = data.reports.map((report: Report) => ({
          ...report,
          createdAt: report.createdAt.replace('T', ' ').replace('.000Z', ''),
        }));

        setSearchedReports(matchingReports);
      } else {
        setSearchedReports([]);
        setError('No reports found.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while searching.');
    }
    setLoading(false);
  };

  // Clear search field and restore "on_investigation" reports
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchedReports([]);
  };

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);

  return (
    <div className="container mx-auto p-4 mt-3">
      <header className="bg-blue-600 text-white p-4 rounded mb-3">
        <h1 className="text-2xl font-bold">Report Updates</h1>
      </header>

      {/* Search Bar */}
      <div className="mb-4 flex gap-2">
        <Search
          placeholder="Enter Report ID or Full Name"
          onSearch={handleSearch}
          enterButton
          className="w-full md:w-1/2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="bg-red-500 text-white px-3 py-[5px] rounded-md hover:bg-red-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error or Loading */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Active Reports */}
      <h2 className="text-xl font-bold mb-3">Active Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentReports.length > 0 ? (
          currentReports.map((report) => (
            <ReportCard key={report.reportID} report={report} />
          ))
        ) : (
          <p>No active reports available.</p>
        )}
      </div>

      {/* Search Results (If Any) */}
      {searchQuery && (
        <>
          <h2 className="text-xl font-bold mt-6 mb-3">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchedReports.length > 0 ? (
              searchedReports.map((report) => (
                <ReportCard key={report.reportID} report={report} />
              ))
            ) : (
              <p>No matching reports found.</p>
            )}
          </div>
        </>
      )}

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
