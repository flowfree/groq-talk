'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { type Thread } from '@/app/lib/types'
import { ThreadListItem, Avatar } from '@/app/components'
import { getThreads } from '../chat/actions'
import { 
  PlusIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon, 
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/20/solid'

export function Sidebar({
  mobile,
  desktop
}: {
  mobile?: boolean
  desktop?: boolean
}) {
  const [isMobile, setIsMobile] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [threads, setThreads] = useState<Thread[]>([])
  const pathname = usePathname()
  const { data: session } = useSession()

  const currentThreadId = pathname.replace('/chat/', '')

  useEffect(() => {
    async function fetchAllThreads() {
      const { threads } = await getThreads()
      if (threads) {
        setThreads(threads)
        document.title = 'New Chat'
        threads.map(t => {
          if (t.id === currentThreadId) {
            document.title = t.title
          }
        })
      }
    }
    session && fetchAllThreads()
  }, [pathname, showSidebar])

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobile && mobile) {
      setShowSidebar(false)
    }
    if (!isMobile && desktop) {
      setShowSidebar(true)
    }
  }, [isMobile])
  
  if (!showSidebar) {
    return (
      <>
        <button
          className="hidden sm:block fixed top-5 left-0 z-10 p-2 bg-gray-200 rounded-tr-md rounded-br-md border border-violet-300 border-l-0 text-black"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <ChevronDoubleRightIcon className="w-4 h-4" />
        </button>
        <button
          className="block sm:hidden fixed top-2 left-4 z-10 text-white"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
      </>
    )
  }

  return (
    <>
      <div className="sticky w-[250px] top-0 left-0 h-screen p-2 flex flex-col dark bg-violet-950 text-white z-10">
        <div className="grow">
          <div className="mt-2 flex flex-row gap-2 items-center">
            <Link href="/chat" className="grow py-2 px-4 rounded-md flex text-sm border border-violet-800 hover:border-violet-700 text-gray-200 outline-none">
              <div className="w-full flex flex-row gap-2 items-center">
                <PlusIcon className="w-4 h-4" />
                New Chat
              </div>
            </Link>
            <button 
              className="p-2 border border-violet-800 hover:border-violet-700 text-sm rounded-md outline-none"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <ChevronDoubleLeftIcon className="w-5 h-5" />
            </button>
          </div>

          <ul className="mt-2 flex flex-col overflow-hidden">
            {threads.map(({ id, title }) => (
              <ThreadListItem 
                key={id} 
                id={id} 
                title={title} 
                active={currentThreadId === id} 
              />
            ))}
          </ul>
        </div>

        <div className="p-2 pt-4 border-t border-stone-700">
          <div className="flex flex-row gap-2 items-center">
            <div className="shrink-0">
              <Avatar 
                role="user" 
                name={session?.user?.name || session?.user?.email} 
                image={session?.user?.image}
              />
            </div>
            <span className="grow text-sm overflow-hidden text-ellipsis">
              {session?.user?.name || session?.user?.email}
            </span>
            <button onClick={() => signOut()}>
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div 
        className="block sm:hidden absolute top-0 inset-0 w-screen bg-gray-400/90 z-[9]" 
        onClick={() => setShowSidebar(false)}
      />
    </>
  )
}
