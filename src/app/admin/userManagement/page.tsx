'use client';

import { useState, useEffect } from 'react';
import UserCard from '@/components/UserCard';
import EditUserModal from '@/components/EditUserModal';
import AddUserModal from '@/components/AddUserModal';
import Navbar from '@/components/adminNav';

interface User {
  id?: string
  username: string;
  name: string;
  role: string;
  contact_num?: string;
  password?: string;
  user_id?: string;
  email?: string;
  emailVerified?: boolean;
}

export default function UserManagement()
{
  const [users, setUsers] = useState<User[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [currentUser, setCurrentUser] = useState<User>()

  useEffect(() =>
  {
    const fetchUsers = async () =>
    {
      try
      {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/getUsers`)
        if (!res.ok)
          throw new Error('Failed to fetch users')

        const data = await res.json()
        setUsers(data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  const handleDelete = async (userId: string): Promise<void> =>
  {
    if (confirm("Are you sure you want to delete this user?"))
    {
      try
      {
        const response = await fetch(`/api/deleteUser?id=${userId}`, {
          method: 'DELETE',
        });
        if (response.ok)
          setUsers(users.filter((user: User) => user.id !== userId))
        else
          throw new Error('Failed to delete user')
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const handleEdit = (user: User): void =>
  {
    setCurrentUser(user)
    setIsEditing(true)
  }

  const handleUpdate = (updatedUser: User) => setUsers((prevUsers) => prevUsers.map((user) => (user.username === updatedUser.username ? updatedUser : user)))

  const closeModal = () =>
  {
    setIsEditing(false)
    setCurrentUser(undefined)
  }

  const handleAddUser = async (newUser: User) =>
  {
    try
    {
      const response = await fetch('/api/addUser',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      if (response.ok)
      {
        const addedUser = await response.json()
        console.log('Added user:', addedUser.user);

        setUsers([...users, addedUser.user])
        setIsAdding(false)
      } else throw new Error('Failed to add user')
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

  const closeAddUserModal = () => setIsAdding(false)

  return (
    <>
      <Navbar />
      <div className="bg-blue-50 p-6 min-h-screen">
        <header className="bg-blue-600 text-white p-4 rounded">
          <h1 className="text-xl">Admin Dashboard</h1>
        </header>
        <main className="mt-6">
          <section>
            <h2 className="text-lg text-blue-700">User Management</h2>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add User
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {users.map((user) => (
                <div key={user.username}>
                  <UserCard user={user} onEdit={handleEdit} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          </section>
        </main>
        {isEditing && currentUser && ( <EditUserModal user={currentUser} onClose={closeModal} onUpdate={handleUpdate} /> )}
        {isAdding && ( <AddUserModal onClose={closeAddUserModal} onAddUser={handleAddUser} /> )}
      </div>
    </>
  )
}