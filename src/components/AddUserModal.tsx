'use client';

import React, { useState } from 'react';

interface AddUserModalProps {
  onClose: () => void;
  onAddUser: (user: { 
    id?: string
    username: string;
    name: string;
    role: string;
    contact_num?: string;
    password?: string;
    user_id?: string;
    email?: string;
    emailVerified?: boolean;
  }) => void;
}
const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAddUser }) => {
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    role: '',
    contact_num: '',
    password: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onAddUser(newUser);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl">Add New User</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <input
            type="text"
            name="username"
            value={newUser.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            autoComplete="username" // Auto-fill suggestion for username
          />
          <input
            type="text"
            name="name"
            value={newUser.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            autoComplete="name" // Auto-fill suggestion for full name
          />
          <select
            name="role"
            value={newUser.role}
            onChange={handleChange}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            autoComplete="off" // Turn off autofill for role
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <input
            type="text"
            name="contact_num"
            value={newUser.contact_num}
            onChange={handleChange}
            placeholder="Contact Number"
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            autoComplete="tel" // Auto-fill suggestion for phone number
            maxLength={11} // Ensure 11 digits for contact number
          />
          <input
            type="password"
            name="password"
            value={newUser.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            autoComplete="new-password" // Auto-fill suggestion for password
          />
          <input
            type="text"
            name="email"
            value={newUser.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            autoComplete="new-password" // Auto-fill suggestion for password
          />
          <div className="flex justify-between">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Add User</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
