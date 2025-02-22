// components/UserCard.tsx
'use client';
import React from 'react';
import { User } from '@/app/lib/interfaces'

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps)
{
  return (
    <div className="bg-white rounded shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-700">{user.username}</h3>
      <p className="text-gray-600">Name: {user.name}</p> {/* Display the name */}
      <p className="text-gray-600">Role: {user.team === 1 ? "Task Force" : "Help Desk"}</p>
      <p className="text-gray-600">Contact: {user.contact_num}</p>
      <p className="text-gray-600">Email: {user.email}</p>
      <button className="text-blue-500" onClick={() => onEdit(user)}>Edit</button>
      <button className="text-red-500 ml-2" onClick={() => user.user_id && onDelete(user.user_id)}>Delete</button>
    </div>
  );
}