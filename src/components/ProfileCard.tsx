// components/ProfileCard.js
'use client';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface User {
  name: string;
  contactNum: string;
  role: string;
}

interface ProfileCardProps {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onEdit, onDelete }) => {
  if (!user) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
      <div className="mb-6 flex justify-center">
        <UserCircleIcon className="w-20 h-20 text-gray-300" />
      </div>
      <h1 className="text-3xl font-bold text-blue-700 mb-4">{user.name}</h1>
      <div className="space-y-2">
        <p className="text-lg text-gray-700">Contact No: {user.contactNum}</p>
        <p className="text-lg text-gray-700">Role: {user.role}</p>
      </div>
      <div className="mt-4 space-x-4">
        <button onClick={onEdit} className="bg-blue-500 text-white px-4 py-2 rounded">
          Edit Profile
        </button>
        <button onClick={onDelete} className="bg-red-500 text-white px-4 py-2 rounded">
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
