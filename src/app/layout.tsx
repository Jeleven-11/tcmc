'use client'

import Footer from '@/components/Footer';
import './globals.css';
import DynamicTitlePage from '@/components/DynamicPageTitleHandler';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <DynamicTitlePage />
      <body>
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}