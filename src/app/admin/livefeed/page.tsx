'use client';

// import RealtimeDisplay from '@/components/RealtimeAbly';
import AblyConnectionComponent from '@/components/admin/RealtimeAbly';
import { useState } from 'react';
// export const dynamic = 'force-dynamic';
export default function Livefeed () {
  const [searchTerm, setSearchTerm] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const [captures, ] = useState([
    { no: 1, vehicleType: 'Car', color: 'Red', plateNumber: 'ABC123', capturedImages: 'Image1.jpg, Image2.jpg', timestamp: '2024-09-11 10:00:00' },
    { no: 2, vehicleType: 'Truck', color: 'Blue', plateNumber: 'XYZ456', capturedImages: 'Image3.jpg, Image4.jpg', timestamp: '2024-09-11 10:15:00' },
  ]);

  const filteredCaptures = captures.filter(
    (capture) =>
      capture.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capture.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capture.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCapture = currentPage * itemsPerPage;
  const indexOfFirstCapture = indexOfLastCapture - itemsPerPage;
  const currentCaptures = filteredCaptures.slice(indexOfFirstCapture, indexOfLastCapture);

  const totalPages = Math.ceil(filteredCaptures.length / itemsPerPage);

  return (
    <>
      {/* <RealtimeDisplay /> */}
      <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-8">
          {/* Live Feed Section */}
          <div className="mb-8">
             <header className="bg-blue-600 text-white p-4 rounded mb-6">
          <h1 className="text-2xl font-bold">LIVEFEED</h1>
        </header>

            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
              <AblyConnectionComponent />
            </div>
            <div className="flex justify-center space-x-4">
              <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600">CAM1</button>
              <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600">CAM2</button>
            </div>
          </div>

          {/* Real-Time Data Section */}
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-blue-700 mb-4">Real-Time Data</h2>
            {/* Search Bar */}
            <div className="mb-3 flex flex-wrap items-end space-y-2 lg:space-y-0 lg:justify-end">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border ml-3 border-gray-300 rounded p-2 w-50% lg:w-1/2"
              />
              <button
                onClick={() => console.log('Search initiated for:', searchTerm)}//Change to actual search implementation
                className="ml-4 lg:ml-2 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 w-90 lg:w-1/4"
              >
                Search
              </button>
            </div>

            {/* Data Table */}
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="border px-2 lg:px-4 py-2">No.</th>
                    <th className="border px-2 lg:px-4 py-2">Vehicle Type</th>
                    <th className="border px-2 lg:px-4 py-2">Color</th>
                    <th className="border px-2 lg:px-4 py-2">Plate Number</th>
                    <th className="border px-2 lg:px-4 py-2">Captured Images</th>
                    <th className="border px-2 lg:px-4 py-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCaptures.map((capture) => (
                    <tr key={capture.no} className="border-b">
                      <td className="border px-2 lg:px-4 py-2">{capture.no}</td>
                      <td className="border px-2 lg:px-4 py-2">{capture.vehicleType}</td>
                      <td className="border px-2 lg:px-4 py-2">{capture.color}</td>
                      <td className="border px-2 lg:px-4 py-2">{capture.plateNumber}</td>
                      <td className="border px-2 lg:px-4 py-2">{capture.capturedImages}</td>
                      <td className="border px-2 lg:px-4 py-2">{capture.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>

            {/* Download Recordings Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => console.log('Download recordings initiated')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
              >
                Download Recordings
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


