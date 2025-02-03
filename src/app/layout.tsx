// app/layout.js (or app/layout.tsx if using TypeScript)
'use client'

// import { SessionProvider } from 'next-auth/react';
import './globals.css'; // Adjust path if needed
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html>
      <body>
        {/* <SessionProvider> */}

          <main>
            {children}
          </main>
        {/* </SessionProvider> */}
      </body>
    </html>
  )
}