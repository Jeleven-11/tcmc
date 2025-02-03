import { DocumentTextIcon, TruckIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { GoReport } from "react-icons/go";
import { MdFileDownloadDone } from "react-icons/md";
import Navbar from '@/components/adminNav';
import Footer from '@/components/Footer';
import RequestNotificationPermission from '@/components/RequestNotificationPermission';
import LineTinapa from '@/components/LineTinapa';
import LineWeeklyTinapa from '@/components/LineWeeklyTinapa';

// Make this a Server Component by fetching data directly in the component
const AdminDashboard = async () =>
{
  try
  {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reportcounter`);
    const data = await res.json();

    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const currentDate = date.toLocaleDateString(undefined, options);
    
    return (
      <>
        <Navbar />
        <div className="bg-gray-100 min-h-screen p-6">
          <header className="bg-blue-600 text-white p-4 rounded mb-6">
            <h1 className="text-2xl font-bold">DASHBOARD</h1>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded shadow-md flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Total Reports</h2>
                <p className="text-gray-700">{data.total || 0}</p>
                  <Navbar />
                  <div className="bg-gray-100 min-h-screen p-6">
                    <header className="bg-blue-600 text-white p-4 rounded mb-6">
                      <h1 className="text-2xl font-bold">DASHBOARD</h1>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white p-4 rounded shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Daily Reports</h2>
                        <LineTinapa />
                      </div>
                      <div className="bg-white p-4 rounded shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Weekly Reports</h2>
                        <LineWeeklyTinapa />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white p-4 rounded shadow-md flex items-center">
                        <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-4" />
                        <div>
                          <h2 className="text-xl font-semibold mb-2">Total Reports</h2>
                          <p className="text-gray-700">{data.total || 0}</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded shadow-md flex items-center">
                        <GoReport className="h-8 w-8 text-yellow-600 mr-4" />
                        <div>
                          <h2 className="text-xl font-semibold mb-2">Pending Reports</h2>
                          <p className="text-gray-700">{data.pending || 0}</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded shadow-md flex items-center">
                        <GoReport className="h-8 w-8 text-green-600 mr-4" />
                        <div>
                          <h2 className="text-xl font-semibold mb-2">Accepted Reports</h2>
                          <p className="text-gray-700">{data.accepted || 0}</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded shadow-md flex items-center">
                        <GoReport className="h-8 w-8 text-red-600 mr-4" />
                        <div>
                          <h2 className="text-xl font-semibold mb-2">Dropped Reports</h2>
                          <p className="text-gray-700">{data.dropped || 0}</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded shadow-md flex items-center">
                        <MdFileDownloadDone className="h-8 w-8 text-blue-400 mr-4" />
                        <div>
                          <h2 className="text-xl font-semibold mb-2">Solved Reports</h2>
                          <p className="text-gray-700">{data.solved || 0}</p>
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
                  <Footer />
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
        <Navbar />
        <div className="bg-gray-100 min-h-screen p-6">
          <header className="bg-blue-600 text-white p-4 rounded mb-6">
            <h1 className="text-2xl font-bold">DASHBOARD</h1>
          </header>
          <div className="text-center text-red-500">Error fetching data</div>
        </div>
        <Footer />
      </>
    );
  }
};

export default AdminDashboard;
