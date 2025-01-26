'use client'

import React from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
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
          <main className="flex-grow container mx-auto px-4 py-8 bg-gray-50">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">File a Report</h1>
              <ReportForm />
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </EdgeStoreProvider>
    </>
  );
}