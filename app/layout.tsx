import React from "react"
import type { Metadata } from 'next'
import './globals.css'
import { ClarteThemeProvider } from "@/lib/clarte-theme-context"

export const metadata: Metadata = {
  title: 'Clarte - Voice AI that runs at the speed of thought',
  description: 'Leverage ultra-low latency synthesis and scalable APIs for real-time voice AI interactions. Built for engineers who build the future.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ClarteThemeProvider>
          {children}
        </ClarteThemeProvider>
      </body>
    </html>
  )
}
