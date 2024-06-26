import '../../public/css/globals.css'
import type { Metadata } from 'next'
import LocalFont from 'next/font/local'
import { getServerSession } from 'next-auth'

import SessionProvider from './components/session-provider'
import { TopNav, Sidebar } from '@/app/components'

const inter = LocalFont({
  src: '../../public/fonts/Inter-Variable.ttf'
})

export const metadata: Metadata = {
  title: 'GroqTalk',
  description: 'Chat with advanced LLM models via Groq API.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  return (
    <html lang="en">
      <body className={`${inter.className} w-full h-screen antialiased`}>
        <SessionProvider session={session}>
          {session ? (
            <div className="flex flex-row min-h-screen">
              <div className="hidden sm:block shrink-0">
                <Sidebar desktop={true} />
              </div>
              <div className="grow flex flex-col">
                {children}
                <TopNav />
              </div>
            </div>
          ) : (
            <div className="w-full h-screen">
              {children}
            </div>
          )}
        </SessionProvider>
      </body>
    </html>
  )
}
