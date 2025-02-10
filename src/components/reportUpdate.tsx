'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Report
{
  reportID: string;
  fullName: string;
  contactNumber: string;
  createdAt: string;
  vehicleType: string;
  platenumber?: string;
  color: string;
  description: string;
  reason: string;
  status: string;
  driversLicense: string;
}




const CheckUpdates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Report[]>([]); // Results from search

 // const [allReports, setAllReports] = useState<Report[]>([]); // All reports from database (to browse)
 // const [statusCounts, setStatusCounts] = useState<{ [key: string]: number }>({
  //  pending: 0,
 //   accepted: 0,
  //  dropped: 0,
 //   solved: 0,
 // });
  const [filteredReports, setFilteredReports] = useState<Report[]>([]); // Reports filtered by status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined | null>(null);
  //const [activeTab, setActiveTab] = useState('all');
  
    const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
    const [imageVisibility, setImageVisibility] = useState<Record<string, boolean>>({});
  
    const handleImageLoad = (reportID: string) => {
      setLoadingImages((prevState) => ({
        ...prevState,
        [reportID]: true,
      }));
    };
  
    const toggleImage = (reportID: string) => {
      setImageVisibility((prevState) => ({
        ...prevState,
        [reportID]: !prevState[reportID],
      }));
    };
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;

  // Fetch all reports and status counts on initial load
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/getReports');
        const data = await response.json();

        if (response.ok) {
          const modifiedReports:Report[] = data.reports.map((report: Report) => {
            const formattedTimestamp = report.createdAt.replace('T', ' ').replace('.000Z', '');
            console.log("Replaced datetime:", formattedTimestamp);
            return { ...report, createdAt: formattedTimestamp };
          })
         // setAllReports(modifiedReports);
          // setAllReports(data.reports);
          setFilteredReports(modifiedReports); // Initially, display all reports

          // Calculate status counts
          const counts = data.reports.reduce(
            (acc: { [x: string]: number; }, report: { status: string; }) => {
              acc[report.status.toLowerCase()] = (acc[report.status.toLowerCase()] || 0) + 1;
              return acc;
            },
            { pending: 0, accepted: 0, dropped: 0, solved: 0 }
          );
          //setStatusCounts(counts);
        } else {
          setError('Error fetching reports.');
        }
      } catch (err) {
        console.log(err)
        setError('An error occurred while fetching the reports.');
      }
      setLoading(false);
    };

    fetchReports();
  }, []);

  // Search handler
  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/searchReport?query=${searchQuery}`);
      const data = await response.json();

      if (response.ok) {
        const modifiedReports:Report[] = data.reports.map((report: Report) => {
          const formattedTimestamp = report.createdAt.replace('T', ' ').replace('.000Z', '');
          console.log("Replaced datetime:", formattedTimestamp);
          return { ...report, createdAt: formattedTimestamp };
        })
        setSearchResults(modifiedReports);
        // setSearchResults(data.reports);
      } else {
        setSearchResults([]);
        setError('No reports found matching your search.');
      }
    } catch (err) {
      console.log(err)

      setError('An error occurred while searching.');
    }

    setLoading(false);
  };

  // Handle tab click to filter reports by status
 {/* const handleTabClick = (status: React.SetStateAction<string>) =>
  {
    setLoading(true);
    setActiveTab(status);
    setSearchResults([]);

    if (status === 'all') {
      setFilteredReports(allReports);
    } else {
      const filtered = allReports.filter((report) => report.status.toLowerCase() === status);
      setFilteredReports(filtered);
    }
    setCurrentPage(1); // Reset to the first page when switching tabs
    setLoading(false);
  };

  // Color mapping for badges
  const statusColorMapping: { [key: string]: string } = {
    pending: 'bg-yellow-400',
    accepted: 'bg-green-400',
    dropped: 'bg-red-400',
    solved: 'bg-blue-400',
  }; */}

  // Pagination Logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);

  const handlePageChange = (page: React.SetStateAction<number>) =>
  {
    if (typeof page === 'number' && (page < 1 || page > Math.ceil(filteredReports.length / reportsPerPage)))
      return

    setCurrentPage(page)
  };

  return (
    <div className="container mx-auto p-6 mt-6">
      {/* First Segment: Search Area */}
      <div className="bg-blue-100 border border-blue-500 text-blue-700 px-4 py-3 rounded mb-4 flex items-start">
        <span className="mr-2 text-xl">ℹ️</span>
        <p>Want to check updates on your submitted report? Just input the provided report ID or your full name in the search bar below.</p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
          placeholder="Enter Report ID or Full Name"
        />
        <button
          onClick={handleSearch}
          disabled={!searchQuery.trim()}
          className={`${
            searchQuery.trim() ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-300'
          } text-white font-bold py-2 px-4 rounded ml-2`}
        >
          Search
        </button>
        <button
          onClick={() => {
            setSearchQuery('');
            setSearchResults([]);
            setError(null);
          }}
          className="bg-red-400 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
        >
           Clear
        </button>
      </div>

      {/* Error or Loading */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Second Segment: Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4 mb-4">
          <h2 className="text-xl font-bold">Search Results ({searchResults.length} found):</h2>
          {searchResults.map((report) => (
            <div key={report.reportID} className="bg-white p-4 rounded shadow-md">
              {/* <h3 className="text-lg font-bold">Report ID: {report.reportID}</h3> */}
              {/* <p><strong>Reported By:</strong> {report.fullName}</p> */}
              {/* <p><strong>Contact Number:</strong> {report.contactNumber}</p> */}
              <p><strong>Submitted On:</strong> {new Date(report.createdAt).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})} {new Date(report.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true})}</p>
              <p><strong>Vehicle Type:</strong> {report.vehicleType}</p>
              {/* <p><strong>Plate Number:</strong> {report.platenumber || 'N/A'}</p> */}
              <p><strong>Color:</strong> {report.color}</p>
              {/* <p><strong>Description:</strong> {report.description}</p> */}
              <p><strong>Reason:</strong> {report.reason}</p>
            </div>
          ))}
        </div>
      )}

      {/* No Results Found */}
      {searchResults.length === 0 && !loading && !error && <p>No reports found</p>}

      {/* Third Segment: Reports from Other People (Browse) */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Reports Feed</h2>
        <h2 className="text-1xl font-semibold mb-4">These are reports that are on investigation which you might be able to help</h2>

        {/* Tabs with Badges */}
        {/*<div className="flex space-x-4 mb-6">
          {['all', 'pending', 'accepted', 'dropped', 'solved'].map((status) => (
            <button
              key={status}
              onClick={() => handleTabClick(status)}
              aria-label={`Filter reports by ${status}`}
              className={`${
                activeTab === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              } py-2 px-4 rounded flex items-center`}
            >
              <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              {status !== 'all' && (
                <span
                  className={`ml-2 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center ${statusColorMapping[status]}`}
                >
                  {statusCounts[status]}
                </span>
              )}
            </button>
          ))}
        </div> */}

        {/* Display All Reports (if no search query or after filtering by status) */}
        {currentReports.length > 0 && (
        <div className="space-y-4">
          {currentReports.map((report) => (
            <div key={report.reportID} className="bg-white p-4 rounded shadow-md">
              <p><strong>Submitted On:</strong> {new Date(report.createdAt).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})} {new Date(report.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true})}</p>
              <p><strong>Vehicle Type:</strong> {report.vehicleType}</p>
              <p><strong>Color:</strong> {report.color}</p>
              <p><strong>Reason:</strong> {report.reason}</p>
              <p><strong>Test:</strong> {report.driversLicense}</p>

              {/* Lazy Loaded Image with Toggle Functionality */}
              {report.driversLicense && (
                <div className="mt-4">
                  <button
                    onClick={() => toggleImage(report.reportID)}
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                  >
                    {imageVisibility[report.reportID] ? 'Hide Image' : 'Load Image'}
                  </button>

                  {imageVisibility[report.reportID] && !loadingImages[report.reportID] && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleImageLoad(report.reportID)}
                        className="bg-blue-500 text-white py-2 px-4 rounded"
                      >
                        Load Image
                      </button>
                    </div>
                  )}

                  {imageVisibility[report.reportID] && loadingImages[report.reportID] && (
                    <Image
                      src={report.driversLicense}
                      alt="Report Image"
                      width={300}
                      height={200}
                      className="rounded-lg mt-2"
                      priority={false}
                      onError={(e) => console.error('Error loading image:', e)}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div> 
      )}


        {/* No Reports Found */}
        {!loading && !error && searchQuery && searchResults.length === 0 && (
          <p>No reports match your search.</p>
        )}
        {!loading && !error && !searchQuery && filteredReports.length === 0 && (
          <p>No reports available in the system.</p>
        )}


        {/* Pagination Controls */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage * reportsPerPage >= filteredReports.length}
            className="bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckUpdates;
