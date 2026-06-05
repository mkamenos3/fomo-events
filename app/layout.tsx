import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'FOMO — Cyprus Events',
  description: 'The best parties, festivals & live events across Cyprus. Get your tickets before it sells out.',
  openGraph: {
    title: 'FOMO — Cyprus Events',
    description: 'Get tickets before they\'re gone.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
