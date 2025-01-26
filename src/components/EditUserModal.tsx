// components/EditUserModal.js
'use client';
import React, { useEffect, useState } from 'react';

interface User {
  id?: string;
  user_id?: string;
  username: string;
  name: string;
  password?: string;
  role: string;
  contact_num?: string;
}

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onUpdate }) =>
{
  const [username, setUsername] = useState(user.username);
  const [name, setName] = useState(user.name); // Include name field
  const [password, setPassword] = useState(user.password);
  const [role, setRole] = useState(user.role);
  const [contactNumber, setContactNumber] = useState(user.contact_num);

  useEffect(() => {
    setUsername(user.username);
    setName(user.name); // Initialize name
    setPassword(user.password);
    setRole(user.role);
    setContactNumber(user.contact_num);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updatedUser = { id: user.id, user_id: user.user_id, username, password, name, role, contact_num: contactNumber }; // Include id and name
    try {
      const response = await fetch(`/api/updateUser`, {
        method: 'PUT', // Ensure this is PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
      if (response.ok) {
        onUpdate(updatedUser); // Call the onUpdate callback with the updated user
        onClose(); // Close the modal
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded p-4 w-1/3">
        <h2 className="text-lg font-semibold">Edit User</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </label>
          <label className="block mb-2">
            Password:
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Corrected here
              className="border p-2 w-full"
              required
            />
          </label>

          <label className="block mb-2">
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </label>
          <label className="block mb-2">
            Role:
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </label>
          <label className="block mb-2">
            Contact Number:
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </label>
          <div className="flex justify-between mt-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Update
            </button>
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
