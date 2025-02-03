'use client'

// import { useSession } from 'next-auth/react';
import Nav from '@/components/adminNav';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { getSession } from '@/app/lib/actions';
import { useState, useEffect } from 'react';

// type User = {
//   name?: string;
//   email?: string;
//   image?: string;
//   contactNum?: string;
//   role?: string;
//   id: string;
//   username: string;
//   password: string;
//   user_id?: string;
//   emailVerified?: boolean
// };
type SessionData = {
  isLoggedIn: boolean;
  name?: string;
  contact_num?: string;
  role?: string;
  email?: string;
} | null;
export default function Profile() {
  const [sessionData, setSessionData] = useState<SessionData>(null);
  useEffect(() => {
    getSession().then((session) => {
      const currentSession = JSON.parse(JSON.stringify(session));
      if (currentSession.isLoggedIn) {
        setSessionData({
          isLoggedIn: currentSession.isLoggedIn,
          name: currentSession.name,
          contact_num: currentSession.contact_num,
          role: currentSession.role,
          email: currentSession.email,
        });
      } else {
        setSessionData({ isLoggedIn: currentSession.isLoggedIn });
      }
    });
  }, []);
  // const user = session?.user as User; // Direct access to session.user

  if (!sessionData) return <p>Loading...</p>;
  if (!sessionData.isLoggedIn) return <p>Please log in to view your profile.</p>;

  return (
    <>
    <Nav>

    </Nav>
     
      <div className="flex flex-col items-center p-8 bg-blue-50 min-h-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <UserCircleIcon className="w-20 h-20 text-gray-300" />
          </div>
          {sessionData && (
            <>
              <h1 className="text-3xl font-bold text-blue-700 mb-4">{sessionData.name}</h1>
              <div className="space-y-2">
                <p className="text-lg text-gray-700">Contact No: {sessionData.contact_num}</p>
                <p className="text-lg text-gray-700">Role: {sessionData.role}</p>
                <p className="text-lg text-gray-700">Email: {sessionData.email}</p>
              </div>
            </>
          )}
          <div className="mt-4 space-x-4">
            <button onClick={() => alert('Edit Profile')} className="bg-blue-500 text-white px-4 py-2 rounded">
              Edit Profile
            </button>
            <button onClick={() => alert('Delete Account')} className="bg-red-500 text-white px-4 py-2 rounded">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
