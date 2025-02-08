import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GlobalNews',
  description: 'A modern web application for viewing global news with an interactive globe visualization.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
