'use client';

import React, { useState } from 'react';

interface AddUserModalProps {
  onClose: () => void;
  onAddUser: (user: { 
    id?: string
    username: string;
    name: string;
    team: number;
    contact_num?: string;
    password: string;
    user_id?: string;
    email?: string;
    emailVerified?: number;
    fcmToken?: string
  }) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAddUser }) => {
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    team: 0,
    contact_num: '',
    password: '',
    email: '',
    emailVerified: 0,
    fcmToken: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser((prevUser) => ({
      ...prevUser,
      [name]: name === "team" ? Number(value) : value,
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
          <label className="text-sm text-black">Username:</label>
          <input
            type="text"
            name="username"
            value={newUser.username}
            onChange={handleChange}
            placeholder="Enter username"
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            autoComplete="username" // Auto-fill suggestion for username
            required
          />
          <label className="text-sm text-black">Full Name:</label>
          <input
            type="text"
            name="name"
            value={newUser.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            autoComplete="name" // Auto-fill suggestion for full name
            required
          />
          <label className="text-sm text-black">Team Role:</label>
          <select
            name="team"
            onChange={handleChange}
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            required
          >
            <option value="">- Select Role -</option>
            <option value="0">Help Desk</option>
            <option value="1">Task Force</option>
          </select>
          <label className="text-sm text-black">Contact #:</label>
          <input
            type="text"
            name="contact_num"
            value={newUser.contact_num}
            onChange={handleChange}
            placeholder="Enter contact number"
            className="w-full p-2 mb-2 border border-gray-300 rounded"
            autoComplete="tel" // Auto-fill suggestion for phone number
            maxLength={11} // Ensure 11 digits for contact number
            required
          />
          <label className="text-sm text-black">Password:</label>
          <input
            type="password"
            name="password"
            value={newUser.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            autoComplete="new-password" // Auto-fill suggestion for password
            required
          />
          <label className="text-sm text-black">Email:</label>
          <input
            type="email"
            name="email"
            value={newUser.email}
            onChange={handleChange}
            placeholder="Enter email"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            autoComplete="new-password" // Auto-fill suggestion for password
            required
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
