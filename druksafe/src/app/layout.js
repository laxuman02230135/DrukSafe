// app/layout.js
import "leaflet/dist/leaflet.css";
import './globals.css'
import "@/styles/dashboard.css";
import { Syne, DM_Sans } from 'next/font/google'

const syne = Syne({ 
  subsets: ['latin'], 
  variable: '--font-syne',
  weight: ['400', '700', '800']
})

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  variable: '--font-dm-sans',
  weight: ['300', '400', '500']
})

export const metadata = {
  title: 'DrukSafe — AI Flood Early Warning System',
  description: 'AI-powered flood prediction and early warning system for the Kingdom of Bhutan',
  keywords: 'flood prediction, AI, Bhutan, early warning system, disaster management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-blue-dark text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
