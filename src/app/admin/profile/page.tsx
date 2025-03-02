'use client'

import { UserCircleIcon } from '@heroicons/react/24/outline';
import { getSession, logout } from '@/app/lib/actions';
import { useState, useEffect } from 'react';
import { Paper } from '@mui/material';
import { useRouter } from 'next/navigation';

type SessionData =
{
  isLoggedIn: boolean;
  user_id?: number;
  name?: string;
  contact_num?: string;
  team?: number;
  email?: string;
} | null;

type EditData = {
  isLoggedIn: boolean;
  name: string;
  contact_num: string;
  current_password:string;
  new_password:string;
  team: number;
  email: string;
};

export default function Profile()
{
  const router = useRouter()
  const [sessionData, setSessionData] = useState<SessionData>(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [isDel, setIsDel] = useState(false)
  const [editData, setEditData] = useState<EditData>({
    isLoggedIn: false,
    name: '',
    contact_num: '',
    current_password:'',
    new_password:'',
    team: 0,
    email: ''
  })

  useEffect(() =>
  {
    getSession().then((session) =>
    {
      const currentSession = JSON.parse(JSON.stringify(session))
      if (currentSession.isLoggedIn)
      {
        setSessionData({
          isLoggedIn: currentSession.isLoggedIn,
          user_id: currentSession.user_id,
          name: currentSession.name,
          contact_num: currentSession.contact_num,
          team: currentSession.team,
          email: currentSession.email,
        })
      } else setSessionData({ isLoggedIn: currentSession.isLoggedIn })

      console.log(editData)
    })
  }, [editData])

  if (!sessionData)
    return

  if (!sessionData.isLoggedIn)
    return <p>Please log in to view your profile.</p>;

  // Function to handle password submission
  const handlePasswordSubmit = async () =>
  {
    const res = await fetch('/api/masterLogin',
    {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok)
    {
      alert('Incorrect password')
      return
    }

    setIsPasswordModalOpen(false)
    if (!isDel)
    {
      setEditData({
        isLoggedIn: sessionData.isLoggedIn,
        name: sessionData.name || '',
        contact_num: sessionData.contact_num || '',
        current_password: '',
        new_password: '',
        team: sessionData.team || 0,
        email: sessionData.email || '',
      })
      setIsEditModalOpen(true)
    } else handleDeleteAcc() // ELSE del acc
    setPassword('')
  }

  const handleDeleteAcc = async () =>
  {
    if (confirm('Are you sure you want to delete this user?'))
    {
      const userId = sessionData.user_id
      try
      {
        const response = await fetch(`/api/deleteUser?userId=${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId }),
        })

        if (response.ok)
          logout().then(() => router.push('/'))
        else
          throw new Error('Failed to delete user')
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }

    setIsDel(false)
  }

  const handleEditSubmit = async () =>
  {
    console.log(editData)
    try
    {
      const res = await fetch('/api/masterLogin/updateProfile',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (!res.ok)
      {
        alert(`Error: Failed to update profile. Status: ${res.status}`)
        return
      }

      alert('Profile updated successfully!')
      setSessionData({ ...sessionData, ...editData })
      setIsEditModalOpen(false)
    } catch (error) {
      console.error('Update error:', error)
      alert('Something went wrong')
    }
  }

  return (
    <>
    <Paper sx={{ height: 'auto', width: '100%', padding: 3, marginBottom: 2 }}>
        <header className="bg-blue-600 text-white p-4 mb-3 rounded-lg shadow-md">
          <h1 className="text-xl font-semibold">Manage Profile</h1>
        </header>
      <div className="flex flex-col items-center p-8 bg-blue-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <UserCircleIcon className="w-20 h-20 text-gray-300" />
          </div>
          {sessionData && (
            <>
              <h1 className="text-3xl font-bold text-blue-700 mb-4">{sessionData.name}</h1>
              <div className="space-y-2">
                <p className="text-lg text-gray-700">Contact No: {sessionData.contact_num}</p>
                <p className="text-lg text-gray-700">Team: {sessionData.team === 1 ? "Task Force" : "Help Desk"}</p>
                <p className="text-lg text-gray-700">Email: {sessionData.email}</p>
              </div>
            </>
          )}
          <div className="mt-4 space-x-4">
            <button onClick={() => setIsPasswordModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
              Edit Profile
            </button>
            <button onClick={() =>
            {
              setIsDel(true)
              if (isDel)
                setIsPasswordModalOpen(true)
            }} className="bg-red-500 text-white px-4 py-2 rounded">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Master Password Required</h2>
            <input
              type="password"
              className="border p-2 w-full rounded-md"
              placeholder="Enter master password"
              value={password}
              onChange={ (e) => setPassword(e.target.value) }
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => 
                {
                  setIsPasswordModalOpen(false)
                  setPassword('')
                }}>Cancel</button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handlePasswordSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <label className="text-sm text-black">Full Name:</label>
            <input
              type="text"
              className="border p-2 w-full rounded-md mb-2"
              placeholder="Full Name"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
            <label className="text-sm text-black">Contact #:</label>
            <input
              type="text"
              className="border p-2 w-full rounded-md mb-2"
              placeholder="Contact Number"
              value={editData.contact_num}
              onChange={(e) => setEditData({ ...editData, contact_num: e.target.value })}
            />
            <label className="text-sm text-black">Password:</label>
            <input
              type="password"
              className="border p-2 w-full rounded-md mb-2"
              placeholder="Enter Current Password"
              value={editData.current_password}
              onChange={(e) => setEditData({ ...editData, current_password: e.target.value })}
            />
            <label className="text-sm text-black">New Password:</label>
            <input
              type="password"
              className="border p-2 w-full rounded-md mb-2"
              placeholder="Enter New Password"
              value={editData.new_password}
              onChange={(e) => setEditData({ ...editData, new_password: e.target.value })}
            />
            <label className="text-sm text-black">Email:</label>
            <input
              type="email"
              className="border p-2 w-full rounded-md mb-2"
              placeholder="Email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            />
            <label className="text-sm text-black">Team Role:</label>
            <select
              className="border p-2 w-full rounded-md mb-2"
              defaultValue={editData.team}
              onChange={(e) => setEditData({ ...editData, team: parseInt(e.target.value) })}
              required
            >
              <option value="0">Help Desk</option>
              <option value="1">Task Force</option>
            </select>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleEditSubmit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      </Paper>
    </>
  )
}