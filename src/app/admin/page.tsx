import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { GoReport } from "react-icons/go";
import { MdFileDownloadDone } from "react-icons/md";
import LGDaily from '@/components/LGDaily';
import LGWeekly from '@/components/LGWeekly';
import LGMonthly from '@/components/LGMonthly';
import LGYearly from '@/components/LGYearly';
import ReportDoughnutChart from '@/components/ReportDonut';

export const dynamic = 'force-dynamic';

const AdminDashboard = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reportcounter`);
    const data = await res.json();
    return (
      <>
        <div className="bg-gray-100 min-h-screen p-6">
          <header className="bg-blue-600 text-white p-4 rounded mb-6">
            <h1 className="text-2xl font-bold">DASHBOARD</h1>
          </header>

          {/* Report Cards - First Section (Horizontal Stacking with Centered Content) */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {/* Total Reports Card */}
            <div className="bg-blue-50 p-4 rounded shadow-md flex items-center justify-center h-32">
              <DocumentTextIcon className="h-12 w-12 text-blue-600 mr-4" />
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-3xl font-semibold text-blue-600">{data.total || 0}</h2>
                <p className="text-xl text-gray-500">Total Reports</p>
              </div>
            </div>

            {/* Pending Reports Card */}
            <div className="bg-yellow-50 p-4 rounded shadow-md flex items-center justify-center h-32">
              <GoReport className="h-12 w-12 text-yellow-600 mr-4" />
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-3xl font-semibold text-yellow-600">{data.unread || 0}</h2>
                <p className="text-xl text-gray-500">Pending Reports</p>
              </div>
            </div>

            {/* Dropped Reports Card */}
            <div className="bg-red-50 p-4 rounded shadow-md flex items-center justify-center h-32">
              <GoReport className="h-12 w-12 text-red-600 mr-4" />
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-3xl font-semibold text-red-600">{data.dropped || 0}</h2>
                <p className="text-xl text-gray-500">Dropped Reports</p>
              </div>
            </div>

            {/* Solved Reports Card */}
            <div className="bg-blue-100 p-4 rounded shadow-md flex items-center justify-center h-32">
              <MdFileDownloadDone className="h-12 w-12 text-blue-400 mr-4" />
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-3xl font-semibold text-blue-400">{data.solved || 0}</h2>
                <p className="text-xl text-gray-500">Solved Reports</p>
              </div>
            </div>
          </div>

          {/* Charts Section - Below Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-4">Daily Reports</h2>
              <LGDaily />
            </div>
            <div className="bg-white p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-4">Weekly Reports</h2>
              <LGWeekly />
            </div>
            <div className="bg-white p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-4">Monthly Reports</h2>
              <LGMonthly />
            </div>
            <div className="bg-white p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-4">Yearly Reports</h2>
              <LGYearly />
            </div>

            {/* Report Breakdown Chart - Centered */}
            <div className="col-span-2 flex justify-center bg-white p-4 rounded shadow-md">
              <div className="w-full max-w-2xl">
                <h2 className="text-xl font-semibold mb-4 text-center">Report Breakdown</h2>
                <ReportDoughnutChart />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return (
      <>
        <div className="bg-gray-100 min-h-screen p-6">
          <header className="bg-blue-600 text-white p-4 rounded mb-6">
            <h1 className="text-2xl font-bold">DASHBOARD</h1>
          </header>
          <div className="text-center text-red-500">Error fetching data</div>
        </div>
      </>
    );
  }
};

export default AdminDashboard;
