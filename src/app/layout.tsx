import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cerebruh - Your Cognitive Infrastructure',
  description: 'A second brain for your digital life',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  )
}