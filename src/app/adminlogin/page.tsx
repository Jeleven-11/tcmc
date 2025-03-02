'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@mui/material/Button';
import { MdArrowBack } from "react-icons/md";
import Image from 'next/image';
import { getSession } from '../lib/actions';
import OTPInput from '@/components/OTPInput';
type ButtonActionType = 'login' | 'reset' | 'code' | 'save';
export default function Adminlogin()
{ 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const attemptCounter = useRef<number>(0)
  const [color, setColor] = useState<string>("text-red-800")
  const [resetCode, setResetCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isResetSent, setIsResetSent] = useState<boolean>(false);
  const [isResetWaiting, setIsResetWaiting] = useState<boolean>(false);
  const [isSaveWaiting, setIsSaveWaiting] = useState<boolean>(false);
  const [isVerifyWaiting, setIsVerifyWaiting] = useState<boolean>(false);
  const [loginNotAllowed, setLoginNotAllowed] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  // const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  // const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // const [notification, setNotification] = useState<{ message: string, severity: 'error' | 'success' } | null>(null);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() =>
  {
    setIsClient(true)
    getSession().then((session) =>
    {
      if (session.isLoggedIn)
      {
        // setIsLoggedIn(true)
        router.push('/admin')
      }
    })
  }, [router])

  if (!isClient)
    return null
  const handleOtpComplete = (otp: string) => {
    console.log('Entered OTP:', otp);
    setInputCode(otp)
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const action = submitter?.value as ButtonActionType | undefined;
    // Validate we have a valid action
    if (!action || !['login', 'reset', 'code', 'save'].includes(action)) {
      console.error('Invalid action type');
      return;
    }
    if(action === 'login'){
      try {
        setIsLoggingIn(true)
        const response = await fetch("/api/login_auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const result = await response.json();
        if (!response.ok) {
          // setNotification({ message: result.message, severity: 'error' });
          attemptCounter.current += 1
          if(attemptCounter.current >= 4 && attemptCounter.current <= 9){
            setError(`You will be locked out after ${10-attemptCounter.current} more incorrect attempts`);
          } else if (attemptCounter.current >= 10){
            setError(`You have been locked, you may try to reset your password below.`);
            setLoginNotAllowed(true);
          } else
          setError(result.message || "Login failed");
          return;
        }
        // setNotification({ message: 'Logged In', severity: 'success' });
        router.push('/admin');
      } catch (error) {
        console.log(error);
        // setNotification({ message: 'An error occurred. Please try again', severity: 'error' });
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoggingIn(false);
      } 
    }
    else if (action === 'reset'){
      try {
        setIsResetWaiting(true);
        const response = await fetch("/api/sendResetPasswordCode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        setIsResetSent(true)
        const result = await response.json();
        if (!response.ok) {
          // setNotification({ message: result.message, severity: 'error' });
          setError("Email not found");
          router.push('/');
          return;
        }
        console.log("Token: ", result.token)
        setColor("text-black-800")
        setError("A reset code was sent to "+email);
        setResetCode(result.token)
        setIsResetWaiting(false);
      } catch (error) {
        console.log(error);
        setError("An error occurred. Please try again.");
      } 
    } else if (action === 'code'){
      try {
        setIsVerifyWaiting(true);
        const response = await fetch("/api/verifyResetPasswordCode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resetCode, inputCode }),
        });
        // setIsVerifySent(true)
        await response.json();
        if (!response.ok) {
          // setNotification({ message: result.message, severity: 'error' });
          setError("Invalid Code");
          router.push('/');
          return;
        }
        setPassword('')
        setError("");
        // setColor("text-red-800")
        setIsEmailVerified(true);
      } catch (error) {
        console.log(error);
        setError("An error occurred. Please try again.");
      } 
    } else if (action === 'save'){
      try {
        setIsSaveWaiting(true);
        const response = await fetch("/api/setNewPassword", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, email }),
        });
        // setIsVerifySent(true)
        await response.json();
        if (!response.ok) {
          // setNotification({ message: result.message, severity: 'error' });
          setError("User not found");
          // router.push('/');
          return;
        }
        setError("Password have been reset successfully");
        setPassword('')
        setUsername('')
        attemptCounter.current = 0;
        setLoginNotAllowed(false);
      } catch (error) {
        console.log(error);
        setError("An error occurred. Please try again.");
      } 
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
       
      <div className="bg-white/70 backdrop-blur-md p-8 rounded shadow-lg w-full max-w-sm relative">
        <Link href={"/"} className="text-black mb-4">
          <MdArrowBack size={16} />
        </Link>
        
        <h2 className="text-2xl font-heading text-blue-700 mb-4">Admin Login</h2>
        {error && <span className={color}>{error}</span>}
        
        <form onSubmit={handleSubmit} className="relative">
        {(!loginNotAllowed)?(
          <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Username or Phone Number</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border bg-gray-100 rounded px-3 py-2 w-full"
              required
              disabled={loginNotAllowed}
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
              disabled={loginNotAllowed}
            />
          </div>
            <Button
            name="action" value="login"
            variant="contained" disableElevation
            type="submit"
            loading={isLoggingIn}
            className='w-full'
            // className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            disabled={loginNotAllowed}
          >
            Sign In
          </Button>
          </>):(
            <>
            <div className="mb-6">
              {(isResetSent)?
                (
                  (isEmailVerified)?
                  (
                    <>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input
                        type='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border bg-gray-100 rounded px-3 py-2 w-full pr-10"
                        required
                      />
                      </>
                  ):
                  (
                    <>
                  
                  <label className="block text-sm font-medium mb-2">Enter Code</label>
                  <OTPInput length={6} onComplete={handleOtpComplete} />
                  </>
                  )
                  
                  
                ):(  
                  
                    <>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type='email'
                        value={email}
                        placeholder= 'This email will receive a 6-digit code'
                        onChange={(e) => setEmail(e.target.value)}
                        className="border bg-gray-100 rounded px-3 py-2 w-full pr-10"
                        required
                      />
                    </>
                  
                )
              }
            </div>
            {(isResetSent)?(
              (isEmailVerified)?(
              <Button name="action" value="save" type="submit" variant="contained" className='w-full' loading={isSaveWaiting} disabled={inputCode===''} disableElevation>
                Save Password
              </Button>
              ):(
              <Button name="action" value="code" type="submit" variant="contained" className='w-full' loading={isVerifyWaiting} disabled={inputCode===''} disableElevation>
                Verify Code
              </Button>)):(
              <Button name="action" value="reset" type="submit" variant="contained" className='w-full' loading={isResetWaiting} disableElevation>
                Reset Password
              </Button>
            )}
            </>
          )}
        </form>
      </div>
    </div>
  );
}