'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
// import jwt from "jsonwebtoken";
//import prisma from "@/app/lib/db";
// interface User {
//     id: string
//     username: string;
//     name?: string;
//     role?: string;
//     contactNum?: string;
//     password: string;
//     user_id?: string;
//     emailVerified?: boolean
// }
export default function LoginPage()
{
    const [inp, setInp] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter()
    const handleLogin = async (e: React.FormEvent) =>
    {
        e.preventDefault();

        try
        {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inp, password }),
            });

            if (response.ok){
                //router.push("/admin"); // edirect to dashboard after successful login
                // setError("Login successful");
                const result = await response.json(); // Parse response JSON if successful
                
                console.log(result); // Log the result to the console
                console.log(result.token)
                // const decoded = jwt.verify(result.token, process.env.AUTH_SECRETKEY!) as User;
                // if(decoded.role === 'admin'){
                    
                // }
                document.cookie = `token=${result.token}; path=/admin`
                router.push('/admin')
            }           
            else {
                const data = await response.json();
                setError(data.message || "Login failed");
            }
        } catch (error) {
            console.log(error)
            setError("An error occurred. Please try again.");
        }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Username or Phone Number</label>
            <input
              type="in"
              value={inp}
              onChange={(e) => setInp(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}