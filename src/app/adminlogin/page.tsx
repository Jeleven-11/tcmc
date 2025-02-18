'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdArrowBack } from "react-icons/md";
import Image from 'next/image';

export default function Adminlogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/login_auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Login failed");
        return;
      }
      router.push('/admin');
    } catch (error) {
      console.log(error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen">
      <Image 
      src="/tangubpnplogo.jpeg"
       alt="Background" 
       layout="fill" 
       objectFit="cover" 
       className="absolute z-[-1] blur-md" 
       />
       
      <div className="bg-white/30 backdrop-blur-md p-8 rounded shadow-lg w-full max-w-sm relative">
        <Link href={"/"} className="text-black mb-4">
          <MdArrowBack size={16} />
        </Link>
        
        <h2 className="text-2xl font-heading text-blue-700 mb-4">Admin Login</h2>
        {error && <span className="text-red-800">{error}</span>}
        <form onSubmit={handleSubmit} className="relative">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Username or Phone Number</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border bg-gray-100 rounded px-3 py-2 w-full"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border bg-gray-100 rounded px-3 py-2 w-full pr-10"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}