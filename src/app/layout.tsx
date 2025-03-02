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
    <html>
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