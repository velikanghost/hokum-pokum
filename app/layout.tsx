import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.scss'
import Navbar from './components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Heekowave',
  description: 'Enabling payments on 10k real TPS',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  //1C4641
  //bg-secondary-foreground
  return (
    <html lang="en">
      <body className={`${inter.className}  bg-[#1F2026]`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
