'use client';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CheckUpdates from '../../components/reportUpdate';
import React from 'react';

const ReportUpdates = () =>
{
  return (
    <>
      <header>
        <Nav />
      </header>

      <main className="container mx-auto p-6">
        <CheckUpdates />
      </main>

      <footer>
        <Footer />
      </footer>
    </>
  );
};

export default ReportUpdates;