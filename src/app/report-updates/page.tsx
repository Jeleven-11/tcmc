'use client';

import Nav from '@/components/Nav';
import CheckUpdates from '../../components/reportUpdate';
import React, { Suspense } from 'react';

const ReportUpdates = () =>
{
  return (
    <>
      <header>
        <Nav />
      </header>

      <main className="container mx-auto p-6">
        <Suspense
          fallback={
            <div className="flex gap-6 justify-center mt-32">
              <div className='flex space-x-2 justify-center items-center bg-white h-screen dark:invert'>
                <span className='sr-only'>Loading...</span>
                  <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                <div className='h-8 w-8 bg-black rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                <div className='h-8 w-8 bg-black rounded-full animate-bounce'></div>
              </div>
            </div>
          }
        >
          <CheckUpdates />
        </Suspense>
      </main>
    </>
  );
};

export default ReportUpdates;