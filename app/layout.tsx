import type { Metadata } from 'next'
import './globals.scss'
import Navbar from './components/Navbar'

export const metadata: Metadata = {
  title: 'Heekowave',
  description: 'Enabling payments on 10k real TPS',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`  bg-[#1F2026]`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
