"use client";
import Nav from './Nav';
// import { useSession } from 'next-auth/react';
import { TruckIcon, CalendarIcon } from '@heroicons/react/24/outline'; // Importing correct icons from Heroicons
import { useState, useEffect } from 'react';
import Footer from './Footer';
import Homebody from './Homebody';
import { GoReport } from "react-icons/go";
import { MdFileDownloadDone } from "react-icons/md";

const HomeClient = () => {
  // const { status } = useSession();
  const [currentDate, setCurrentDate] = useState('');
  const [reportCount, setReportCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [droppedCount, setDroppedCount] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
 

  // Get current date on component mount
  useEffect(() =>
  {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString(undefined, options));

    const fetchReportCounts = async () => {
      try {
        const res = await fetch('/api/reportcounter');
        const data = await res.json();
        if (data.total) {
          setReportCount(data.total);  // Total report count
        }
        if (data.pending) {
          setPendingCount(data.pending);  // Active report count
        }
        if (data.accepted) {
          setAcceptedCount(data.accepted);  // Active report count
        }
        if (data.dropped) {
          setDroppedCount(data.dropped);  // Active report count
        }
        if (data.solved) {
          setSolvedCount(data.solved);  // Solved report count
        }
      } catch (error) {
        console.error('Error fetching report counts:', error);
      }
    };

    fetchReportCounts();
  }, []);

  // if (status === 'loading') {
  //   return <p className='text-center'>Loading...</p>; // Optionally, show a loading state
  // }

  return (
    <>
      <Nav />
      <Homebody />
      
      <div className="bg-gray-100 min-h-screen p-6">
        <header className="bg-blue-600 text-white p-4 rounded mb-6">
          <h1 className="text-2xl font-bold">DASHBOARD</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <GoReport className="h-8 w-8 text-black mr-4" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Total Reports</h2>
              <p className="text-gray-700">{reportCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <GoReport className="h-8 w-8 text-yellow-600 mr-4" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Pending Reports</h2>
              <p className="text-gray-700">{pendingCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <GoReport className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Accepted Reports</h2>
              <p className="text-gray-700">{acceptedCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <GoReport className="h-8 w-8 text-red-600 mr-4" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Dropped Reports</h2>
              <p className="text-gray-700">{droppedCount}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <MdFileDownloadDone className="h-8 w-8 text-blue-400 mr-4" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Solved Reports</h2>
              <p className="text-gray-700">{solvedCount}</p>
            </div>
          </div>


          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <TruckIcon className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Passing Vehicles</h2>
              <p className="text-gray-700">Count: 54</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <TruckIcon className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Total Vehicles Last Week</h2>
              <p className="text-gray-700">Count: 5,432</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <CalendarIcon className="h-8 w-8 text-purple-600 mr-4" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Date</h2>
              <p className="text-gray-700">{currentDate}</p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Footer />
      </div>
      
    </>
    
  );
};

export default HomeClient;
