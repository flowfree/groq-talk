'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { type Thread } from '@/app/lib/types'
import { Avatar, TypeWriter } from '@/app/components'
import { 
  getThreads, 
  renameThread, 
  deleteThread,
  suggestNewThreadTitle
} from '../chat/actions'

import { 
  ChatBubbleLeftIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
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
          className="hidden sm:block fixed top-2 left-0 z-10 p-2 bg-gray-200 rounded-tr-md rounded-br-md border border-gray-300 border-l-0 text-black"
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
      <div className="sticky w-[250px] top-0 left-0 h-screen p-2 flex flex-col dark bg-stone-900 text-white z-10">
        <div className="grow">
          <div className="flex flex-row gap-2 items-center">
            <Link href="/chat" className="grow py-2 px-4 rounded-md flex text-sm border border-stone-600 hover:border-stone-500 text-gray-200">
              <div className="w-full flex gap-2 items-center">
                <PlusIcon className="w-4 h-4" />
                New Chat
              </div>
            </Link>
            <button 
              className="p-2 border border-stone-600 hover:border-stone-500 text-sm rounded-md underline"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <ChevronDoubleLeftIcon className="w-4 h-4" />
            </button>
          </div>

          <ul className="mt-6 flex flex-col overflow-hidden">
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

function ThreadListItem({
  id,
  title,
  active
}: {
  id: string
  title: string
  active: boolean
}) {
  enum Mode {
    Normal,
    Editing,
    DeleteConfirmation,
    Deleting,
    AutoTyping
  }

  const [mode, setMode] = useState<Mode>(Mode.Normal)
  const [displayTitle, setDisplayTitle] = useState(title)
  const [editTitle, setEditTitle] = useState(title)
  const [isDeleted, setIsDeleted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchSuggestionTitle() {
      const { title } = await suggestNewThreadTitle(id)
      if (title) {
        const { success } = await renameThread(id, title) 
        if (success) {
          setDisplayTitle(title)
          setEditTitle(title)
          setMode(Mode.AutoTyping)
        } else {
          setDisplayTitle(editTitle)
        }
      }
    }

    if (active && displayTitle === 'New Chat') {
      fetchSuggestionTitle()
    }
  }, [active, displayTitle])

  async function handleRename(e?: React.FormEvent) {
    if (e) {
      e.preventDefault()
    }
    const { success } = await renameThread(id, editTitle) 
    setDisplayTitle(editTitle)
    document.title = editTitle
    setMode(Mode.Normal)
  }

  async function handleDelete() {
    setMode(Mode.Deleting)
    const { success } = await deleteThread(id)
    if (success) {
      setIsDeleted(true)
      router.push('/chat')
    }
  }

  if (isDeleted) {
    return null
  }

  return (
    <li className={`${active ? 'rounded-md bg-stone-800' : ''} text-gray-300 px-2 py-3 text-sm w-full`}>
      <div className="flex gap-2 items-center">
        <ChatBubbleLeftIcon className="shrink-0 w-5 h-5" />

        {mode === Mode.Editing ? (
          <form onSubmit={handleRename}>
            <input 
              type="text" 
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="w-full bg-stone-800 border border-blue-700 outline-none"
            />
          </form>
        ) : (mode === Mode.AutoTyping ? (
          <TypeWriter 
            text={displayTitle} 
            runIndefinitely={false} 
            onCompleted={() => {
              setMode(Mode.Normal)
              document.title = displayTitle
            }}
          />
        ) : (
          <Link href={`/chat/${id}`} className="grow line-clamp-1" title={displayTitle}>
            {displayTitle}
          </Link>
        ))}

        {mode === Mode.Editing && (
          <div className="flex gap-2 items-center">
            <button 
              onClick={handleRename}
            >
              <CheckIcon className="w-4 h-4 hover:text-green-400" />
            </button>
            <button onClick={() => setMode(Mode.Normal)}>
              <XMarkIcon className="w-4 h-4 hover:text-red-400" />
            </button>
          </div>
        )}

        {mode === Mode.Normal && active && displayTitle !== 'New Chat' && (
          <div className="flex gap-2 items-center">
            <button onClick={() => setMode(Mode.Editing)}>
              <PencilIcon className="w-4 h-4" />
            </button>
            <button onClick={() => setMode(Mode.DeleteConfirmation)}>
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {mode === Mode.DeleteConfirmation && (
        <div className="p-2 m-2 rounded-sm bg-red-100 text-red-900 text-sm">
          <p>
            Chat will be deleted. Are you sure?
          </p>
          <p className="mt-2 flex flex-row-reverse gap-2">
            <button 
              className="px-1 flex gap-1 items-center rounded-md text-green-800 border border-green-600/50 hover:border-green-600 text-xs"
              onClick={() => setMode(Mode.Normal)}
            >
              <XMarkIcon className="w-4 h-4" />
              No
            </button>
            <button 
              className="px-1 flex gap-1 items-center rounded-md border border-red-400/50 hover:border-red-400 text-xs"
              onClick={handleDelete}
            >
              <CheckIcon className="w-4 h-4" />
              Yes
            </button>
          </p>
        </div>
      )}

      {mode === Mode.Deleting && (
        <div className="p-2 m-2 rounded-sm bg-red-100 text-red-900 text-sm">
          Deleting chat...
        </div>
      )}
    </li>
  )
}
