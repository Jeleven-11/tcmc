'use client';

import { useState, useEffect } from 'react';
import UserCard from '@/components/admin/UserCard';
import EditUserModal from '@/components/admin/EditUserModal';
import AddUserModal from '@/components/admin/AddUserModal';
import { User } from '@/app/lib/interfaces'
import { Paper } from '@mui/material';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingAction, setPendingAction] = useState<'edit' | 'add' | 'delete' | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/getUsers`);
      if (!res.ok) throw new Error('Failed to fetch users');

      const data = await res.json();

      const usersWithId = data.map((user: User, index: number) => ({
        ...user,
        user_id: user.user_id || `temp-id-${index}`,
      }));

      setUsers(usersWithId);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      return;
    }
    fetchUsers();
  }, [isMounted]);

  const verifyMasterPassword = async (): Promise<boolean> => {
    const res = await fetch('/api/masterLogin', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      alert('Incorrect password');
      return false;
    }

    return true;
  };

  const handleEdit = (user: User): void => {
    setPendingAction('edit');
    setCurrentUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleDelete = (userId: string): void => {
    setPendingAction('delete');
    setPendingUserId(userId);
    setIsPasswordModalOpen(true);
  };

  const handleAddUser = (): void => {
    setPendingAction('add');
    setIsPasswordModalOpen(true);
  };

  const handleAddUserSubmit = async (newUser: User) => {
    try {
      const response = await fetch(`/api/users/addUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add user');
      }
  
      // const addedUser = await response.json();
  
      // setUsers([...users, { ...addedUser, id: addedUser.user_id }]); // Ensure ID consistency
      // closeAddUserModal();

      fetchUsers()
      closeAddUserModal();
    } catch (error) {
      console.error('Error adding user:', error);
    } finally {
      closeAddUserModal()
    }
  };

  const executePendingAction = async () => {
    const isVerified = await verifyMasterPassword();
    if (!isVerified) return;

    setIsPasswordModalOpen(false);
    setPassword('');

    switch (pendingAction) {
      case 'edit':
        if (currentUser) setIsEditing(true);
        break;
      case 'delete':
        if (pendingUserId) {

          if (confirm('Are you sure you want to delete this user?')) {
            try {
              const response = await fetch(`/api/users/deleteUser?userId=${pendingUserId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: pendingUserId }),
              });
              if (response.ok)
                setUsers(users.filter((user: User) => user.user_id !== pendingUserId));
              else throw new Error('Failed to delete user');
            } catch (error) {
              console.error('Error deleting user:', error);
            }
          }
          // try {
          //   const response = await fetch(`/api/users/deleteUser?userId=${pendingUserId}`, { method: 'POST' });
          //   if (response.ok) setUsers(users.filter((user: User) => user.user_id  !== pendingUserId));
          //   else throw new Error('Failed to delete user');
          // } catch (error) {
          //   console.error('Error deleting user:', error);
          // }
        }
        break;
      case 'add':
        setIsAdding(true);
        break;
      default:
        break;
    }

    setPendingAction(null);
    setPendingUserId(null);
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setCurrentUser(null);
  };

  const closeAddUserModal = () => setIsAdding(false);

  return (
    <>
      <Paper sx={{ height: 'auto', width: '100%', padding: 3, marginBottom: 2 }}>
        <header className="bg-blue-600 text-white p-4 rounded-lg shadow-md">
          <h1 className="text-xl font-semibold">Users List</h1>
        </header>
        <section className="mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800"></h2>
            <button
              onClick={handleAddUser}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add User
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {users.map((user, index) => (
              <div key={user.user_id || `user-${index}`} className="bg-white border dark:border-gray-200 rounded-lg shadow-sm p-4">
                <UserCard user={user} onEdit={handleEdit} onDelete={() => handleDelete(user.user_id || '')} />
              </div>
            ))}
          </div>
        </section>
        {isEditing && currentUser && <EditUserModal user={currentUser} onClose={closeEditModal} onUpdate={(updatedUser) => {
          setUsers(users.map(user => user.user_id === updatedUser.user_id ? updatedUser : user));
          closeEditModal();
        }} />}
        {/* {isAdding && <AddUserModal onClose={closeAddUserModal} onAddUser={(newUser) => setUsers([...users, newUser])} />} */}
        {isAdding && <AddUserModal onClose={closeAddUserModal} onAddUser={handleAddUserSubmit} />}

        {/* Master Password Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-lg">
              <h2 className="text-xl font-bold mb-4">Master Password Required</h2>
              <input
                type="password"
                className="border p-2 w-full rounded-md"
                placeholder="Enter master password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPassword('');
                    setPendingAction(null);
                  }}
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={executePendingAction}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </Paper>
    </>
  );
}
