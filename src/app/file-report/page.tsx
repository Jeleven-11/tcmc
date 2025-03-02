'use client'

import React from 'react';
import Nav from '@/components/Nav';
import ReportForm from '@/components/reportform';
import { EdgeStoreProvider } from '@/app/lib/edgestore';

export default function FileReport()
{
  return (
    <>
      <EdgeStoreProvider>
        <div className="flex flex-col min-h-screen">
          {/* Navigation */}
          <Nav />
          {/* Main Content */}
          <main className="flex-grow container mx-auto px-4 py-5 bg-gray-50">
            <ReportForm />
          </main>
        </div>
      </EdgeStoreProvider>
    </>
  );
}