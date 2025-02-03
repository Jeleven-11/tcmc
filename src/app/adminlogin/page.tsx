'use client'

// import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdArrowBack } from "react-icons/md";

// interface EyeIconProps {
//   isVisible: boolean;
//   onClick: () => void;
// }

// const EyeIcon = ({ isVisible, onClick }: EyeIconProps) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
//     style={{ top: 'calc(50% + 2px)' }} // Adjust the vertical position
//   >
//     {isVisible ? '🙈' : '👁️'}
//   </button>
// );

export default function Adminlogin()
{
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  // const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() =>
  {
    setIsClient(true)
  }, [])

  if (!isClient)
    return null // Prevent server-client mismatch by not rendering until the client-side check is complete

  // interface SignInResult
  // {
  //   error?: string | null
  //   ok?: boolean
  // }

  // interface UserRoleResponse
  // {
  //   role: string
  //   error?: string
  // }

  const handleSubmit = async (e: React.FormEvent) =>
  {
    e.preventDefault()
    try{
      const response = await fetch("/api/login_auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
      const result = await response.json(); // Parse response JSON if successful
      if(!response.ok){
        setError(result.message || "Login failed");
      }
      
      // setError(result.message)
      // document.cookie = `token=${result.token}; path=/admin`
      router.push('/admin')
      return
      console.log(result); // Log the result to the console
      console.log(result.token)
      //document.cookie = `token=${result.token}; path=/admin`
      if (response.ok) // 200 status code
        router.push('/admin')
    } catch (error){
      console.log(error)
      setError("An error occurred. Please try again.");
    }
    // const data = { username, password }
    // console.log(data);
    // const result: SignInResult | undefined = await signIn('credentials',
    // {
    //   redirect: false,
    //   username,
    //   password,
    //   id: '1',
    // })

    // if (result && result.error)
    //   setError(result.error); // Set error message from NextAuth
    // else if (result && result.ok)
    // {
    //   // Fetch the user role from the server after login
    //   const response = await fetch('/api/getUserRole',
    //   {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ username }),
    //   });

    //   if (!response.ok)
    //   {
    //     const errorData: UserRoleResponse = await response.json()
    //     setError(errorData.error || 'Failed to fetch user role')
    //     return // Stop further actions if the API call fails
    //   }

    //   const data: UserRoleResponse = await response.json()
    //   // Check if the user role is "admin"
    //   if (data.role !== 'admin')
    //   {
    //     setError('Account must be admin') // Set an error message for non-admin accounts
    //     return // Prevent further actions
    //   }

    //   router.push('/admin') // Redirect to admin dashboard on successful login and admin role
    // }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-blue-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <Link href={"/"} className="text-black">
          <MdArrowBack size={16} />
        </Link>
        <h2 className="text-2xl font-heading text-blue-700 mb-4">Admin Login</h2>
        <span className="text-red-800">{error}</span>
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
                // type={showPassword ? 'text' : 'password'}
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border bg-gray-100 rounded px-3 py-2 w-full pr-10"
              required
            />
            {/* <EyeIcon isVisible={showPassword} onClick={() => setShowPassword(!showPassword)} /> */}
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
