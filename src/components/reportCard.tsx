'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Report {
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
  imageUrl?: string; // Image URL for the report (optional)
}

const CheckUpdates = () => {
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});

  // Handle image loading when clicked
  const handleImageLoad = (reportID: string) => {
    setLoadingImages((prev) => ({ ...prev, [reportID]: true }));
  };

  return (
    <div className="container mx-auto p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">Browse Reports:</h2>

      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div key={report.reportID} className="bg-white p-4 rounded shadow-md">
              <p><strong>Report ID:</strong> {report.reportID}</p>
              <p><strong>Reported By:</strong> {report.fullName}</p>
              <p><strong>Vehicle Type:</strong> {report.vehicleType}</p>
              <p><strong>Color:</strong> {report.color}</p>
              <p><strong>Reason:</strong> {report.reason}</p>

              {/* Lazy Loaded Image */}
              {report.imageUrl && (
                <div className="mt-4">
                  {!loadingImages[report.reportID] ? (
                    <button
                      onClick={() => handleImageLoad(report.reportID)}
                      className="bg-blue-500 text-white py-2 px-4 rounded"
                    >
                      Load Image
                    </button>
                  ) : (
                    <Image
                      src={report.imageUrl}
                      alt="Report Image"
                      width={300}
                      height={200}
                      className="rounded-lg mt-2"
                      priority={false} // Ensures Next.js doesn't preload it
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No reports found</p>
      )}
    </div>
  );
};

export default CheckUpdates;
