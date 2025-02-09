// app/layout.js (or app/layout.tsx if using TypeScript)
'use client'

// import { SessionProvider } from 'next-auth/react';
import './globals.css'; // Adjust path if needed

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html>
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}