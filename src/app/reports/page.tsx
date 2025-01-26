'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Nav from '@/components/Nav';

const Reports = () =>
  {
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);
  const [showAddReportModal, setShowAddReportModal] = useState(false);

  const [newReport, setNewReport] = useState({
    vehicle_type: '',
    plate_number: '',
    vehicle_color: '',
    incurred_violations: '',
    img: '', // This will now be base64 encoded
  });

  const [imageFile, setImageFile] = useState(null); // To store the uploaded image file
  const [reportsData, setReportsData] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(1); // Simulating logged-in user, replace with actual user ID

  // Fetch reports from the database when the component mounts
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/getReports');
        if (response.ok) {
          const data = await response.json();
          setReportsData(data); // Set the fetched reports
        } else {
          alert('Failed to fetch reports');
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        alert('An error occurred while fetching reports');
      }
    };

    fetchReports();
  }, []);

  const openModal = (report) => {
    setSelectedReport(report);
    setModalIsOpen(true);
    document.body.style.overflow = 'hidden'; // Disable background scrolling
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedReport(null);
    setIsImageEnlarged(false); // Reset image size
    document.body.style.overflow = 'auto'; // Enable background scrolling
  };

  const toggleImageSize = () => {
    setIsImageEnlarged((prev) => !prev); // Toggle image enlargement
  };

  const handleAddReportChange = (e) => {
    const { name, value } = e.target;
    setNewReport((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result); // Set the base64 image as the file URL
        setNewReport((prev) => ({
          ...prev,
          img: reader.result.split(',')[1], // Remove data URL prefix
        }));
      };
      reader.readAsDataURL(file); // Convert the file to base64
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/addReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reported_by_user_id: loggedInUserId, // Use the actual logged-in user's ID
          vehicle_type: newReport.vehicle_type,
          vehicle_color: newReport.vehicle_color,
          plate_number: newReport.plate_number,
          incurred_violations: newReport.incurred_violations,
          image_upload: newReport.img, // Send base64 image string here
        }),
      });

      if (response.ok) {
        alert('Report added successfully!');
        setShowAddReportModal(false);
        // Add the new report to the reportsData state
        const newReportData = await response.json();
        setReportsData((prevReports) => [
          ...prevReports,
          { ...newReportData, report_id: prevReports.length + 1 }, // Add new report to the list
        ]);
      } else {
        alert('Failed to add report');
      }
    } catch (error) {
      console.error('Error adding report:', error);
      alert('An error occurred while adding the report');
    }
  };

  const handleDeleteReport = async (reportId) => {
    try {
      const response = await fetch(`/api/deleteReport/${reportId}`, {
        method: 'DELETE',
        body: JSON.stringify({ userId: loggedInUserId }), // Pass logged-in userId
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        alert('Report deleted successfully');
        // Update state after deletion
        setReportsData(prevReports => prevReports.filter(report => report.report_id !== reportId));
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('An error occurred while deleting the report');
    }
  };

  const handleEditReport = async (report) => {
    // Assuming you have a form or modal to update the report
    const updatedReport = {
      vehicle_type: 'New Vehicle Type', // Use form data here
      vehicle_color: 'New Color',
      plate_number: 'New Plate',
      incurred_violations: 'New Violations',
      image_upload: report.img, // Can also update the image
      userId: loggedInUserId, // Pass userId from session
    };

    try {
      const response = await fetch(`/api/editReport/${report.report_id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedReport),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        alert('Report updated successfully');
        // Update state with the new report data
        setReportsData(prevReports =>
          prevReports.map(r => (r.report_id === report.report_id ? { ...r, ...updatedReport } : r))
        );
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('An error occurred while updating the report');
    }
  };

  const [activeTab, setActiveTab] = useState('active');

  return (
    <>
      <Nav />
      <div className="p-8 bg-blue-50 min-h-screen">
        <header className="bg-blue-600 text-white p-4 rounded mb-6">
          <h1 className="text-2xl font-bold">VEHICLE WATCHLIST</h1>
        </header>

        {/* Add Report Button */}
        <button
          onClick={() => setShowAddReportModal(true)}
          className="mt-4 mb-6 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Report
        </button>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b-2">
            <button
              className={`py-2 px-4 text-lg font-medium ${
                activeTab === 'active' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('active')}
            >
              Active Reports
            </button>
            <button
              className={`py-2 px-4 text-lg font-medium ${
                activeTab === 'solved' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('solved')}
            >
              Solved Reports
            </button>
          </div>
        </div>

        {/* Add Report Modal */}
        {showAddReportModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
              <h2 className="text-lg font-semibold mb-4">Add Report</h2>
              <form onSubmit={handleSubmitReport}>
                <label className="block mb-2">
                  Vehicle Type:
                  <input
                    type="text"
                    name="vehicle_type"
                    value={newReport.vehicle_type}
                    onChange={handleAddReportChange}
                    className="border p-2 w-full"
                    required
                  />
                </label>
                <label className="block mb-2">
                  Plate Number:
                  <input
                    type="text"
                    name="plate_number"
                    value={newReport.plate_number}
                    onChange={handleAddReportChange}
                    className="border p-2 w-full"
                    required
                  />
                </label>
                <label className="block mb-2">
                  Color:
                  <input
                    type="text"
                    name="vehicle_color"
                    value={newReport.vehicle_color}
                    onChange={handleAddReportChange}
                    className="border p-2 w-full"
                    required
                  />
                </label>
                <label className="block mb-2">
                  Incurred Violations:
                  <input
                    type="text"
                    name="incurred_violations"
                    value={newReport.incurred_violations}
                    onChange={handleAddReportChange}
                    className="border p-2 w-full"
                    required
                  />
                </label>

                {/* Image Upload */}
                <label className="block mb-2">
                  Image Upload:
                  <div className="flex flex-col">
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="border p-2 w-full"
                    />
                    {imageFile && (
                      <div className="mt-2">
                        <Image
                          src={imageFile}
                          alt="Uploaded Report Image"
                          width={100}
                          height={100}
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </label>

                <div className="flex justify-between mt-4">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddReportModal(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Report List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {reportsData
            .filter((report) => (activeTab === 'active' ? report.status === 'active' : report.status === 'solved'))
            .map((report) => (
              <div key={report.report_id} className="bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-blue-600 mb-2">Report #{report.report_id}</h2>
                <p><strong>Vehicle Type:</strong> {report.vehicle_type}</p>
                <p><strong>Plate Number:</strong> {report.plate_number}</p>
                <p><strong>Color:</strong> {report.vehicle_color}</p>
                <p><strong>Violations:</strong> {report.incurred_violations}</p>

                {/* Image Display */}
                {report.image_upload && (
                  <div className="mt-4">
                    <button
                      onClick={() => openModal(report)}
                      className="text-blue-500"
                    >
                      View Image
                    </button>
                  </div>
                )}

                {/* Delete and Edit Buttons */}
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handleEditReport(report)}
                    className="bg-yellow-500 text-red px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report.report_id)}
                    className="bg-red-600 text-red px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Report Image Modal */}
        {modalIsOpen && selectedReport && selectedReport.image_upload && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-1/3">
              <img
                src={`data:image/jpeg;base64,${selectedReport.image_upload}`}
                alt="Report Image"
                className={isImageEnlarged ? 'w-full h-auto' : 'w-32 h-32 object-cover cursor-pointer'}
                onClick={toggleImageSize}
              />
              <button
                onClick={closeModal}
                className="mt-4 bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Reports;
