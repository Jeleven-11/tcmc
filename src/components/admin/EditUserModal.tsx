// components/EditUserModal.js
'use client';
import React, { useEffect, useState } from 'react';
import { User } from '@/app/lib/interfaces'

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onUpdate }) =>
{
  const [username, setUsername] = useState(user.username);
  const [name, setName] = useState(user.name); // Include name field
  const [newPassword, setNewPassword] = useState('');
  const [currPassword, setCurrPassword] = useState('');
  const [password, setPassword] = useState(user.password);
  const [team, setTeam] = useState(user.team);
  const [contactNumber, setContactNumber] = useState(user.contact_num);
  const [email, setEmail] = useState(user.email);
  const [message, setMessage] = useState('');

  useEffect(() => {
      setUsername(user.username);
      setName(user.name);
      setPassword(user.password);
      setTeam(user.team);
      setContactNumber(user.contact_num);
      setEmail(user.email);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let updatedUser = { user_id: user.user_id, username, currPassword, newPassword, password, name, team, contact_num: contactNumber, email }; // Include id and name
    try {
      const response = await fetch(`/api/masterLogin/updateUser`, {
        method: 'PUT', // Ensure this is PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      const result = await response.json();
      if (response.ok) {
          updatedUser = {
            ...user, 
            user_id: user.user_id,
            username,
            password: result.data.hPassword, 
            name, 
            team, 
            contact_num: contactNumber, 
            email,
            currPassword,
            newPassword
          };
      
        setMessage(JSON.stringify(result.message));
        setPassword(result.data.hPassword)
        onUpdate(updatedUser); // Call the onUpdate callback with the updated user
        onClose(); // Close the modal
      } else {
        setMessage(JSON.stringify(result.message));
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded p-4 w-1/3 min-w-[350px]">
        {message && <p className="text-red-500 text-sm mb-2">{message}</p>}
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
              disabled
            />
          </label>
          <label className="block mb-2">
          Current Password: <p className="text-sm"> (Type current password to change pass)</p>
            <input
              type="hidden"
              value={user.password}
              // onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full"
              disabled
            />
            <input
              type="password"
              placeholder="Type current password to change password"
              onChange={(e) => setCurrPassword(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </label>
          <label className="block mb-2">
            New Password:
            <input
              type="password"
              placeholder="Type new password"
              onChange={(e) => setNewPassword(e.target.value)} // Corrected here
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
            <select
              className="border p-2 w-full rounded-md mb-2"
              value={team}
              onChange={(e) => setTeam(parseInt(e.target.value))}
              required
            >
              <option value="0">Help Desk</option>
              <option value="1">Task Force</option>
            </select>
            {/* <input
              type="text"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="border p-2 w-full"
              required
            /> */}
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
          <label className="block mb-2">
            Email:
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
